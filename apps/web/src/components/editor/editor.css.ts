import { globalStyle, style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/app/styles/tokens.css';

// MarkdownEditor outer wrapper
export const editorRoot = style({
  overflow: 'hidden',
  background: vars.color.surface,
});

// Title input area
export const titleRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.lg,
  padding: vars.spacing.xl,
  '@media': {
    'screen and (min-width: 640px)': {
      padding: `${vars.spacing.xl} ${vars.spacing['2xl']}`,
    },
  },
});

export const titleInput = style({
  fontFamily: vars.font.serif,
  flex: 1,
  minWidth: 0,
  border: 0,
  background: 'transparent',
  fontSize: vars.fontSize['3xl'],
  lineHeight: 1.3,
  color: vars.color.text,
  outline: 'none',
  selectors: {
    '&:focus, &:focus-visible': {
      outline: 'none',
      boxShadow: 'none',
    },
  },
  '::placeholder': {
    color: vars.color.textMuted,
  },
  '@media': {
    'screen and (min-width: 640px)': {
      fontSize: vars.fontSize['4xl'],
    },
  },
});

// MDEditor wrapper — globalStyle overrides for third-party component
export const editorWrap = style({
  background: vars.color.surface,
  position: 'relative',
  outline: 'none',
});

globalStyle(`${editorWrap} .w-md-editor`, {
  border: 'none',
  borderRadius: 0,
  boxShadow: 'none !important',
  background: 'transparent',
  color: vars.color.text,
});

globalStyle(`${editorWrap} .w-md-editor:focus-within`, {
  boxShadow: 'none !important',
});

globalStyle(`${editorWrap} .w-md-editor-toolbar`, {
  borderTop: `1px solid ${vars.color.borderFaint}`,
  borderBottom: `1px solid ${vars.color.borderFaint}`,
  background: vars.color.surface,
  padding: `${vars.spacing.sm} ${vars.spacing.lg}`,
});

globalStyle(`${editorWrap} .w-md-editor-toolbar button`, {
  color: vars.color.textMuted,
});

globalStyle(`${editorWrap} .w-md-editor-toolbar button:hover`, {
  background: vars.color.bgElevated,
  color: vars.color.text,
});

globalStyle(`${editorWrap} .w-md-editor-toolbar button svg`, {
  color: 'currentColor',
});

globalStyle(`${editorWrap} .w-md-editor-toolbar-divider`, {
  background: vars.color.borderFaint,
});

globalStyle(`${editorWrap} .w-md-editor-bar`, {
  display: 'none',
});

globalStyle(`${editorWrap} .w-md-editor-text-input`, {
  fontFamily: vars.font.sans,
  background: 'transparent',
  color: vars.color.text,
  outline: 'none',
});

globalStyle(
  `${editorWrap} .w-md-editor-text-input:focus, ${editorWrap} .w-md-editor-text-input:focus-visible`,
  {
    outline: 'none',
    boxShadow: 'none',
  },
);

globalStyle(`${editorWrap} .w-md-editor-text-input::placeholder`, {
  color: vars.color.textMuted,
});

globalStyle(`${editorWrap} .wmde-markdown`, {
  background: 'transparent',
  color: vars.color.text,
});

globalStyle(`${editorWrap} .w-md-editor-area`, {
  background: 'transparent',
});

// Mobile textarea fallback
export const mobileTextarea = style({
  minHeight: '18rem',
  width: '100%',
  resize: 'vertical',
  border: 0,
  background: 'transparent',
  padding: vars.spacing.xl,
  fontSize: vars.fontSize.base,
  lineHeight: 1.75,
  color: vars.color.text,
  outline: 'none',
  '::placeholder': {
    color: vars.color.textMuted,
  },
  '@media': {
    'screen and (min-width: 640px)': {
      minHeight: '22rem',
      padding: vars.spacing['2xl'],
    },
  },
});

// Stats bar
export const statsBar = style({
  padding: `${vars.spacing.md} ${vars.spacing.xl} ${vars.spacing.lg}`,
  '@media': {
    'screen and (min-width: 640px)': {
      padding: `${vars.spacing.md} ${vars.spacing['2xl']} ${vars.spacing.lg}`,
    },
  },
});

