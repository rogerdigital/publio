import AppShellHeader from '@/components/layout/AppShellHeader';
import DraftLibraryClient from '@/components/drafts/DraftLibraryClient';
import * as styles from './page.css';

export const metadata = {
  title: '稿件库 - Publio',
};

export default function DraftsPage() {
  return (
    <div className={styles.pageWrap}>
      <AppShellHeader
        kicker="Draft library"
        title="稿件库"
        description="集中管理草稿、待同步内容和各平台分发结果。"
      />
      <DraftLibraryClient />
    </div>
  );
}
