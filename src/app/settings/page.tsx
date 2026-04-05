'use client';

import { useEffect, useState } from 'react';
import type { ElementType } from 'react';
import {
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  MessageSquare,
  BookOpen,
  GraduationCap,
  Twitter,
  ChevronDown,
  FileText,
  KeyRound,
  ShieldCheck,
  NotebookPen,
} from 'lucide-react';

import AppShellHeader from '@/components/layout/AppShellHeader';
import SurfaceCard from '@/components/layout/SurfaceCard';

interface PlatformConfig {
  id: string;
  name: string;
  icon: ElementType;
  summary: string;
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
    icon: MessageSquare,
    summary: '文章分发与公众号素材投递',
    fields: [
      {
        key: 'WECHAT_APP_ID',
        label: 'App ID',
        type: 'text',
        placeholder: '输入微信公众号 App ID',
      },
      {
        key: 'WECHAT_APP_SECRET',
        label: 'App Secret',
        type: 'password',
        placeholder: '输入微信公众号 App Secret',
      },
    ],
  },
  {
    id: 'xiaohongshu',
    name: '小红书',
    icon: BookOpen,
    summary: '图文分发与笔记发布通道',
    fields: [
      {
        key: 'XHS_APP_ID',
        label: 'App ID',
        type: 'text',
        placeholder: '输入小红书 App ID',
      },
      {
        key: 'XHS_APP_SECRET',
        label: 'App Secret',
        type: 'password',
        placeholder: '输入小红书 App Secret',
      },
      {
        key: 'XHS_ACCESS_TOKEN',
        label: 'Access Token',
        type: 'password',
        placeholder: '输入小红书 Access Token',
      },
    ],
  },
  {
    id: 'zhihu',
    name: '知乎',
    icon: GraduationCap,
    summary: '长文转载与问答场景投递',
    fields: [
      {
        key: 'ZHIHU_COOKIE',
        label: 'Cookie',
        type: 'textarea',
        placeholder: '从浏览器开发者工具中复制知乎的 Cookie',
      },
    ],
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    icon: Twitter,
    summary: '短帖同步与外部扩散',
    fields: [
      {
        key: 'X_API_KEY',
        label: 'API Key',
        type: 'text',
        placeholder: '输入 X API Key',
      },
      {
        key: 'X_API_SECRET',
        label: 'API Secret',
        type: 'password',
        placeholder: '输入 X API Secret',
      },
      {
        key: 'X_ACCESS_TOKEN',
        label: 'Access Token',
        type: 'text',
        placeholder: '输入 X Access Token',
      },
      {
        key: 'X_ACCESS_TOKEN_SECRET',
        label: 'Access Token Secret',
        type: 'password',
        placeholder: '输入 X Access Token Secret',
      },
    ],
  },
];