export const statsRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: vars.spacing.md,
  rowGap: vars.spacing.xs,
  fontSize: vars.fontSize['2xs'],
  color: vars.color.textMuted,
});

export const statsDot = style({
  color: vars.color.borderStrong,
});

// Preview area
export const previewWrap = style({
  display: 'flex',
  minHeight: '34rem',
  alignItems: 'flex-start',
  justifyContent: 'center',
  background: `linear-gradient(180deg, ${vars.color.surface} 0%, ${vars.color.bg} 100%)`,
  padding: vars.spacing['2xl'],
  '@media': {
    'screen and (min-width: 640px)': {
      padding: vars.spacing['4xl'],
    },
    'screen and (min-width: 1024px)': {
      minHeight: '36rem',
      paddingTop: vars.spacing['5xl'],
    },
  },
});

// 模拟手机/公众号文章阅读容器
export const previewPhoneFrame = style({
  width: '100%',
  maxWidth: '680px',
  minHeight: '24rem',
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  boxShadow: vars.shadow.lg,
  overflow: 'hidden',
});

// 公众号风格顶部栏（模拟 status bar）
export const previewPhoneBar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: '38px',
  padding: `0 ${vars.spacing['lg-xl']}`,
  borderBottom: `1px solid ${vars.color.borderFaint}`,
  background: vars.color.surfaceStrong,
});

export const previewPhoneBarDot = style({
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  background: vars.color.borderStrong,
});

export const previewPhoneBarDots = style({
  display: 'flex',
  gap: vars.spacing.xs,
});

export const previewPhoneBarLabel = style({
  fontSize: '10px',
  color: vars.color.textMuted,
  letterSpacing: '0.08em',
});

// 文章内容内边距容器
export const previewInner = style({
  padding: `${vars.spacing['4xl']} ${vars.spacing['4xl']} ${vars.spacing['5xl']}`,
});

export const previewKicker = style({
  fontSize: vars.fontSize['2xs'],
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.30em',
  color: vars.color.accent,
});

export const previewTitle = style({
  fontFamily: vars.font.serif,
  marginTop: vars.spacing.md,
  fontSize: vars.fontSize['4xl'],
  lineHeight: 1.3,
  color: vars.color.text,
});

export const previewTitleBlock = style({
  marginBottom: vars.spacing['2xl'],
});

// Markdown preview content (dangerouslySetInnerHTML target)
export const previewContent = style({
  color: vars.color.text,
});

globalStyle(`${previewContent} p`, {
  margin: '16px 0',
  fontSize: vars.fontSize.lg,
  lineHeight: 2,
  color: vars.color.text,
});

globalStyle(`${previewContent} h1`, {
  marginBottom: vars.spacing.lg,
  fontSize: '30px',
  lineHeight: 1.3,
  fontWeight: 600,
  color: vars.color.text,
});

globalStyle(`${previewContent} h2`, {
  marginTop: vars.spacing['5xl'],
  marginBottom: vars.spacing.xl,
  fontSize: '22px',
  lineHeight: 1.3,
  fontWeight: 600,
  color: vars.color.text,
});

globalStyle(`${previewContent} h3`, {
  marginTop: vars.spacing['4xl'],
  marginBottom: vars.spacing.lg,
  paddingLeft: vars.spacing.lg,
  borderLeft: `4px solid ${vars.color.accent}`,
  fontSize: '19px',
  lineHeight: 1.4,
  fontWeight: 600,
  color: vars.color.text,
});

globalStyle(`${previewContent} blockquote`, {
  margin: '20px 0',
  borderRadius: '18px',
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: `${vars.spacing.xl} ${vars.spacing['2xl']}`,
  color: vars.color.textMuted,
});

globalStyle(`${previewContent} code`, {
  borderRadius: '8px',
  background: vars.color.accentSoft,
  padding: `${vars.spacing['2xs']} ${vars.spacing.sm}`,
  fontSize: '0.94em',
});

globalStyle(`${previewContent} hr`, {
  margin: '32px 0',
  borderColor: vars.color.border,
});

