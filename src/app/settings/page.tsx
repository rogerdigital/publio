'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  Unplug,
  Zap,
  Bot,
  Sparkles,
} from 'lucide-react';

import AppShellHeader from '@/components/layout/AppShellHeader';
import SurfaceCard from '@/components/layout/SurfaceCard';
import { getPlatformConnectionProfiles } from '@/lib/platformConnections/profiles';
import type {
  PlatformConnectionMode,
  PlatformConnectionRecord,
} from '@/lib/platformConnections/types';
import type { PlatformId } from '@/types';
import {
  getCachedSettingsPageData,
  loadSettingsPageData,
  setCachedSettingsPageData,
} from '@/lib/navigationDataCache';
import { useToastStore } from '@/stores/toastStore';
import PromptEditor from '@/components/settings/PromptEditor';
import {
  VERIFY_ONLY_PLATFORMS,
  formatRelativeTime,
  platformConfigs,
  statusLabels,
} from './platformSettings';
import * as styles from './settings.css';

interface CheckState {
  checking: boolean;
  ok?: boolean;
  failureReason?: string;
  accountName?: string;
  checkedAt?: string;
}

interface DisconnectState {
  disconnecting: boolean;
  done?: boolean;
}

function CheckResult({
  checkState,
  connectionRecord,
  disconnectDone,
}: {
  checkState?: CheckState;
  connectionRecord?: PlatformConnectionRecord;
  disconnectDone?: boolean;
}) {
  if (checkState && !checkState.checking) {
    if (checkState.ok) {
      return (
        <p className={styles.checkResultOk}>
          <CheckCircle2 size={13} />
          {checkState.accountName ? `连接正常（${checkState.accountName}）` : '连接正常'}
        </p>
      );
    }
    return (
      <p className={styles.checkResultFail}>连接异常：{checkState.failureReason ?? '未知原因'}</p>
    );
  }

  if (disconnectDone) {
    return <p className={styles.checkResultOk}>连接记录已清除</p>;
  }

  if (connectionRecord?.lastCheckedAt) {
    const timeAgo = formatRelativeTime(connectionRecord.lastCheckedAt);
    if (connectionRecord.failureReason) {
      return (
        <p className={styles.checkResultFail}>
          上次验证（{timeAgo}）失败：{connectionRecord.failureReason}
        </p>
      );
    }
    return (
      <p className={styles.checkResultOk}>
        <CheckCircle2 size={13} />
        {connectionRecord.accountName ? `${connectionRecord.accountName} · ` : ''}上次验证：
        {timeAgo}
      </p>
    );
  }

  return null;
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const cachedData = getCachedSettingsPageData();
  const [values, setValues] = useState<Record<string, string>>(() => cachedData?.values ?? {});
  const [initialValues, setInitialValues] = useState<Record<string, string>>(
    () => cachedData?.values ?? {},
  );
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>(platformConfigs[0].id);
  const [errorMessage, setErrorMessage] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [loading, setLoading] = useState(!cachedData);
  const [checkStates, setCheckStates] = useState<Record<string, CheckState>>({});
  const [disconnectStates, setDisconnectStates] = useState<Record<string, DisconnectState>>({});
  const [connectionRecords, setConnectionRecords] = useState<
    Record<PlatformId, PlatformConnectionRecord>
  >(() => cachedData?.connectionRecords ?? ({} as Record<PlatformId, PlatformConnectionRecord>));
  const [agentTestResult, setAgentTestResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const [agentTesting, setAgentTesting] = useState(false);
  const connectionProfiles = getPlatformConnectionProfiles(values);

  // 检测 OAuth callback 后的 ?connected= 参数
  useEffect(() => {
    const connected = searchParams.get('connected') as PlatformId | null;
    const error = searchParams.get('error');
    if (connected) {
      const platformName = platformConfigs.find((p) => p.id === connected)?.name ?? connected;
      setNoticeMessage(`${platformName} 授权成功，连接已建立。`);
      setSelectedItem(connected);
    } else if (error) {
      setErrorMessage(`授权失败：${decodeURIComponent(error)}`);
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        if (!getCachedSettingsPageData()) setLoading(true);
        setErrorMessage('');
        const data = await loadSettingsPageData();

        if (!cancelled) {
          setValues(data.values);
          setInitialValues(data.values);
          setConnectionRecords(data.connectionRecords);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : '加载设置失败，请稍后重试');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  const isDirty = Object.keys(values).some((key) => values[key] !== initialValues[key]);
  const dirtyCount = Object.keys(values).filter((key) => values[key] !== initialValues[key]).length;

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setErrorMessage('');
    setNoticeMessage('');
  }

  function toggleSecret(key: string) {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleConnectionAction(
    platformId: PlatformId,
    platformName: string,
    mode: PlatformConnectionMode,
  ) {
    setSaved(false);
    setErrorMessage('');
    setNoticeMessage('');

    if (mode !== 'oauth') {
      setNoticeMessage(`${platformName} 当前使用登录态连接，请在下方完成配置。`);
      return;
    }

    // 微信/X 不走 OAuth redirect，直接验证连接
    if (VERIFY_ONLY_PLATFORMS.has(platformId)) {
      await handleCheckConnection(platformId);
      return;
    }

    try {
      const res = await fetch(`/api/platforms/${platformId}/connection/oauth/start`, {
        method: 'POST',
      });
      const data = (await res.json()) as {
        authUrl?: string;
        error?: string;
        requiresManualConfig?: boolean;
      };

      if (data.requiresManualConfig || !res.ok) {
        setNoticeMessage(data.error || `${platformName} 请填写凭证后点击「验证连接」。`);
        return;
      }

      if (!data.authUrl) {
        setErrorMessage(`${platformName} 授权失败，请稍后重试`);
        return;
      }

      // 跳转到平台 OAuth 授权页
      window.location.href = data.authUrl;
    } catch {
      setErrorMessage(`${platformName} 授权请求失败，请稍后重试`);
    }
  }

  async function handleCheckConnection(platformId: PlatformId) {
    setCheckStates((prev) => ({ ...prev, [platformId]: { checking: true } }));
    try {
      const res = await fetch(`/api/platforms/${platformId}/connection/check`, { method: 'POST' });
      const data = (await res.json()) as {
        ok: boolean;
        failureReason?: string;
        accountName?: string;
        checkedAt?: string;
      };
      setCheckStates((prev) => ({
        ...prev,
        [platformId]: {
          checking: false,
          ok: data.ok,
          failureReason: data.failureReason,
          accountName: data.accountName,
          checkedAt: data.checkedAt,
        },
      }));
    } catch {
      setCheckStates((prev) => ({
        ...prev,
        [platformId]: { checking: false, ok: false, failureReason: '请求失败，请重试' },
      }));
    }
  }

  async function handleDisconnect(platformId: PlatformId) {
    setDisconnectStates((prev) => ({ ...prev, [platformId]: { disconnecting: true } }));
    try {
      await fetch(`/api/platforms/${platformId}/connection/disconnect`, { method: 'POST' });
      setDisconnectStates((prev) => ({
        ...prev,
        [platformId]: { disconnecting: false, done: true },
      }));
      setCheckStates((prev) => ({ ...prev, [platformId]: { checking: false } }));
      setTimeout(() => {
        setDisconnectStates((prev) => ({ ...prev, [platformId]: { disconnecting: false } }));
      }, 2000);
    } catch {
      setDisconnectStates((prev) => ({ ...prev, [platformId]: { disconnecting: false } }));
    }
  }

  async function handleTestAgent() {
    setAgentTesting(true);
    setAgentTestResult(null);
    try {
      const res = await fetch('/api/agent/status');
      const data = await res.json();
      if (data.available) {
        setAgentTestResult({ ok: true, message: `连接成功 (${data.model || data.provider})` });
      } else {
        setAgentTestResult({ ok: false, message: '未配置或连接不可用，请检查 API 地址和密钥' });
      }
    } catch {
      setAgentTestResult({ ok: false, message: '网络错误，无法测试连接' });
    } finally {
      setAgentTesting(false);
    }
  }

  async function handleSave() {
    try {
      setErrorMessage('');
      setNoticeMessage('');
      setSaved(false);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !data.success) throw new Error(data.error || '保存失败，请重试');
      setCachedSettingsPageData({ values, connectionRecords });
      setInitialValues(values);
      setSaved(true);
      useToastStore.getState().addToast('success', '设置已保存');
      setTimeout(() => setSaved(false), 3000);

      // Auto-verify all fully-configured platforms after save
      const configuredPlatformIds = getPlatformConnectionProfiles(values)
        .filter((p) => p.missingKeys.length === 0)
        .map((p) => p.platform);
      if (configuredPlatformIds.length > 0) {
        void Promise.all(configuredPlatformIds.map((id) => handleCheckConnection(id)));
      }
    } catch (error) {
      setSaved(false);
      setErrorMessage(error instanceof Error ? error.message : '保存失败，请重试');
    }
  }

  const isPlatformSelected = platformConfigs.some((p) => p.id === selectedItem);
  const agentConfigured = !!(
    values['AGENT_BASE_URL'] &&
    values['AGENT_API_KEY'] &&
    values['AGENT_MODEL']
  );

  return (
    <div className={styles.pageWrap}>
      <AppShellHeader
        kicker="Operational control"
        title="设置"
        description="管理发布平台凭证与 AI 助手配置。"
        action={
          <div className={styles.saveActions}>
            <button
              onClick={handleSave}
              type="button"
              disabled={loading}
              className={styles.saveButton}
            >
              <Save size={16} />
              {loading ? '正在读取...' : '保存设置'}
            </button>
            {saved ? (
              <span className={styles.savedIndicator}>
                <CheckCircle2 size={14} />
                已保存
              </span>
            ) : errorMessage ? (
              <span className={styles.errorIndicator}>{errorMessage}</span>
            ) : noticeMessage ? (
              <span className={styles.noticeIndicator}>{noticeMessage}</span>
            ) : null}
          </div>
        }
      />

      {/* Mobile: horizontal pill tabs */}
      <nav className={styles.platformMobileTabs}>
        {platformConfigs.map((platform) => (
          <button
            key={platform.id}
            type="button"
            className={styles.platformMobileTab({ active: selectedItem === platform.id })}
            onClick={() => setSelectedItem(platform.id)}
          >
            {platform.name}
          </button>
        ))}
        <button
          type="button"
          className={styles.platformMobileTab({ active: selectedItem === 'agent-config' })}
          onClick={() => setSelectedItem('agent-config')}
        >
          AI 配置
        </button>
        <button
          type="button"
          className={styles.platformMobileTab({ active: selectedItem === 'agent-prompt' })}
          onClick={() => setSelectedItem('agent-prompt')}
        >
          Prompt
        </button>
      </nav>

      <div className={styles.platformLayout}>
        {/* Desktop: sidebar */}
        <nav className={styles.platformSidebar}>
          {platformConfigs.map((platform) => {
            const { Icon } = platform;
            const connectionProfile = connectionProfiles.find((p) => p.platform === platform.id);
            return (
              <button
                key={platform.id}
                type="button"
                className={styles.platformSidebarItem({
                  active: selectedItem === platform.id,
                })}
                onClick={() => setSelectedItem(platform.id)}
              >
                <span className={styles.sidebarItemIcon}>
                  <Icon size={18} />
                </span>
                <span className={styles.sidebarItemBody}>
                  <p className={styles.sidebarItemName}>{platform.name}</p>
                  <p className={styles.sidebarItemStatus}>
                    {connectionProfile ? statusLabels[connectionProfile.status] : '未配置'}
                  </p>
                </span>
              </button>
            );
          })}
          <div className={styles.sidebarDivider}>AI 助手</div>
          <button
            type="button"
            className={styles.platformSidebarItem({ active: selectedItem === 'agent-config' })}
            onClick={() => setSelectedItem('agent-config')}
          >
            <span className={styles.sidebarItemIcon}>
              <Bot size={18} />
            </span>
            <span className={styles.sidebarItemBody}>
              <p className={styles.sidebarItemName}>连接配置</p>
              <p className={styles.sidebarItemStatus}>{agentConfigured ? '已配置' : '未配置'}</p>
            </span>
          </button>
          <button
            type="button"
            className={styles.platformSidebarItem({ active: selectedItem === 'agent-prompt' })}
            onClick={() => setSelectedItem('agent-prompt')}
          >
            <span className={styles.sidebarItemIcon}>
              <Sparkles size={18} />
            </span>
            <span className={styles.sidebarItemBody}>
              <p className={styles.sidebarItemName}>Prompt 设置</p>
              <p className={styles.sidebarItemStatus}>自定义提示词</p>
            </span>
          </button>
        </nav>

        {/* Detail panel */}
        <div className={styles.platformDetail}>
          {isPlatformSelected ? (
            <SurfaceCard tone="soft">
              <div className={styles.platformDetailInner}>
                {(() => {
                  const platform = platformConfigs.find((p) => p.id === selectedItem)!;
                  const { Icon } = platform;
                  const connectionProfile = connectionProfiles.find(
                    (p) => p.platform === platform.id,
                  );
                  const isVerifyOnly = VERIFY_ONLY_PLATFORMS.has(platform.id);
                  const record = connectionRecords[platform.id];
                  const connectedAccountName =
                    (checkStates[platform.id]?.ok && checkStates[platform.id]?.accountName) ||
                    (!checkStates[platform.id] && record?.accountName) ||
                    null;
                  const isConnected =
                    connectionProfile?.status === 'connected' &&
                    !disconnectStates[platform.id]?.done;

                  return (
                    <>
                      <div className={styles.platformDetailHeader}>
                        <span className={styles.accordionIcon}>
                          <Icon size={22} />
                        </span>
                        <div>
                          <p className={styles.accordionTitle}>{platform.name}</p>
                          {isConnected && connectedAccountName ? (
                            <p className={styles.accordionAccountName}>
                              <CheckCircle2 size={11} />
                              {connectedAccountName}
                            </p>
                          ) : (
                            <p className={styles.accordionSummary}>{platform.summary}</p>
                          )}
                        </div>
                        {connectionProfile ? (
                          <span
                            className={`${styles.statusBadge} ${styles.statusBadgeVariants[connectionProfile.status]}`}
                          >
                            {statusLabels[connectionProfile.status]}
                          </span>
                        ) : null}
                      </div>

                      {connectionProfile?.mode === 'oauth' ? (
                        <div className={styles.oauthSteps}>
                          <div className={styles.oauthStep}>
                            <div className={styles.oauthStepHeader}>
                              <span
                                className={
                                  connectionProfile.status === 'connected'
                                    ? styles.oauthStepBadgeActive
                                    : styles.oauthStepBadge
                                }
                              >
                                1
                              </span>
                              <p className={styles.oauthStepTitle}>填写开发者凭证</p>
                            </div>
                            <div className={styles.fieldList}>
                              {platform.fields.map((field) => (
                                <div key={field.key} className={styles.fieldWrap}>
                                  <label htmlFor={field.key} className={styles.fieldLabel}>
                                    {field.label}
                                  </label>
                                  <div className={styles.fieldInputWrap}>
                                    <input
                                      id={field.key}
                                      type={
                                        field.type === 'password' && !showSecrets[field.key]
                                          ? 'password'
                                          : 'text'
                                      }
                                      value={values[field.key] || ''}
                                      onChange={(event) =>
                                        handleChange(field.key, event.target.value)
                                      }
                                      placeholder={field.placeholder}
                                      className={styles.fieldInput}
                                    />
                                    {field.type === 'password' ? (
                                      <button
                                        type="button"
                                        onClick={() => toggleSecret(field.key)}
                                        aria-label={`${showSecrets[field.key] ? '隐藏' : '显示'} ${field.label}`}
                                        className={styles.eyeButton}
                                      >
                                        {showSecrets[field.key] ? (
                                          <EyeOff size={16} />
                                        ) : (
                                          <Eye size={16} />
                                        )}
                                      </button>
                                    ) : null}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <p className={styles.fieldHint}>{platform.hint}</p>
                          </div>

                          <div className={styles.oauthStep}>
                            <div className={styles.oauthStepHeader}>
                              <span
                                className={
                                  connectionProfile.status === 'connected'
                                    ? styles.oauthStepBadgeActive
                                    : styles.oauthStepBadge
                                }
                              >
                                2
                              </span>
                              <p className={styles.oauthStepTitle}>
                                {isVerifyOnly ? '验证连接' : '账号授权'}
                              </p>
                            </div>
                            <p className={styles.oauthStepDesc}>
                              {isVerifyOnly
                                ? connectionProfile.status === 'connected'
                                  ? `已配置全部 ${connectionProfile.configuredKeys.length} 项凭证。点击「验证连接」确认凭证有效性。`
                                  : `填写上方全部凭证后点击「验证连接」。还差 ${connectionProfile.missingKeys.length} 项。`
                                : connectionProfile.status === 'connected'
                                  ? `已配置全部 ${connectionProfile.configuredKeys.length} 项凭证。点击「检查连接」验证有效性，或重新授权刷新令牌。`
                                  : connectionProfile.missingKeys.length > 0
                                    ? `填写上方全部凭证后，即可点击「一键授权」完成账号绑定。还差 ${connectionProfile.missingKeys.length} 项。`
                                    : '凭证已填写完毕，点击「一键授权」完成账号绑定。'}
                            </p>
                            <CheckResult
                              checkState={checkStates[platform.id]}
                              connectionRecord={connectionRecords[platform.id]}
                              disconnectDone={disconnectStates[platform.id]?.done}
                            />
                            <div className={styles.oauthAuthorizeRow}>
                              <button
                                type="button"
                                className={styles.authorizeButton}
                                disabled={
                                  connectionProfile.missingKeys.length > 0 ||
                                  checkStates[platform.id]?.checking
                                }
                                onClick={() =>
                                  void handleConnectionAction(
                                    platform.id,
                                    platform.name,
                                    connectionProfile.mode,
                                  )
                                }
                              >
                                {isVerifyOnly ? <RefreshCw size={15} /> : <Zap size={15} />}
                                {checkStates[platform.id]?.checking
                                  ? '验证中…'
                                  : isVerifyOnly
                                    ? connectionProfile.status === 'connected'
                                      ? '重新验证'
                                      : '验证连接'
                                    : connectionProfile.status === 'connected'
                                      ? '重新授权'
                                      : '一键授权'}
                              </button>
                              {connectionProfile.status === 'connected' && !isVerifyOnly ? (
                                <>
                                  <button
                                    type="button"
                                    className={styles.checkButton}
                                    disabled={checkStates[platform.id]?.checking}
                                    onClick={() => void handleCheckConnection(platform.id)}
                                  >
                                    <RefreshCw size={13} />
                                    {checkStates[platform.id]?.checking ? '检查中…' : '检查连接'}
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.disconnectButton}
                                    disabled={disconnectStates[platform.id]?.disconnecting}
                                    onClick={() => void handleDisconnect(platform.id)}
                                  >
                                    <Unplug size={13} />
                                    {disconnectStates[platform.id]?.disconnecting
                                      ? '处理中…'
                                      : '断开连接'}
                                  </button>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className={styles.fieldList}>
                            {platform.fields.map((field) => (
                              <div key={field.key} className={styles.fieldWrap}>
                                <label htmlFor={field.key} className={styles.fieldLabel}>
                                  {field.label}
                                </label>
                                <div className={styles.fieldInputWrap}>
                                  {field.type === 'textarea' ? (
                                    <textarea
                                      id={field.key}
                                      value={values[field.key] || ''}
                                      onChange={(event) =>
                                        handleChange(field.key, event.target.value)
                                      }
                                      placeholder={field.placeholder}
                                      rows={4}
                                      className={styles.fieldTextarea}
                                    />
                                  ) : (
                                    <input
                                      id={field.key}
                                      type={
                                        field.type === 'password' && !showSecrets[field.key]
                                          ? 'password'
                                          : 'text'
                                      }
                                      value={values[field.key] || ''}
                                      onChange={(event) =>
                                        handleChange(field.key, event.target.value)
                                      }
                                      placeholder={field.placeholder}
                                      className={styles.fieldInput}
                                    />
                                  )}
                                  {field.type === 'password' ? (
                                    <button
                                      type="button"
                                      onClick={() => toggleSecret(field.key)}
                                      aria-label={`${showSecrets[field.key] ? '隐藏' : '显示'} ${field.label}`}
                                      className={styles.eyeButton}
                                    >
                                      {showSecrets[field.key] ? (
                                        <EyeOff size={16} />
                                      ) : (
                                        <Eye size={16} />
                                      )}
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className={styles.fieldHint}>{platform.hint}</p>
                          <div className={styles.oauthAuthorizeRow}>
                            <button
                              type="button"
                              className={styles.checkButton}
                              disabled={
                                checkStates[platform.id]?.checking || !values['ZHIHU_COOKIE']
                              }
                              onClick={() => void handleCheckConnection(platform.id)}
                            >
                              <RefreshCw size={13} />
                              {checkStates[platform.id]?.checking ? '验证中…' : '测试连接'}
                            </button>
                          </div>
                          <CheckResult
                            checkState={checkStates[platform.id]}
                            connectionRecord={connectionRecords[platform.id]}
                            disconnectDone={disconnectStates[platform.id]?.done}
                          />
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            </SurfaceCard>
          ) : selectedItem === 'agent-config' ? (
            <SurfaceCard tone="soft">
              <div className={styles.platformDetailInner}>
                <div className={styles.platformDetailHeader}>
                  <span className={styles.accordionIcon}>
                    <Bot size={22} />
                  </span>
                  <div>
                    <p className={styles.accordionTitle}>AI 连接配置</p>
                    <p className={styles.accordionSummary}>配置 LLM 接口，启用写作辅助与平台适配</p>
                  </div>
                </div>
                <div className={styles.fieldList}>
                  <div className={styles.fieldWrap}>
                    <label htmlFor="AGENT_BASE_URL" className={styles.fieldLabel}>
                      API Base URL
                    </label>
                    <div className={styles.fieldInputWrap}>
                      <input
                        id="AGENT_BASE_URL"
                        type="text"
                        value={values['AGENT_BASE_URL'] || ''}
                        onChange={(event) => handleChange('AGENT_BASE_URL', event.target.value)}
                        placeholder="如 https://api.openai.com/v1 或 https://api.deepseek.com"
                        className={styles.fieldInput}
                      />
                    </div>
                  </div>
                  <div className={styles.fieldWrap}>
                    <label htmlFor="AGENT_API_KEY" className={styles.fieldLabel}>
                      API Key
                    </label>
                    <div className={styles.fieldInputWrap}>
                      <input
                        id="AGENT_API_KEY"
                        type={showSecrets['AGENT_API_KEY'] ? 'text' : 'password'}
                        value={values['AGENT_API_KEY'] || ''}
                        onChange={(event) => handleChange('AGENT_API_KEY', event.target.value)}
                        placeholder="输入 API Key"
                        className={styles.fieldInput}
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('AGENT_API_KEY')}
                        aria-label={`${showSecrets['AGENT_API_KEY'] ? '隐藏' : '显示'} API Key`}
                        className={styles.eyeButton}
                      >
                        {showSecrets['AGENT_API_KEY'] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className={styles.fieldWrap}>
                    <label htmlFor="AGENT_MODEL" className={styles.fieldLabel}>
                      模型名称
                    </label>
                    <div className={styles.fieldInputWrap}>
                      <input
                        id="AGENT_MODEL"
                        type="text"
                        value={values['AGENT_MODEL'] || ''}
                        onChange={(event) => handleChange('AGENT_MODEL', event.target.value)}
                        placeholder="如 gpt-4o-mini、deepseek-chat、qwen-plus"
                        className={styles.fieldInput}
                      />
                    </div>
                  </div>
                </div>
                <p className={styles.fieldHint}>
                  填写任意 OpenAI 兼容 API 的地址、密钥和模型名称。三项全部填写并保存后：
                </p>
                <ul className={styles.fieldHint} style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  <li>
                    编辑器输入 <code className={styles.inlineCode}>/</code> 查看 AI 命令
                  </li>
                  <li>发布预览面板出现「AI 适配」按钮</li>
                </ul>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button
                    type="button"
                    className={styles.checkButton}
                    onClick={handleTestAgent}
                    disabled={agentTesting}
                  >
                    {agentTesting ? '测试中...' : '测试连接'}
                  </button>
                  {agentTestResult && (
                    <span
                      className={agentTestResult.ok ? styles.checkResultOk : styles.checkResultFail}
                    >
                      {agentTestResult.message}
                    </span>
                  )}
                </div>
              </div>
            </SurfaceCard>
          ) : (
            <SurfaceCard tone="soft">
              <div className={styles.platformDetailInner}>
                <div className={styles.platformDetailHeader}>
                  <span className={styles.accordionIcon}>
                    <Sparkles size={22} />
                  </span>
                  <div>
                    <p className={styles.accordionTitle}>Prompt 设置</p>
                    <p className={styles.accordionSummary}>自定义 AI 改写和适配的提示词模板</p>
                  </div>
                </div>
                <PromptEditor />
              </div>
            </SurfaceCard>
          )}
        </div>
      </div>

      {isDirty && !loading && (
        <button type="button" className={styles.floatingSave} onClick={handleSave}>
          <Save size={16} />
          保存 {dirtyCount} 项修改
        </button>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
