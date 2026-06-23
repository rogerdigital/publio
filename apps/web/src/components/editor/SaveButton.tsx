import { Save } from 'lucide-react';
import { useSaveStatusStore } from '@/stores/saveStatusStore';
import { usePublishStore } from '@/stores/publishStore';
import { countCharacters, TITLE_LIMIT, CONTENT_LIMIT } from '@/lib/contentStats';
import * as styles from './editor.css';

interface SaveButtonProps {
  onSave?: () => Promise<void> | void;
}

/**
 * 保存按钮：自行订阅保存状态 store（saveStatus/isDirty），状态变化只重渲染
 * 本按钮，不会连带重渲染整棵编辑器（MDEditor）导致正文瞬间空白。
 */
export default function SaveButton({ onSave }: SaveButtonProps) {
  const saveStatus = useSaveStatusStore((s) => s.saveStatus);
  const isDirty = useSaveStatusStore((s) => s.isDirty);
  const title = usePublishStore((s) => s.title);
  const content = usePublishStore((s) => s.content);
  const titleOver = countCharacters(title) > TITLE_LIMIT;
  const contentOver = countCharacters(content) > CONTENT_LIMIT;
  const canSave = isDirty && !!title.trim() && !!content.trim() && !titleOver && !contentOver;

  return (
    <button
      type="button"
      className={styles.editorSaveBtn}
      onClick={() => void onSave?.()}
      disabled={!canSave || saveStatus === 'saving'}
      title="保存草稿 (Ctrl+S)"
    >
      <Save size={13} />
      {saveStatus === 'saving' ? '保存中…' : '保存'}
    </button>
  );
}
