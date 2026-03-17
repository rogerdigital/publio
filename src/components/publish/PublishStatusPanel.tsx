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
      <h3 className="text-sm font-medium text-[#4b4037]">发布结果</h3>
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
                      ? 'bg-[#eefbf2] border-[#bfe8cb]'
                      : result.status === 'error'
                      ? 'bg-[#fff1f1] border-[#f4c1c1]'
                      : 'bg-[#fffdfb] border-[#e8ddd2]'
                  }`}
                >
                  <Icon size={18} className="text-[#7d6f64] shrink-0" />
                  <span className="text-sm font-medium text-[#3a3029] shrink-0">
                    {platform.name}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-sm ${
                        result.status === 'success'
                          ? 'text-[#247a4b]'
                          : result.status === 'error'
                          ? 'text-[#bf4b4b]'
                          : 'text-[#7d7065]'
                      }`}
                    >
                      {result.message}
                    </span>
                  </div>
                  {result.status === 'success' && (
                    <CheckCircle2
                      size={18}
                      className="text-[#2b9d62] shrink-0"
                    />
                  )}
                  {result.status === 'error' && (
                    <XCircle size={18} className="text-[#de6a6a] shrink-0" />
                  )}
                  {result.status === 'publishing' && (
                    <Loader2
                      size={18}
                      className="text-[#ef6b38] animate-spin shrink-0"
                    />
                  )}
                  {result.url && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#d77443] hover:text-[#9e4d27] shrink-0"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              );
            })
          : // Show loading placeholders during publishing
            overallStatus === 'publishing' && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-[#fffdfb] border-[#e8ddd2]">
                <Loader2
                  size={18}
                  className="text-[#ef6b38] animate-spin shrink-0"
                />
                <span className="text-sm text-[#7d7065]">
                  正在发布到各平台...
                </span>
              </div>
            )}
      </div>
    </div>
  );
}
