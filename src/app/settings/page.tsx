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
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h2 className="text-xl font-bold text-gray-900 mb-2">平台设置</h2>
      <p className="text-sm text-gray-500 mb-6">
        配置各平台的 API 凭证。凭证仅保存在服务器本地，不会上传到任何第三方。
      </p>

      <div className="space-y-3">
        {platformConfigs.map((platform) => {
          const isExpanded = expandedPlatform === platform.id;
          const Icon = platform.icon;

          return (
            <div
              key={platform.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedPlatform(isExpanded ? null : platform.id)
                }
                className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <Icon size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-800">
                  {platform.name}
                </span>
                <span className="ml-auto text-gray-400 text-xs">
                  {isExpanded ? '收起' : '展开'}
                </span>
              </button>

              {isExpanded && (
                <div className="p-4 space-y-4 bg-white">
                  {platform.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none pr-10"
                          />
                        )}
                        {field.type === 'password' && (
                          <button
                            type="button"
                            onClick={() => toggleSecret(field.key)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Save size={16} />
          保存设置
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600">
            <CheckCircle2 size={16} />
            已保存
          </span>
        )}
      </div>

      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="text-sm font-medium text-amber-800 mb-2">
          获取 API 凭证说明
        </h3>
        <ul className="text-xs text-amber-700 space-y-1.5">
          <li>
            <strong>微信公众号：</strong>前往{' '}
            <code className="bg-amber-100 px-1 rounded">mp.weixin.qq.com</code>{' '}
            → 开发 → 基本配置，获取 AppID 和 AppSecret
          </li>
          <li>
            <strong>小红书：</strong>前往小红书开放平台注册开发者账号并创建应用
          </li>
          <li>
            <strong>知乎：</strong>使用浏览器登录知乎后，在开发者工具的 Network 面板中复制
            Cookie
          </li>
          <li>
            <strong>X (Twitter)：</strong>前往{' '}
            <code className="bg-amber-100 px-1 rounded">developer.x.com</code>{' '}
            创建项目并生成 API Keys 和 Access Tokens
          </li>
        </ul>
      </div>
    </div>
  );
}
