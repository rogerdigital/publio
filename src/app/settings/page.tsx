'use client';

import { useState } from 'react';
import {
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  MessageSquare,
  BookOpen,
  GraduationCap,
  Twitter,
} from 'lucide-react';

interface PlatformConfig {
  id: string;
  name: string;
  icon: React.ElementType;
  fields: { key: string; label: string; type: 'text' | 'password' | 'textarea'; placeholder: string }[];
}

const platformConfigs: PlatformConfig[] = [
  {
    id: 'wechat',
    name: '微信公众号',
    icon: MessageSquare,
    fields: [
      { key: 'WECHAT_APP_ID', label: 'App ID', type: 'text', placeholder: '输入微信公众号 App ID' },
      { key: 'WECHAT_APP_SECRET', label: 'App Secret', type: 'password', placeholder: '输入微信公众号 App Secret' },
    ],
  },
  {
    id: 'xiaohongshu',
    name: '小红书',
    icon: BookOpen,
    fields: [
      { key: 'XHS_APP_ID', label: 'App ID', type: 'text', placeholder: '输入小红书 App ID' },
      { key: 'XHS_APP_SECRET', label: 'App Secret', type: 'password', placeholder: '输入小红书 App Secret' },
      { key: 'XHS_ACCESS_TOKEN', label: 'Access Token', type: 'password', placeholder: '输入小红书 Access Token' },
    ],
  },
  {
    id: 'zhihu',
    name: '知乎',
    icon: GraduationCap,
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

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function toggleSecret(key: string) {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('保存失败，请重试');
    }
  }

  return (
    <div className="min-h-screen bg-[#151515] px-4 py-6 text-[#ece2d6] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-6 py-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
          <p className="text-xs uppercase tracking-[0.3em] text-[#ff9a67]">
            Settings
          </p>
          <h2 className="mt-3 text-[34px] font-semibold leading-tight text-[#fff5e8]">
            平台设置
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#a89f93]">
            配置各平台的 API 凭证。凭证仅保存在服务器本地，不会上传到任何第三方。我们把这页也统一到和新闻页、编辑页相同的深色产品壳层。
          </p>
        </div>

        <div className="space-y-3">
        {platformConfigs.map((platform) => {
          const isExpanded = expandedPlatform === platform.id;
          const Icon = platform.icon;

          return (
            <div
              key={platform.id}
              className="overflow-hidden rounded-[22px] border border-white/10 bg-[#1b1a18]"
            >
              <button
                onClick={() =>
                  setExpandedPlatform(isExpanded ? null : platform.id)
                }
                className="w-full flex items-center gap-3 px-4 py-3.5 bg-white/4 hover:bg-white/6 transition-colors text-left"
              >
                <Icon size={18} className="text-[#c9bfb3]" />
                <span className="text-sm font-medium text-[#fff2e8]">
                  {platform.name}
                </span>
                <span className="ml-auto text-[#8d857b] text-xs">
                  {isExpanded ? '收起' : '展开'}
                </span>
              </button>

              {isExpanded && (
                <div className="p-4 space-y-4 bg-[#171614]">
                  {platform.fields.map((field) => (
                    <div key={field.key}>
                      <label className="mb-1 block text-sm font-medium text-[#ddd2c6]">
                        {field.label}
                      </label>
                      <div className="relative">
                        {field.type === 'textarea' ? (
                          <textarea
                            value={values[field.key] || ''}
                            onChange={(e) =>
                              handleChange(field.key, e.target.value)
                            }
                            placeholder={field.placeholder}
                            rows={3}
                            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#fff2e8] outline-none placeholder:text-[#6f675e] focus:border-[rgba(255,122,69,0.35)]"
                          />
                        ) : (
                          <input
                            type={
                              field.type === 'password' && !showSecrets[field.key]
                                ? 'password'
                                : 'text'
                            }
                            value={values[field.key] || ''}
                            onChange={(e) =>
                              handleChange(field.key, e.target.value)
                            }
                            placeholder={field.placeholder}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 pr-10 text-sm text-[#fff2e8] outline-none placeholder:text-[#6f675e] focus:border-[rgba(255,122,69,0.35)]"
                          />
                        )}
                        {field.type === 'password' && (
                          <button
                            type="button"
                            onClick={() => toggleSecret(field.key)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8e857b] hover:text-[#fff0e2]"
                          >
                            {showSecrets[field.key] ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-[linear-gradient(90deg,#ef6b38_0%,#c45f35_100%)] px-5 py-2.5 text-sm font-medium text-white shadow-[0_14px_28px_rgba(0,0,0,0.24)] transition hover:brightness-105"
          >
            <Save size={16} />
            保存设置
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-[#88e0a8]">
              <CheckCircle2 size={16} />
              已保存
            </span>
          )}
        </div>

        <div className="mt-8 rounded-[24px] border border-[rgba(255,122,69,0.18)] bg-[rgba(255,122,69,0.06)] p-5">
          <h3 className="mb-2 text-sm font-medium text-[#ffd7c4]">
            获取 API 凭证说明
          </h3>
          <ul className="space-y-1.5 text-xs leading-6 text-[#d4b9a9]">
            <li>
              <strong className="text-[#fff0e4]">微信公众号：</strong>前往{' '}
              <code className="rounded bg-black/20 px-1 py-0.5">mp.weixin.qq.com</code>{' '}
              → 开发 → 基本配置，获取 AppID 和 AppSecret
            </li>
            <li>
              <strong className="text-[#fff0e4]">小红书：</strong>前往小红书开放平台注册开发者账号并创建应用
            </li>
            <li>
              <strong className="text-[#fff0e4]">知乎：</strong>使用浏览器登录知乎后，在开发者工具的 Network 面板中复制
              Cookie
            </li>
            <li>
              <strong className="text-[#fff0e4]">X (Twitter)：</strong>前往{' '}
              <code className="rounded bg-black/20 px-1 py-0.5">developer.x.com</code>{' '}
              创建项目并生成 API Keys 和 Access Tokens
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