const memoNotes = [
  {
    title: '凭证只保存在服务器本地',
    body: '这里的字段会通过 Settings API 写入本地环境，不会上传到第三方服务。',
  },
  {
    title: '先展开，再填写',
    body: '每个渠道都做成可折叠文档面板，适合按平台逐个核对密钥和 Cookie。',
  },
  {
    title: '建议优先检查权限',
    body: '如果发布失败，先确认应用权限、登录态和字段是否完整，再回到分发台重试。',
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

        if (!response.ok) {
          throw new Error('加载设置失败，请稍后重试');
        }

        if (!cancelled) {
          setValues(data);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error ? error.message : '加载设置失败，请稍后重试',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
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

      if (!response.ok || !data.success) {
        throw new Error(data.error || '保存失败，请重试');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      setSaved(false);
      setErrorMessage(
        error instanceof Error ? error.message : '保存失败，请重试',
      );
    }
  }

  return (
    <div className="space-y-6">
      <AppShellHeader
        kicker="Operational control"
        title="平台设置台"
        description="统一管理各平台 API 凭证与登录态。界面保持安静、克制，适合在发布前逐项核对。"
      />

      <div className="space-y-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)]">
          <SurfaceCard tone="soft" className="px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 max-w-3xl">
                <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-[color:var(--wb-accent)]">
                  Operational memo
                </p>
                <h2
                  className="mt-2 text-[18px] leading-[1.35] text-[color:var(--wb-text)] sm:text-[20px]"
                  style={{ fontFamily: 'var(--wb-font-serif)' }}
                >
                  保存前，请把凭证当作文档核对
                </h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--wb-text-muted)]">
                  这里不是一次性表单，而是给发布系统做最后签发前检查的控制备忘。
                </p>
              </div>

              <div className="shrink-0 rounded-[22px] border border-[color:var(--wb-border)] bg-[linear-gradient(180deg,rgba(255,246,239,0.96)_0%,rgba(248,237,226,0.96)_100%)] px-5 py-5 shadow-[var(--wb-shadow-tight)] lg:w-[22rem]">
                <h3 className="flex items-center gap-2 text-sm font-medium text-[color:var(--wb-text)]">
                  <ShieldCheck size={16} className="text-[color:var(--wb-accent)]" />
                  Save / status
                </h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--wb-text-muted)]">
                  点击保存后，当前输入会提交到设置接口。状态会在保存成功后短暂回显。
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleSave}
                    type="button"
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border-strong)] bg-[color:var(--wb-accent)] px-5 py-2.5 text-sm font-medium text-white shadow-[0_14px_28px_rgba(215,120,67,0.22)] transition hover:brightness-105"
                  >
                    <Save size={16} />
                    {loading ? '正在读取设置...' : '保存设置'}
                  </button>
                  {saved ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#bfe8cb] bg-white px-3 py-2 text-sm text-[#2b9d62]">
                      <CheckCircle2 size={16} />
                      已保存
                    </span>
                  ) : errorMessage ? (
                    <span className="text-sm text-[#b44d4d]">{errorMessage}</span>
                  ) : (
                    <span className="text-sm text-[color:var(--wb-text-muted)]">
                      {loading ? '正在载入当前凭证状态。' : '未保存更改会保留在当前页面。'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </SurfaceCard>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {memoNotes.map((note) => (
              <div
                key={note.title}
                className="rounded-[22px] border border-[color:var(--wb-border)] bg-[rgba(255,252,247,0.82)] px-4 py-3 shadow-[var(--wb-shadow-tight)]"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-[color:var(--wb-text)]">
                  <NotebookPen size={14} className="text-[color:var(--wb-accent)]" />
                  {note.title}
                </div>
                <p className="mt-2 text-sm leading-6 text-[color:var(--wb-text-muted)]">
                  {note.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {platformConfigs.map((platform) => {
            const isExpanded = expandedPlatform === platform.id;
            const Icon = platform.icon;

            return (
              <SurfaceCard
                key={platform.id}
                tone="soft"
                className="overflow-hidden px-0 py-0"
              >
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={`${platform.id}-panel`}
                  onClick={() =>
                    setExpandedPlatform(isExpanded ? null : platform.id)
                  }
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/45 sm:px-6"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--wb-border)] bg-white/85 text-[color:var(--wb-accent)] shadow-[var(--wb-shadow-tight)]">
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-medium text-[color:var(--wb-text)]">
                        {platform.name}
                      </span>
                      <span className="rounded-full border border-[color:var(--wb-border)] bg-white/75 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-[color:var(--wb-text-muted)]">
                        Document panel
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-[color:var(--wb-text-muted)]">
                      {platform.summary}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 text-xs text-[color:var(--wb-text-muted)]">
                    <span>{isExpanded ? '收起' : '展开'}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {isExpanded ? (
                  <div
                    id={`${platform.id}-panel`}
                    className="border-t border-[color:var(--wb-border)] px-5 py-5 sm:px-6"
                  >
                    <div className="mb-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[20px] border border-[color:var(--wb-border)] bg-white/75 px-4 py-3 shadow-[var(--wb-shadow-tight)]">
                        <p className="text-[11px] uppercase tracking-[0.26em] text-[color:var(--wb-text-muted)]">
                          Document type
                        </p>
                        <p className="mt-2 text-sm text-[color:var(--wb-text)]">
                          {platform.name} 凭证表
                        </p>
                      </div>
                      <div className="rounded-[20px] border border-[color:var(--wb-border)] bg-white/75 px-4 py-3 shadow-[var(--wb-shadow-tight)]">
                        <p className="text-[11px] uppercase tracking-[0.26em] text-[color:var(--wb-text-muted)]">
                          Field count
                        </p>
                        <p className="mt-2 text-sm text-[color:var(--wb-text)]">
                          {platform.fields.length} 个输入项
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {platform.fields.map((field) => (
                        <div key={field.key} className="space-y-2">
                          <label
                            htmlFor={field.key}
                            className="flex items-center gap-2 text-sm font-medium text-[color:var(--wb-text)]"
                          >
                            <FileText size={14} className="text-[color:var(--wb-accent)]" />
                            {field.label}
                          </label>
                          <div className="relative">
                            {field.type === 'textarea' ? (
                              <textarea
                                id={field.key}
                                value={values[field.key] || ''}
                                onChange={(event) =>
                                  handleChange(field.key, event.target.value)
                                }
                                placeholder={field.placeholder}
                                rows={4}
                                className="w-full resize-none rounded-[20px] border border-[color:var(--wb-border)] bg-[rgba(255,252,247,0.9)] px-4 py-3 text-sm text-[color:var(--wb-text)] outline-none placeholder:text-[color:var(--wb-text-muted)] transition focus:border-[color:var(--wb-border-strong)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(200,106,61,0.08)]"
                              />
                            ) : (
                              <input
                                id={field.key}
                                type={
                                  field.type === 'password' &&
                                  !showSecrets[field.key]
                                    ? 'password'
                                    : 'text'
                                }
                                value={values[field.key] || ''}
                                onChange={(event) =>
                                  handleChange(field.key, event.target.value)
                                }
                                placeholder={field.placeholder}
                                className="w-full rounded-[20px] border border-[color:var(--wb-border)] bg-[rgba(255,252,247,0.9)] px-4 py-3 pr-12 text-sm text-[color:var(--wb-text)] outline-none placeholder:text-[color:var(--wb-text-muted)] transition focus:border-[color:var(--wb-border-strong)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(200,106,61,0.08)]"
                              />
                            )}
                            {field.type === 'password' ? (
                              <button
                                type="button"
                                onClick={() => toggleSecret(field.key)}
                                aria-label={`${showSecrets[field.key] ? '隐藏' : '显示'} ${field.label}`}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[color:var(--wb-text-muted)] transition hover:bg-white hover:text-[color:var(--wb-text)]"
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
                  </div>
                ) : null}
              </SurfaceCard>
            );
          })}
        </div>

        <SurfaceCard tone="soft" className="px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--wb-border)] bg-white/85 text-[color:var(--wb-accent)] shadow-[var(--wb-shadow-tight)]">
              <KeyRound size={16} />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-[color:var(--wb-accent)]">
                Credential guide
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--wb-text-muted)]">
                如果你需要重新获取凭证，优先从平台后台或浏览器登录态里补齐字段，再回到对应文档面板继续填写。
              </p>
            </div>
          </div>

          <ul className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--wb-text-muted)]">
            <li>
              <strong className="text-[color:var(--wb-text)]">微信公众号：</strong>
              前往 <code className="rounded bg-white/80 px-1 py-0.5">mp.weixin.qq.com</code> →
              开发 → 基本配置，获取 AppID 和 AppSecret
            </li>
            <li>
              <strong className="text-[color:var(--wb-text)]">小红书：</strong>
              前往小红书开放平台注册开发者账号并创建应用
            </li>
            <li>
              <strong className="text-[color:var(--wb-text)]">知乎：</strong>
              使用浏览器登录知乎后，在开发者工具的 Network 面板中复制 Cookie
            </li>
            <li>
              <strong className="text-[color:var(--wb-text)]">X (Twitter)：</strong>
              前往 <code className="rounded bg-white/80 px-1 py-0.5">developer.x.com</code> 创建项目并生成 API Keys 和 Access Tokens
            </li>
          </ul>
        </SurfaceCard>
      </div>
    </div>
  );
}
