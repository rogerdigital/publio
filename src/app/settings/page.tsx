'use client';

import { useEffect, useState } from 'react';
import {
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

import AppShellHeader from '@/components/layout/AppShellHeader';
import SurfaceCard from '@/components/layout/SurfaceCard';

// 品牌图标（与写作台保持一致）
function WechatIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path fill="#07C160" d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.295.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-3.89-6.348-7.601-6.348zM5.785 7.485a1.068 1.068 0 1 1 0 2.136 1.068 1.068 0 0 1 0-2.136zm4.817 0a1.068 1.068 0 1 1 0 2.136 1.068 1.068 0 0 1 0-2.136zm6.753 3.327c-3.367 0-6.085 2.447-6.085 5.47 0 3.022 2.718 5.47 6.085 5.47.734 0 1.439-.132 2.095-.358a.726.726 0 0 1 .553.077l1.374.803a.27.27 0 0 0 .12.038.218.218 0 0 0 .218-.218c0-.052-.02-.104-.034-.155l-.277-1.062a.435.435 0 0 1 .158-.486c1.312-.97 2.145-2.447 2.145-4.109 0-3.022-2.718-5.47-6.352-5.47zm-2.197 3.853a.783.783 0 1 1 0 1.566.783.783 0 0 1 0-1.566zm4.394 0a.783.783 0 1 1 0 1.566.783.783 0 0 1 0-1.566z" />
    </svg>
  );
}

function XiaohongshuIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path fill="#FF2442" d="M22.405 9.879c.002.016.01.02.07.019h.725a.797.797 0 0 0 .78-.972.794.794 0 0 0-.884-.618.795.795 0 0 1-.692.794c0 .101-.002.666.001.777zm-11.509 4.808c-.203.001-1.353.004-1.685.003a2.528 2.528 0 0 1-.766-.126.025.025 0 0 0-.03.014L7.7 16.127a.025.025 0 0 0 .01.032c.111.06.336.124.495.124.66.01 1.32.002 1.981 0 .01 0 .02-.006.023-.015l.712-1.545a.025.025 0 0 0-.024-.036zM.477 9.91c-.071 0-.076.002-.076.01a.834.834 0 0 0-.01.08c-.027.397-.038.495-.234 3.06-.012.24-.034.389-.135.607-.026.057-.033.042.003.112.046.092.681 1.523.787 1.74.008.015.011.02.017.02.008 0 .033-.026.047-.044.147-.187.268-.391.371-.606.306-.635.44-1.325.486-1.706.014-.11.021-.22.03-.33l.204-2.616.022-.293c.003-.029 0-.033-.03-.034zm7.203 3.757a1.427 1.427 0 0 1-.135-.607c-.004-.084-.031-.39-.235-3.06a.443.443 0 0 0-.01-.082c-.004-.011-.052-.008-.076-.008h-1.48c-.03.001-.034.005-.03.034l.021.293c.076.982.153 1.964.233 2.946.05.4.186 1.085.487 1.706.103.215.223.419.37.606.015.018.037.051.048.049.02-.003.742-1.642.804-1.765.036-.07.03-.055.003-.112zm3.861-.913h-.872a.126.126 0 0 1-.116-.178l1.178-2.625a.025.025 0 0 0-.023-.035l-1.318-.003a.148.148 0 0 1-.135-.21l.876-1.954a.025.025 0 0 0-.023-.035h-1.56c-.01 0-.02.006-.024.015l-.926 2.068c-.085.169-.314.634-.399.938a.534.534 0 0 0-.02.191.46.46 0 0 0 .23.378.981.981 0 0 0 .46.119h.59c.041 0-.688 1.482-.834 1.972a.53.53 0 0 0-.023.172.465.465 0 0 0 .23.398c.15.092.342.12.475.12l1.66-.001c.01 0 .02-.006.023-.015l.575-1.28a.025.025 0 0 0-.024-.035zm-6.93-4.937H3.1a.032.032 0 0 0-.034.033c0 1.048-.01 2.795-.01 6.829 0 .288-.269.262-.28.262h-.74c-.04.001-.044.004-.04.047.001.037.465 1.064.555 1.263.01.02.03.033.051.033.157.003.767.009.938-.014.153-.02.3-.06.438-.132.3-.156.49-.419.595-.765.052-.172.075-.353.075-.533.002-2.33 0-4.66-.007-6.991a.032.032 0 0 0-.032-.032zm11.784 6.896c0-.014-.01-.021-.024-.022h-1.465c-.048-.001-.049-.002-.05-.049v-4.66c0-.072-.005-.07.07-.07h.863c.08 0 .075.004.075-.074V8.393c0-.082.006-.076-.08-.076h-3.5c-.064 0-.075-.006-.075.073v1.445c0 .083-.006.077.08.077h.854c.075 0 .07-.004.07.07v4.624c0 .095.008.084-.085.084-.37 0-1.11-.002-1.304 0-.048.001-.06.03-.06.03l-.697 1.519s-.014.025-.008.036c.006.01.013.008.058.008 1.748.003 3.495.002 5.243.002.03-.001.034-.006.035-.033v-1.539zm4.177-3.43c0 .013-.007.023-.02.024-.346.006-.692.004-1.037.004-.014-.002-.022-.01-.022-.024-.005-.434-.007-.869-.01-1.303 0-.072-.006-.071.07-.07l.733-.003c.041 0 .081.002.12.015.093.025.16.107.165.204.006.431.002 1.153.001 1.153zm2.67.244a1.953 1.953 0 0 0-.883-.222h-.18c-.04-.001-.04-.003-.042-.04V10.21c0-.132-.007-.263-.025-.394a1.823 1.823 0 0 0-.153-.53 1.533 1.533 0 0 0-.677-.71 2.167 2.167 0 0 0-1-.258c-.153-.003-.567 0-.72 0-.07 0-.068.004-.068-.065V7.76c0-.031-.01-.041-.046-.039H17.93s-.016 0-.023.007c-.006.006-.008.012-.008.023v.546c-.008.036-.057.015-.082.022h-.95c-.022.002-.028.008-.03.032v1.481c0 .09-.004.082.082.082h.913c.082 0 .072.128.072.128V11.19s.003.117-.06.117h-1.482c-.068 0-.06.082-.06.082v1.445s-.01.068.064.068h1.457c.082 0 .076-.006.076.079v3.225c0 .088-.007.081.082.081h1.43c.09 0 .082.007.082-.08v-3.27c0-.029.006-.035.033-.035l2.323-.003c.098 0 .191.02.28.061a.46.46 0 0 1 .274.407c.008.395.003.79.003 1.185 0 .259-.107.367-.33.367h-1.218c-.023.002-.029.008-.028.033.184.437.374.871.57 1.303a.045.045 0 0 0 .04.026c.17.005.34.002.51.003.15-.002.517.004.666-.01a2.03 2.03 0 0 0 .408-.075c.59-.18.975-.698.976-1.313v-1.981c0-.128-.01-.254-.034-.38 0 .078-.029-.641-.724-.998z" />
    </svg>
  );
}

function ZhihuIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path fill="#0084FF" d="M5.721 0C2.251 0 0 2.25 0 5.719V18.28C0 21.751 2.252 24 5.721 24h12.56C21.751 24 24 21.75 24 18.281V5.72C24 2.249 21.75 0 18.281 0zm1.964 4.078c-.271.73-.5 1.434-.68 2.11h4.587c.545-.006.445 1.168.445 1.171H9.384a58.104 58.104 0 01-.112 3.797h2.712c.388.023.393 1.251.393 1.266H9.183a9.223 9.223 0 01-.408 2.102l.757-.604c.452.456 1.512 1.712 1.906 2.177.473.681.063 2.081.063 2.081l-2.794-3.382c-.653 2.518-1.845 3.607-1.845 3.607-.523.468-1.58.82-2.64.516 2.218-1.73 3.44-3.917 3.667-6.497H4.491c0-.015.197-1.243.806-1.266h2.71c.024-.32.086-3.254.086-3.797H6.598c-.136.406-.158.447-.268.753-.594 1.095-1.603 1.122-1.907 1.155.906-1.821 1.416-3.6 1.591-4.064.425-1.124 1.671-1.125 1.671-1.125zM13.078 6h6.377v11.33h-2.573l-2.184 1.373-.401-1.373h-1.219zm1.313 1.219v8.86h.623l.263.937 1.455-.938h1.456v-8.86z" />
    </svg>
  );
}

function XIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path fill="#000000" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.261 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface PlatformConfig {
  id: string;
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
    hint: <>前往 <code className="rounded-[4px] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg)] px-1 py-0.5">mp.weixin.qq.com</code> → 开发 → 基本配置，获取 AppID 和 AppSecret</>,
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
    hint: <>前往 <code className="rounded-[4px] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg)] px-1 py-0.5">developer.x.com</code> 创建项目并生成 API Keys 和 Access Tokens</>,
    fields: [
      { key: 'X_API_KEY', label: 'API Key', type: 'text', placeholder: '输入 X API Key' },
      { key: 'X_API_SECRET', label: 'API Secret', type: 'password', placeholder: '输入 X API Secret' },
      { key: 'X_ACCESS_TOKEN', label: 'Access Token', type: 'text', placeholder: '输入 X Access Token' },
      { key: 'X_ACCESS_TOKEN_SECRET', label: 'Access Token Secret', type: 'password', placeholder: '输入 X Access Token Secret' },
    ],
  },
];

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

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
  }

  function toggleSecret(key: string) {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    try {
      setErrorMessage('');
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
    <div className="space-y-6">
      <AppShellHeader
        kicker="Operational control"
        title="平台设置台"
        description="统一管理各平台 API 凭证与登录态。界面保持安静、克制，适合在发布前逐项核对。"
        action={
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={handleSave}
              type="button"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-[var(--wb-radius-lg)] border border-transparent bg-[color:var(--wb-accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-105 disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? '正在读取...' : '保存设置'}
            </button>
            {saved ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-[#2b9d62]">
                <CheckCircle2 size={14} />
                已保存
              </span>
            ) : errorMessage ? (
              <span className="max-w-[14rem] text-right text-sm text-[#b44d4d]">{errorMessage}</span>
            ) : null}
          </div>
        }
      />

      <div className="space-y-2">
        {platformConfigs.map((platform) => {
          const isExpanded = expandedPlatform === platform.id;
          const { Icon } = platform;

          return (
            <SurfaceCard key={platform.id} tone="soft" className="overflow-hidden px-0 py-0">
              <button
                type="button"
                aria-expanded={isExpanded}
                aria-controls={`${platform.id}-panel`}
                onClick={() => setExpandedPlatform(isExpanded ? null : platform.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[color:var(--wb-surface)] sm:px-6"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center">
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-medium text-[color:var(--wb-text)]">{platform.name}</p>
                  <p className="mt-0.5 text-sm text-[color:var(--wb-text-muted)]">{platform.summary}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs text-[color:var(--wb-text-muted)]">
                  <span>{isExpanded ? '收起' : '展开'}</span>
                  <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {isExpanded ? (
                <div id={`${platform.id}-panel`} className="border-t border-[color:var(--wb-border)] px-5 py-5 sm:px-6">
                  <div className="space-y-4">
                    {platform.fields.map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <label
                          htmlFor={field.key}
                          className="text-sm font-medium text-[color:var(--wb-text)]"
                        >
                          {field.label}
                        </label>
                        <div className="relative">
                          {field.type === 'textarea' ? (
                            <textarea
                              id={field.key}
                              value={values[field.key] || ''}
                              onChange={(event) => handleChange(field.key, event.target.value)}
                              placeholder={field.placeholder}
                              rows={4}
                              className="w-full resize-none rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-4 py-3 text-sm text-[color:var(--wb-text)] outline-none placeholder:text-[color:var(--wb-text-muted)] transition focus:border-[color:var(--wb-accent)]"
                            />
                          ) : (
                            <input
                              id={field.key}
                              type={field.type === 'password' && !showSecrets[field.key] ? 'password' : 'text'}
                              value={values[field.key] || ''}
                              onChange={(event) => handleChange(field.key, event.target.value)}
                              placeholder={field.placeholder}
                              className="w-full rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-4 py-3 pr-12 text-sm text-[color:var(--wb-text)] outline-none placeholder:text-[color:var(--wb-text-muted)] transition focus:border-[color:var(--wb-accent)]"
                            />
                          )}
                          {field.type === 'password' ? (
                            <button
                              type="button"
                              onClick={() => toggleSecret(field.key)}
                              aria-label={`${showSecrets[field.key] ? '隐藏' : '显示'} ${field.label}`}
                              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-[var(--wb-radius-lg)] p-1 text-[color:var(--wb-text-muted)] transition hover:bg-[color:var(--wb-bg-elevated)] hover:text-[color:var(--wb-text)]"
                            >
                              {showSecrets[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-[13px] leading-6 text-[color:var(--wb-text-muted)]">
                    {platform.hint}
                  </p>
                </div>
              ) : null}
            </SurfaceCard>
          );
        })}
      </div>
    </div>
  );
}
