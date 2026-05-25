import AppShellHeader from '@/components/layout/AppShellHeader';

interface TopicDeskHeaderProps {
  generatedAt: string;
  totalCount: number;
}

export default function TopicDeskHeader({ generatedAt, totalCount }: TopicDeskHeaderProps) {
  return (
    <AppShellHeader
      kicker="AI News"
      title="AI 热点资讯"
      description={`聚合全球 AI 信息源，为中文从业者筛选最有价值的话题。${generatedAt ? `最近更新：${generatedAt}。` : ''}当前 ${totalCount} 条。`}
    />
  );
}
