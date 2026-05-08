'use client';

import { markdownToStyledHtml } from '@/lib/markdown';
import * as styles from './publish.css';

interface WeChatArticlePreviewProps {
  title: string;
  body: string;
}

export default function WeChatArticlePreview({ title, body }: WeChatArticlePreviewProps) {
  const html = markdownToStyledHtml(title, body, 'wechat');

  return (
    <div className={styles.wechatPreviewFrame}>
      {/* 模拟微信文章顶栏 */}
      <div className={styles.wechatHeader}>
        <div className={styles.wechatHeaderLeft}>
          <div className={styles.wechatAvatar} />
          <div>
            <p className={styles.wechatAuthor}>公众号名称</p>
            <p className={styles.wechatDate}>今天</p>
          </div>
        </div>
      </div>

      {/* 文章内容 */}
      <div
        className={styles.wechatBody}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* 底部栏 */}
      <div className={styles.wechatFooter}>
        <span className={styles.wechatFooterAction}>阅读 128</span>
        <span className={styles.wechatFooterAction}>在看 12</span>
        <span className={styles.wechatFooterAction}>点赞 36</span>
      </div>
    </div>
  );
}
