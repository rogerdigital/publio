'use client';

import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import { usePublishStore } from '@/stores/publishStore';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function MarkdownEditor() {
  const { content, setContent } = usePublishStore();

  return (
    <div data-color-mode="light">
      <MDEditor
        value={content}
        onChange={(val) => setContent(val || '')}
        height={500}
        preview="live"
        visibleDragbar={false}
      />
    </div>
  );
}
