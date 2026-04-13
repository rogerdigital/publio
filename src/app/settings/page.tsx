'use client';

import { useEffect, useState } from 'react';
import {
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronDown,
  RefreshCw,
  Unplug,
  Zap,
} from 'lucide-react';

import AppShellHeader from '@/components/layout/AppShellHeader';
import SurfaceCard from '@/components/layout/SurfaceCard';
import { getPlatformConnectionProfiles } from '@/lib/platformConnections/profiles';
import type { PlatformConnectionMode, PlatformConnectionStatus } from '@/lib/platformConnections/types';
import type { PlatformId } from '@/types';
import {
  WechatIcon,
  XiaohongshuIcon,
  ZhihuIcon,
  XIcon,
} from '@/components/icons/PlatformIcons';
import * as styles from './settings.css';

interface PlatformConfig {
  id: PlatformId;
  name: string;
  Icon: React.ComponentType<{ size?: number }>;
  summary: string;
  hint: React.ReactNode;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'password' | 'textarea';
    placeholder: string;
  }[];
}

const platformConfigs: PlatformConfig[] = [
  {
    id: 'wechat',
    name: '微信公众号',
    Icon: WechatIcon,
    summary: '文章分发与公众号素材投递',
    hint: <>前往 <code className={styles.inlineCode}>mp.weixin.qq.com</code> → 开发 → 基本配置，获取 AppID 和 AppSecret</>,
    fields: [
      { key: 'WECHAT_APP_ID', label: 'App ID', type: 'text', placeholder: '输入微信公众号 App ID' },
      { key: 'WECHAT_APP_SECRET', label: 'App Secret', type: 'password', placeholder: '输入微信公众号 App Secret' },
    ],
  },
  {
    id: 'xiaohongshu',
    name: '小红书',
    Icon: XiaohongshuIcon,
    summary: '图文分发与笔记发布通道',
    hint: '前往小红书开放平台注册开发者账号并创建应用',
    fields: [
      { key: 'XHS_APP_ID', label: 'App ID', type: 'text', placeholder: '输入小红书 App ID' },
      { key: 'XHS_APP_SECRET', label: 'App Secret', type: 'password', placeholder: '输入小红书 App Secret' },
      { key: 'XHS_ACCESS_TOKEN', label: 'Access Token', type: 'password', placeholder: '输入小红书 Access Token' },
    ],
  },
  {
    id: 'zhihu',
    name: '知乎',
    Icon: ZhihuIcon,
    summary: '长文转载与问答场景投递',
    hint: '使用浏览器登录知乎后，在开发者工具的 Network 面板中复制 Cookie',
    fields: [
      { key: 'ZHIHU_COOKIE', label: 'Cookie', type: 'textarea', placeholder: '从浏览器开发者工具中复制知乎的 Cookie' },
    ],
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    Icon: XIcon,
    summary: '短帖同步与外部扩散',
    hint: <>前往 <code className={styles.inlineCode}>developer.x.com</code> 创建项目并生成 API Keys 和 Access Tokens</>,
    fields: [
      { key: 'X_API_KEY', label: 'API Key', type: 'text', placeholder: '输入 X API Key' },
      { key: 'X_API_SECRET', label: 'API Secret', type: 'password', placeholder: '输入 X API Secret' },
      { key: 'X_ACCESS_TOKEN', label: 'Access Token', type: 'text', placeholder: '输入 X Access Token' },
      { key: 'X_ACCESS_TOKEN_SECRET', label: 'Access Token Secret', type: 'password', placeholder: '输入 X Access Token Secret' },
    ],
  },
];

const statusLabels: Record<PlatformConnectionStatus, string> = {
  connected: '已连接',
  available: '可授权',
  'manual-required': '需配置',
};

interface CheckState {
  checking: boolean;
  ok?: boolean;
  failureReason?: string;
  checkedAt?: string;
}

