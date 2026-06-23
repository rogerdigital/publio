import { Code, Columns2 } from 'lucide-react';
import { usePublishStore } from '@/stores/publishStore';
import * as styles from './editor.css';

export default function EditorModeToggle() {
  const { editorMode, setEditorMode } = usePublishStore();

  return (
    <div className={styles.modeToggle}>
      <button
        type="button"
        className={styles.modeToggleBtn({ active: editorMode === 'source' })}
        onClick={() => setEditorMode('source')}
        aria-label="源码模式"
        title="源码模式（仅编辑，无预览）"
      >
        <Code size={13} />
        源码
      </button>
      <button
        type="button"
        className={styles.modeToggleBtn({ active: editorMode === 'live' })}
        onClick={() => setEditorMode('live')}
        aria-label="实时预览模式"
        title="实时预览（编辑与渲染并排）"
      >
        <Columns2 size={13} />
        实时
      </button>
    </div>
  );
}