globalStyle(`${previewContent} img`, {
  margin: '24px 0',
  maxWidth: '100%',
  borderRadius: '18px',
  border: `1px solid ${vars.color.border}`,
});

globalStyle(`${previewContent} ul`, {
  margin: '16px 0',
  paddingLeft: vars.spacing['3xl'],
});

globalStyle(`${previewContent} ol`, {
  margin: '16px 0',
  paddingLeft: vars.spacing['3xl'],
});

globalStyle(`${previewContent} li`, {
  margin: '8px 0',
});

globalStyle(`${previewContent} a`, {
  color: vars.color.accent,
  textDecoration: 'underline',
  textDecorationColor: vars.color.accentSoft,
  textUnderlineOffset: '4px',
});

// EditorialContextCard styles
export const contextCard = style({
  padding: `${vars.spacing.lg} ${vars.spacing.xl}`,
  '@media': {
    'screen and (min-width: 640px)': {
      padding: `${vars.spacing.lg} ${vars.spacing['2xl']}`,
    },
  },
});

export const contextInner = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.lg,
});

export const contextHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.lg,
  '@media': {
    'screen and (min-width: 768px)': {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  },
});

export const contextHeaderText = style({
  maxWidth: '42rem',
});

export const contextKicker = style({
  fontSize: vars.fontSize['2xs'],
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.32em',
  color: vars.color.accent,
});

export const contextDesc = style({
  marginTop: vars.spacing.md,
  fontSize: vars.fontSize.md,
  lineHeight: 1.75,
  color: vars.color.textMuted,
});

export const contextBadges = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing.md,
});

export const contextBadgeNeutral = style({
  borderRadius: vars.radius.full,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: `${vars.spacing.xs} ${vars.spacing.lg}`,
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
});

export const contextBadgeAccent = style({
  borderRadius: vars.radius.full,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.accentSoft,
  padding: `${vars.spacing.xs} ${vars.spacing.lg}`,
  fontSize: vars.fontSize.xs,
  color: vars.color.accent,
});

export const titleBlock = style({
  borderRadius: '18px',
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: `${vars.spacing.lg} ${vars.spacing.xl}`,
});

export const titleBlockLabel = style({
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.28em',
  color: vars.color.textMuted,
});

export const titleBlockValue = style({
  fontFamily: vars.font.serif,
  marginTop: vars.spacing.md,
  fontSize: vars.fontSize.lg,
  lineHeight: 1.4,
  color: vars.color.text,
});

export const titleBlockEmpty = style({
  borderRadius: '18px',
  border: `1px dashed ${vars.color.borderStrong}`,
  background: vars.color.bgElevated,
  padding: `${vars.spacing.lg} ${vars.spacing.xl}`,
  fontSize: vars.fontSize.md,
  lineHeight: 1.75,
  color: vars.color.textMuted,
});

export const statsGrid = style({
  display: 'grid',
  gap: vars.spacing.md,
  gridTemplateColumns: '1fr 1fr',
  '@media': {
    'screen and (min-width: 1280px)': {
      gridTemplateColumns: 'repeat(4, 1fr)',
    },
  },
});

export const statPill = style({
  borderRadius: '16px',
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: `${vars.spacing.md} ${vars.spacing.lg}`,
});

export const statPillLabel = style({
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.28em',
  color: vars.color.textMuted,
});

export const statPillValue = style({
  marginTop: vars.spacing.xs,
  fontSize: vars.fontSize.md,
  fontWeight: 500,
  color: vars.color.text,
});

export const contextFooter = style({
  fontSize: vars.fontSize.xs,
  lineHeight: 1.75,
  color: vars.color.textMuted,
});

// RecentDraftBar
export const recentDraftBar = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: vars.spacing.md,
  paddingTop: vars.spacing['2xs'],
});

export const recentDraftLabel = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
  flexShrink: 0,
});

export const recentDraftChips = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.spacing.sm,
});

export const recentDraftChip = style({
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
  padding: `${vars.spacing.xs} ${vars.spacing['md-lg']}`,
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  maxWidth: '180px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  transition: 'border-color 150ms, color 150ms',
  ':hover': {
    borderColor: vars.color.borderStrong,
    color: vars.color.text,
  },
});