interface DisconnectState {
  disconnecting: boolean;
  done?: boolean;
}

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkStates, setCheckStates] = useState<Record<string, CheckState>>({});
  const [disconnectStates, setDisconnectStates] = useState<Record<string, DisconnectState>>({});
  const connectionProfiles = getPlatformConnectionProfiles(values);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        setLoading(true);
        setErrorMessage('');
        const response = await fetch('/api/settings', { cache: 'no-store' });
        const data = (await response.json()) as Record<string, string>;
        if (!response.ok) throw new Error('加载设置失败，请稍后重试');
        if (!cancelled) setValues(data);
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : '加载设置失败，请稍后重试');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadSettings();
    return () => { cancelled = true; };
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

  async function handleConnectionAction(platformId: PlatformId, platformName: string, mode: PlatformConnectionMode) {
    setSaved(false);
    setErrorMessage('');
    setNoticeMessage('');

    if (mode !== 'oauth') {
      setNoticeMessage(`${platformName} 当前使用登录态连接，请在下方完成配置。`);
      return;
    }

    try {
      const res = await fetch(`/api/platforms/${platformId}/connection/oauth/start`, { method: 'POST' });
      const data = (await res.json()) as { authUrl?: string; error?: string };

      if (res.status === 501) {
        // OAuth not yet implemented — guide user to manual credential entry
        setNoticeMessage(`${platformName} OAuth 授权入口已预留，当前请在下方手动填写 API 凭证完成连接。`);
        return;
      }

      if (!res.ok || !data.authUrl) {
        setErrorMessage(data.error || `${platformName} 授权失败，请稍后重试`);
        return;
      }

      // Redirect to the platform's OAuth authorization page
      window.location.href = data.authUrl;
    } catch {
      setErrorMessage(`${platformName} 授权请求失败，请稍后重试`);
    }
  }

  async function handleCheckConnection(platformId: PlatformId) {
    setCheckStates((prev) => ({ ...prev, [platformId]: { checking: true } }));
    try {
      const res = await fetch(`/api/platforms/${platformId}/connection/check`, { method: 'POST' });
      const data = (await res.json()) as { ok: boolean; failureReason?: string; checkedAt?: string };
      setCheckStates((prev) => ({
        ...prev,
        [platformId]: { checking: false, ok: data.ok, failureReason: data.failureReason, checkedAt: data.checkedAt },
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
      setDisconnectStates((prev) => ({ ...prev, [platformId]: { disconnecting: false, done: true } }));
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
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      setSaved(false);
      setErrorMessage(error instanceof Error ? error.message : '保存失败，请重试');
    }
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
          const connectionProfile = connectionProfiles.find((profile) => profile.platform === platform.id);

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
                  <p className={styles.accordionSummary}>{platform.summary}</p>
                </div>
                <div className={styles.accordionToggle}>
                  {connectionProfile ? (
                    <span className={`${styles.statusBadge} ${styles.statusBadgeVariants[connectionProfile.status]}`}>
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
                          <span className={connectionProfile.status === 'connected' ? styles.oauthStepBadgeActive : styles.oauthStepBadge}>1</span>
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
                                  type={field.type === 'password' && !showSecrets[field.key] ? 'password' : 'text'}
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
                                    {showSecrets[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className={styles.fieldHint}>{platform.hint}</p>
                      </div>

                      {/* 步骤 2：账号授权 */}
                      <div className={styles.oauthStep}>
                        <div className={styles.oauthStepHeader}>
                          <span className={connectionProfile.status === 'connected' ? styles.oauthStepBadgeActive : styles.oauthStepBadge}>2</span>
                          <p className={styles.oauthStepTitle}>账号授权</p>
                        </div>
                        <p className={styles.oauthStepDesc}>
                          {connectionProfile.status === 'connected'
                            ? `已配置全部 ${connectionProfile.configuredKeys.length} 项凭证。点击「检查连接」验证有效性，或重新授权刷新令牌。`
                            : connectionProfile.missingKeys.length > 0
                              ? `填写上方全部凭证后，即可点击「一键授权」完成账号绑定。还差 ${connectionProfile.missingKeys.length} 项。`
                              : '凭证已填写完毕，点击「一键授权」完成账号绑定。'}
                        </p>
                        {/* 连接检查 / 断开结果 */}
                        {(() => {
                          const ck = checkStates[platform.id];
                          if (ck && !ck.checking) {
                            if (ck.ok) return <p className={styles.checkResultOk}><CheckCircle2 size={13} /> 连接正常</p>;
                            return <p className={styles.checkResultFail}>连接异常：{ck.failureReason ?? '未知原因'}</p>;
                          }
                          if (disconnectStates[platform.id]?.done) {
                            return <p className={styles.checkResultOk}>连接记录已清除</p>;
                          }
                          return null;
                        })()}
                        <div className={styles.oauthAuthorizeRow}>
                          <button
                            type="button"
                            className={styles.authorizeButton}
                            disabled={connectionProfile.missingKeys.length > 0}
                            onClick={() => void handleConnectionAction(platform.id, platform.name, connectionProfile.mode)}
                          >
                            <Zap size={15} />
                            {connectionProfile.status === 'connected' ? '重新授权' : '一键授权'}
                          </button>
                          {connectionProfile.status === 'connected' ? (
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
                                {disconnectStates[platform.id]?.disconnecting ? '处理中…' : '断开连接'}
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // ── Manual 平台（知乎）：纯表单 ──────────────────────
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
                                  type={field.type === 'password' && !showSecrets[field.key] ? 'password' : 'text'}
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
                                  {showSecrets[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className={styles.fieldHint}>{platform.hint}</p>
                    </>
                  )}
                </div>
              ) : null}
            </SurfaceCard>
          );
        })}
      </div>
    </div>
  );
}
