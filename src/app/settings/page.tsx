'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronDown,
  RefreshCw,
  Unplug,
  Zap,
  Sparkles,
  Github,
} from 'lucide-react';

import AppShellHeader from '@/components/layout/AppShellHeader';
import SurfaceCard from '@/components/layout/SurfaceCard';
import { getPlatformConnectionProfiles } from '@/lib/platformConnections/profiles';
import type {
  PlatformConnectionMode,
  PlatformConnectionRecord,
} from '@/lib/platformConnections/types';
import type { PlatformId } from '@/types';
import { useToastStore } from '@/stores/toastStore';
import RssSourceManager from '@/components/settings/RssSourceManager';
import PromptEditor from '@/components/settings/PromptEditor';
import BrandProfileForm from '@/components/copilot/BrandProfileForm';
import StyleProfile from '@/components/copilot/StyleProfile';
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

function SettingsContent() {
  const searchParams = useSearchParams();
  const [values, setValues] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkStates, setCheckStates] = useState<Record<string, CheckState>>({});
  const [disconnectStates, setDisconnectStates] = useState<Record<string, DisconnectState>>({});
  const [connectionRecords, setConnectionRecords] = useState<
    Record<PlatformId, PlatformConnectionRecord>
  >({} as Record<PlatformId, PlatformConnectionRecord>);
  const connectionProfiles = getPlatformConnectionProfiles(values);

  // 检测 OAuth callback 后的 ?connected= 参数
  useEffect(() => {
    const connected = searchParams.get('connected') as PlatformId | null;
    const error = searchParams.get('error');
    if (connected) {
      const platformName = platformConfigs.find((p) => p.id === connected)?.name ?? connected;
      setNoticeMessage(`${platformName} 授权成功，连接已建立。`);
      setExpandedPlatform(connected);
    } else if (error) {
      setErrorMessage(`授权失败：${decodeURIComponent(error)}`);
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        setLoading(true);
        setErrorMessage('');
        const [settingsRes, recordsRes] = await Promise.all([
          fetch('/api/settings', { cache: 'no-store' }),
          fetch('/api/platforms/connection/records', { cache: 'no-store' }),
        ]);
        const data = (await settingsRes.json()) as Record<string, string>;
        if (!settingsRes.ok) throw new Error('加载设置失败，请稍后重试');
        if (!cancelled) setValues(data);

        if (recordsRes.ok) {
          const records = (await recordsRes.json()) as PlatformConnectionRecord[];
          if (!cancelled) {
            const recordMap = Object.fromEntries(records.map((r) => [r.platform, r])) as Record<
              PlatformId,
              PlatformConnectionRecord
            >;
            setConnectionRecords(recordMap);
          }
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

  function renderCheckResult(platformId: PlatformId) {
    const ck = checkStates[platformId];
    const record = connectionRecords[platformId];

    if (ck && !ck.checking) {
      if (ck.ok) {
        return (
          <p className={styles.checkResultOk}>
            <CheckCircle2 size={13} />
            {ck.accountName ? `连接正常（${ck.accountName}）` : '连接正常'}
          </p>
        );
      }
      return <p className={styles.checkResultFail}>连接异常：{ck.failureReason ?? '未知原因'}</p>;
    }

    if (disconnectStates[platformId]?.done) {
      return <p className={styles.checkResultOk}>连接记录已清除</p>;
    }

    // 从持久化 records 中展示上次验证信息
    if (record?.lastCheckedAt) {
      const timeAgo = formatRelativeTime(record.lastCheckedAt);
      if (record.failureReason) {
        return (
          <p className={styles.checkResultFail}>
            上次验证（{timeAgo}）失败：{record.failureReason}
          </p>
        );
      }
      return (
        <p className={styles.checkResultOk}>
          <CheckCircle2 size={13} />
          {record.accountName ? `${record.accountName} · ` : ''}上次验证：{timeAgo}
        </p>
      );
    }

    return null;
  }

  return (
    <div className={styles.pageWrap}>
      <AppShellHeader
        kicker="Operational control"
        title="平台设置"
        description="统一管理各平台 API 凭证与登录态。"
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

      <div className={styles.platformList}>
        {platformConfigs.map((platform) => {
          const isExpanded = expandedPlatform === platform.id;
          const { Icon } = platform;
          const connectionProfile = connectionProfiles.find(
            (profile) => profile.platform === platform.id,
          );
          const isVerifyOnly = VERIFY_ONLY_PLATFORMS.has(platform.id);
          const record = connectionRecords[platform.id];
          // 账号名：优先用最新 check 结果，其次用持久化 record
          const connectedAccountName =
            (checkStates[platform.id]?.ok && checkStates[platform.id]?.accountName) ||
            (!checkStates[platform.id] && record?.accountName) ||
            null;
          const isConnected =
            connectionProfile?.status === 'connected' && !disconnectStates[platform.id]?.done;

          return (
            <SurfaceCard key={platform.id} tone="soft" className={styles.accordionCard}>
              <button
                type="button"
                aria-expanded={isExpanded}
                aria-controls={`${platform.id}-panel`}
                onClick={() => setExpandedPlatform(isExpanded ? null : platform.id)}
                className={styles.accordionTrigger}
              >
                <div className={styles.accordionIcon}>
                  <Icon size={20} />
                </div>
                <div className={styles.accordionBody}>
                  <p className={styles.accordionTitle}>{platform.name}</p>
                  {isConnected && connectedAccountName ? (
                    <p className={styles.accordionAccountName}>
                      <CheckCircle2 size={11} />
                      {connectedAccountName}
                    </p>
                  ) : connectionProfile && connectionProfile.missingKeys.length > 0 ? (
                    <p className={styles.accordionMissingFields}>
                      缺少：{connectionProfile.missingKeys.join(', ')}
                    </p>
                  ) : (
                    <p className={styles.accordionSummary}>{platform.summary}</p>
                  )}
                </div>
                <div className={styles.accordionToggle}>
                  {connectionProfile ? (
                    <span
                      className={`${styles.statusBadge} ${styles.statusBadgeVariants[connectionProfile.status]}`}
                    >
                      {statusLabels[connectionProfile.status]}
                    </span>
                  ) : null}
                  <span>{isExpanded ? '收起' : '展开'}</span>
                  <ChevronDown
                    size={16}
                    style={{
                      transition: 'transform 150ms',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </div>
              </button>

              {isExpanded ? (
                <div id={`${platform.id}-panel`} className={styles.accordionPanel}>
                  {connectionProfile?.mode === 'oauth' ? (
                    // ── OAuth 平台：两步引导 ──────────────────────────────
                    <div className={styles.oauthSteps}>
                      {/* 步骤 1：开发者凭证 */}
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
                                  onChange={(event) => handleChange(field.key, event.target.value)}
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

                      {/* 步骤 2：账号授权 / 验证连接 */}
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
                        {renderCheckResult(platform.id)}
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
                    // ── Manual 平台（知乎）：纯表单 + 测试连接 ───────────
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
                                  onChange={(event) => handleChange(field.key, event.target.value)}
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
                                  onChange={(event) => handleChange(field.key, event.target.value)}
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
                      {/* 知乎：测试连接区域 */}
                      <div className={styles.oauthAuthorizeRow}>
                        <button
                          type="button"
                          className={styles.checkButton}
                          disabled={checkStates[platform.id]?.checking || !values['ZHIHU_COOKIE']}
                          onClick={() => void handleCheckConnection(platform.id)}
                        >
                          <RefreshCw size={13} />
                          {checkStates[platform.id]?.checking ? '验证中…' : '测试连接'}
                        </button>
                      </div>
                      {renderCheckResult(platform.id)}
                    </>
                  )}
                </div>
              ) : null}
            </SurfaceCard>
          );
        })}
      </div>
      <div className={styles.platformList}>
        <SurfaceCard tone="soft" className={styles.accordionCard}>
          <div className={styles.accordionTrigger} style={{ cursor: 'default' }}>
            <div className={styles.accordionIcon}>
              <Sparkles size={20} />
            </div>
            <div className={styles.accordionBody}>
              <p className={styles.accordionTitle}>AI 助手（Agent）</p>
              <p className={styles.accordionSummary}>配置 LLM 接口，启用 AI 写作、适配、研究功能</p>
            </div>
          </div>

          <div className={styles.accordionPanel}>
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
                编辑器输入 <code className={styles.inlineCode}>/</code> 查看 AI
                命令（扩写、缩写、改写、润色、续写）
              </li>
              <li>AI 选题页话题卡出现「深度分析」按钮</li>
              <li>发布预览面板出现「AI 适配」按钮</li>
              <li>分发失败时出现「AI 诊断」按钮</li>
            </ul>
          </div>
        </SurfaceCard>

        {/* GitHub 图床 */}
        <SurfaceCard tone="soft" className={styles.accordionCard}>
          <div className={styles.accordionTrigger} style={{ cursor: 'default' }}>
            <div className={styles.accordionIcon}>
              <Github size={20} />
            </div>
            <div className={styles.accordionBody}>
              <p className={styles.accordionTitle}>GitHub 图床</p>
              <p className={styles.accordionSummary}>上传图片到 GitHub 仓库，获取公网可访问 URL</p>
            </div>
          </div>
          <div className={styles.accordionPanel}>
            <div className={styles.fieldList}>
              <div className={styles.fieldWrap}>
                <label htmlFor="GITHUB_IMAGE_ENABLED" className={styles.fieldLabel}>
                  启用
                </label>
                <div className={styles.fieldInputWrap}>
                  <input
                    id="GITHUB_IMAGE_ENABLED"
                    type="checkbox"
                    checked={values['GITHUB_IMAGE_ENABLED'] === 'true'}
                    onChange={(e) =>
                      handleChange('GITHUB_IMAGE_ENABLED', e.target.checked ? 'true' : 'false')
                    }
                  />
                </div>
              </div>
              <div className={styles.fieldWrap}>
                <label htmlFor="GITHUB_IMAGE_TOKEN" className={styles.fieldLabel}>
                  Personal Access Token
                </label>
                <div className={styles.fieldInputWrap}>
                  <input
                    id="GITHUB_IMAGE_TOKEN"
                    type={showSecrets['GITHUB_IMAGE_TOKEN'] ? 'text' : 'password'}
                    value={values['GITHUB_IMAGE_TOKEN'] || ''}
                    onChange={(e) => handleChange('GITHUB_IMAGE_TOKEN', e.target.value)}
                    placeholder="ghp_xxxx（需要 repo 权限）"
                    className={styles.fieldInput}
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('GITHUB_IMAGE_TOKEN')}
                    className={styles.eyeButton}
                  >
                    {showSecrets['GITHUB_IMAGE_TOKEN'] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className={styles.fieldWrap}>
                <label htmlFor="GITHUB_IMAGE_OWNER" className={styles.fieldLabel}>
                  仓库所有者
                </label>
                <div className={styles.fieldInputWrap}>
                  <input
                    id="GITHUB_IMAGE_OWNER"
                    type="text"
                    value={values['GITHUB_IMAGE_OWNER'] || ''}
                    onChange={(e) => handleChange('GITHUB_IMAGE_OWNER', e.target.value)}
                    placeholder="如 rogerdigital"
                    className={styles.fieldInput}
                  />
                </div>
              </div>
              <div className={styles.fieldWrap}>
                <label htmlFor="GITHUB_IMAGE_REPO" className={styles.fieldLabel}>
                  仓库名称
                </label>
                <div className={styles.fieldInputWrap}>
                  <input
                    id="GITHUB_IMAGE_REPO"
                    type="text"
                    value={values['GITHUB_IMAGE_REPO'] || ''}
                    onChange={(e) => handleChange('GITHUB_IMAGE_REPO', e.target.value)}
                    placeholder="如 image-hosting"
                    className={styles.fieldInput}
                  />
                </div>
              </div>
              <div className={styles.fieldWrap}>
                <label htmlFor="GITHUB_IMAGE_BRANCH" className={styles.fieldLabel}>
                  分支
                </label>
                <div className={styles.fieldInputWrap}>
                  <input
                    id="GITHUB_IMAGE_BRANCH"
                    type="text"
                    value={values['GITHUB_IMAGE_BRANCH'] || ''}
                    onChange={(e) => handleChange('GITHUB_IMAGE_BRANCH', e.target.value)}
                    placeholder="main"
                    className={styles.fieldInput}
                  />
                </div>
              </div>
              <div className={styles.fieldWrap}>
                <label htmlFor="GITHUB_IMAGE_PATH" className={styles.fieldLabel}>
                  存储路径
                </label>
                <div className={styles.fieldInputWrap}>
                  <input
                    id="GITHUB_IMAGE_PATH"
                    type="text"
                    value={values['GITHUB_IMAGE_PATH'] || ''}
                    onChange={(e) => handleChange('GITHUB_IMAGE_PATH', e.target.value)}
                    placeholder="如 images/"
                    className={styles.fieldInput}
                  />
                </div>
              </div>
            </div>
          </div>
        </SurfaceCard>

        {/* 自定义 RSS 源 */}
        <SurfaceCard>
          <RssSourceManager />
        </SurfaceCard>

        {/* 自定义 AI Prompt */}
        <SurfaceCard>
          <PromptEditor />
        </SurfaceCard>

        {/* 品牌画像 */}
        <SurfaceCard>
          <BrandProfileForm />
        </SurfaceCard>

        {/* 写作风格 */}
        <SurfaceCard>
          <StyleProfile />
        </SurfaceCard>
      </div>
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
