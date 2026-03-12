'use client';

import { usePublishStore } from '@/stores/publishStore';
import { PLATFORMS, PlatformId } from '@/types';
import {
  MessageSquare,
  BookOpen,
  GraduationCap,
  Twitter,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';

const iconMap = {
  MessageSquare,
  BookOpen,
  GraduationCap,
  Twitter,
};

export default function PublishStatusPanel() {
  const { results, overallStatus } = usePublishStore();

  if (overallStatus === 'idle') return null;

  return (
    <div className="space-y-2 mt-4">
      <h3 className="text-sm font-medium text-gray-700">发布结果</h3>
      <div className="space-y-2">
        {results.length > 0
          ? results.map((result) => {
              const platform = PLATFORMS.find((p) => p.id === result.platform);
              if (!platform) return null;
              const Icon =
                iconMap[platform.icon as keyof typeof iconMap];

              return (
                <div
                  key={result.platform}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                    result.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : result.status === 'error'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Icon size={18} className="text-gray-600 shrink-0" />
                  <span className="text-sm font-medium text-gray-800 shrink-0">
                    {platform.name}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-sm ${
                        result.status === 'success'
                          ? 'text-green-700'
                          : result.status === 'error'
                          ? 'text-red-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {result.message}
                    </span>
                  </div>
                  {result.status === 'success' && (
                    <CheckCircle2
                      size={18}
                      className="text-green-600 shrink-0"
                    />
                  )}
                  {result.status === 'error' && (
                    <XCircle size={18} className="text-red-600 shrink-0" />
                  )}
                  {result.status === 'publishing' && (
                    <Loader2
                      size={18}
                      className="text-blue-600 animate-spin shrink-0"
                    />
                  )}
                  {result.url && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 shrink-0"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              );
            })
          : // Show loading placeholders during publishing
            overallStatus === 'publishing' && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-gray-50 border-gray-200">
                <Loader2
                  size={18}
                  className="text-blue-600 animate-spin shrink-0"
                />
                <span className="text-sm text-gray-500">
                  正在发布到各平台...
                </span>
              </div>
            )}
      </div>
    </div>
  );
}