// --- Immersive Writing Mode ---

export const immersiveOverlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: 9999,
  background: vars.color.canvasDeep,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const immersiveToolbar = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: `${vars.spacing.lg} ${vars.spacing['3xl']}`,
  borderBottom: `1px solid ${vars.color.borderFaint}`,
  flexShrink: 0,
});

export const immersiveToolbarLabel = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
});

export const immersiveToolbarBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: `${vars.spacing.sm} ${vars.spacing.lg}`,
  fontSize: vars.fontSize.sm,
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'color 150ms, border-color 150ms',
  ':hover': {
    color: vars.color.text,
    borderColor: vars.color.borderStrong,
  },
});

export const immersiveBody = style({
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  justifyContent: 'center',
  padding: `${vars.spacing['5xl']} ${vars.spacing['3xl']}`,
});

export const immersiveInner = style({
  width: '100%',
  maxWidth: '720px',
});

export const immersiveTitleInput = style({
  fontFamily: vars.font.serif,
  width: '100%',
  border: 0,
  background: 'transparent',
  fontSize: '32px',
  lineHeight: 1.3,
  color: vars.color.text,
  outline: 'none',
  marginBottom: vars.spacing['3xl'],
  '::placeholder': {
    color: vars.color.textMuted,
  },
});

export const immersiveEditorWrap = style({
  background: 'transparent',
  position: 'relative',
  outline: 'none',
  fontSize: vars.fontSize.xl,
});

globalStyle(`${immersiveEditorWrap} .w-md-editor`, {
  border: 'none',
  borderRadius: 0,
  boxShadow: 'none !important',
  background: 'transparent',
  color: vars.color.text,
});

globalStyle(`${immersiveEditorWrap} .w-md-editor-toolbar`, {
  borderTop: 'none',
  borderBottom: `1px solid ${vars.color.borderFaint}`,
  background: 'transparent',
  padding: '6px 0',
});

globalStyle(`${immersiveEditorWrap} .w-md-editor-text-input`, {
  fontFamily: vars.font.sans,
  fontSize: vars.fontSize.xl,
  lineHeight: 1.8,
  background: 'transparent',
  color: vars.color.text,
  outline: 'none',
});

globalStyle(`${immersiveEditorWrap} .wmde-markdown`, {
  background: 'transparent',
  color: vars.color.text,
  fontSize: vars.fontSize.xl,
  lineHeight: 1.8,
});

globalStyle(`${immersiveEditorWrap} .w-md-editor-area`, {
  background: 'transparent',
});

export const immersiveFooter = style({
  display: 'flex',
  justifyContent: 'center',
  padding: `${vars.spacing.lg} ${vars.spacing['3xl']}`,
  borderTop: `1px solid ${vars.color.borderFaint}`,
  flexShrink: 0,
});

export const immersiveFooterText = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
});

export const immersiveEntryBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.xs,
  borderRadius: vars.radius.lg,
  border: 'none',
  background: 'transparent',
  padding: `${vars.spacing.xs} ${vars.spacing.md}`,
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'color 150ms',
  ':hover': {
    color: vars.color.text,
  },
  '@media': {
    'screen and (max-width: 1023px)': {
      background: vars.color.accentSoft,
      color: vars.color.accent,
      padding: `${vars.spacing.sm} ${vars.spacing.lg}`,
      fontSize: vars.fontSize.sm,
      fontWeight: 500,
    },
  },
});

// --- Editor Mode Toggle ---

export const modeToggle = style({
  display: 'inline-flex',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  overflow: 'hidden',
});

export const modeToggleBtn = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    border: 'none',
    background: 'transparent',
    padding: `${vars.spacing.xs} ${vars.spacing['md-lg']}`,
    fontSize: vars.fontSize.xs,
    color: vars.color.textMuted,
    cursor: 'pointer',
    transition: 'all 150ms',
    ':hover': {
      color: vars.color.text,
    },
  },
  variants: {
    active: {
      true: {
        background: vars.color.bgElevated,
        color: vars.color.text,
        fontWeight: 500,
      },
    },
  },
});
