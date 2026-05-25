import AppShellHeader from '@/components/layout/AppShellHeader';

interface TopicDeskHeaderProps {
  generatedAt: string;
  todayCount: number;
  followCount: number;
}

export default function TopicDeskHeader({
  generatedAt,
  todayCount,
  followCount,
}: TopicDeskHeaderProps) {
  return (
    <AppShellHeader
      kicker="Topic desk"
      title="选题工作台"
      description={`把最近 24 小时的 AI 信息压成可判断的选题列表。${generatedAt ? `最近更新：${generatedAt}。` : ''}今天能发 ${todayCount} 条，还能追 ${followCount} 条。`}
    />
  );
}
