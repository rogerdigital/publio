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
      <h3 className="text-sm font-medium text-[#f0e6da]">发布结果</h3>
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
                      ? 'bg-[rgba(31,157,85,0.12)] border-[rgba(31,157,85,0.28)]'
                      : result.status === 'error'
                      ? 'bg-[rgba(239,68,68,0.12)] border-[rgba(239,68,68,0.28)]'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <Icon size={18} className="text-[#cfc4b7] shrink-0" />
                  <span className="text-sm font-medium text-[#f5ebdf] shrink-0">
                    {platform.name}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-sm ${
                        result.status === 'success'
                          ? 'text-[#7fe2a6]'
                          : result.status === 'error'
                          ? 'text-[#ffb2b2]'
                          : 'text-[#aba295]'
                      }`}
                    >
                      {result.message}
                    </span>
                  </div>
                  {result.status === 'success' && (
                    <CheckCircle2
                      size={18}
                      className="text-[#7fe2a6] shrink-0"
                    />
                  )}
                  {result.status === 'error' && (
                    <XCircle size={18} className="text-[#ff8f8f] shrink-0" />
                  )}
                  {result.status === 'publishing' && (
                    <Loader2
                      size={18}
                      className="text-[#ff9a67] animate-spin shrink-0"
                    />
                  )}
                  {result.url && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#ffb08a] hover:text-[#ffd9c4] shrink-0"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              );
            })
          : // Show loading placeholders during publishing
            overallStatus === 'publishing' && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-white/5 border-white/10">
                <Loader2
                  size={18}
                  className="text-[#ff9a67] animate-spin shrink-0"
                />
                <span className="text-sm text-[#aba295]">
                  正在发布到各平台...
                </span>
              </div>
            )}
      </div>
    </div>
  );
}
