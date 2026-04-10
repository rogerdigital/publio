import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

// MarkdownEditor outer wrapper
export const editorRoot = style({
  overflow: 'hidden',
  background: vars.color.surface,
});

// Title input area
export const titleRow = style({
  borderBottom: `1px solid ${vars.color.borderFaint}`,
  padding: '16px',
  transition: 'border-color 150ms',
  ':focus-within': {
    borderColor: vars.color.accent,
  },
  '@media': {
    'screen and (min-width: 640px)': {
      padding: '16px 20px',
    },
  },
});

export const titleInput = style({
  fontFamily: vars.font.serif,
  width: '100%',
  border: 0,
  background: 'transparent',
  fontSize: '24px',
  lineHeight: 1.3,
  color: vars.color.text,
  outline: 'none',
  '::placeholder': {
    color: vars.color.textMuted,
  },
  '@media': {
    'screen and (min-width: 640px)': {
      fontSize: '28px',
    },
  },
});

// MDEditor wrapper — globalStyle overrides for third-party component
export const editorWrap = style({
  background: vars.color.surface,
});

globalStyle(`${editorWrap} .w-md-editor`, {
  border: 'none',
  borderRadius: 0,
  boxShadow: 'none',
  background: 'transparent',
  color: vars.color.text,
});

globalStyle(`${editorWrap} .w-md-editor-toolbar`, {
  borderTop: 'none',
  borderBottom: `1px solid ${vars.color.borderFaint}`,
  background: vars.color.surface,
  padding: '6px 12px',
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
});

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
  padding: '16px',
  fontSize: '15px',
  lineHeight: 1.75,
  color: vars.color.text,
  outline: 'none',
  '::placeholder': {
    color: vars.color.textMuted,
  },
  '@media': {
    'screen and (min-width: 640px)': {
      minHeight: '22rem',
      padding: '20px',
    },
  },
});

// Stats bar
export const statsBar = style({
  padding: '8px 16px 12px',
  '@media': {
    'screen and (min-width: 640px)': {
      padding: '8px 20px 12px',
    },
  },
});

export const statsRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  columnGap: '8px',
  rowGap: '4px',
  fontSize: '11px',
  color: vars.color.textMuted,
});

export const statsDot = style({
  color: vars.color.borderStrong,
});

// Preview area
export const previewWrap = style({
  padding: '24px',
  '@media': {
    'screen and (min-width: 640px)': {
      padding: '32px',
    },
    'screen and (min-width: 1024px)': {
      minHeight: '760px',
    },
  },
});

export const previewKicker = style({
  fontSize: '11px',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.30em',
  color: vars.color.accent,
});

export const previewTitle = style({
  fontFamily: vars.font.serif,
  marginTop: '8px',
  fontSize: '28px',
  lineHeight: 1.3,
  color: vars.color.text,
});

export const previewTitleBlock = style({
  marginBottom: '20px',
});

// Markdown preview content (dangerouslySetInnerHTML target)
export const previewContent = style({
  color: vars.color.text,
});

globalStyle(`${previewContent} p`, {
  margin: '16px 0',
  fontSize: '16px',
  lineHeight: 2,
  color: vars.color.text,
});

globalStyle(`${previewContent} h1`, {
  marginBottom: '12px',
  fontSize: '30px',
  lineHeight: 1.3,
  fontWeight: 600,
  color: vars.color.text,
});

globalStyle(`${previewContent} h2`, {
  marginTop: '40px',
  marginBottom: '16px',
  fontSize: '22px',
  lineHeight: 1.3,
  fontWeight: 600,
  color: vars.color.text,
});

globalStyle(`${previewContent} h3`, {
  marginTop: '32px',
  marginBottom: '12px',
  paddingLeft: '12px',
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
  background: 'rgba(250, 244, 237, 0.9)',
  padding: '16px 20px',
  color: vars.color.textMuted,
});

globalStyle(`${previewContent} code`, {
  borderRadius: '8px',
  background: 'rgba(238, 223, 208, 0.55)',
  padding: '2px 6px',
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
  paddingLeft: '24px',
});

globalStyle(`${previewContent} ol`, {
  margin: '16px 0',
  paddingLeft: '24px',
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
  padding: '12px 16px',
  '@media': {
    'screen and (min-width: 640px)': {
      padding: '12px 20px',
    },
  },
});

export const contextInner = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const contextHeader = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
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
  fontSize: '11px',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.32em',
  color: vars.color.accent,
});

export const contextDesc = style({
  marginTop: '8px',
  fontSize: '14px',
  lineHeight: 1.75,
  color: vars.color.textMuted,
});

export const contextBadges = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
});

export const contextBadgeNeutral = style({
  borderRadius: '999px',
  border: `1px solid ${vars.color.border}`,
  background: 'rgba(255, 255, 255, 0.80)',
  padding: '4px 12px',
  fontSize: '12px',
  color: vars.color.textMuted,
});

export const contextBadgeAccent = style({
  borderRadius: '999px',
  border: `1px solid ${vars.color.border}`,
  background: 'rgba(255, 246, 237, 0.92)',
  padding: '4px 12px',
  fontSize: '12px',
  color: vars.color.accent,
});

export const titleBlock = style({
  borderRadius: '18px',
  border: `1px solid ${vars.color.border}`,
  background: 'rgba(255, 252, 247, 0.86)',
  padding: '12px 16px',
});

export const titleBlockLabel = style({
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.28em',
  color: vars.color.textMuted,
});

export const titleBlockValue = style({
  fontFamily: vars.font.serif,
  marginTop: '8px',
  fontSize: '16px',
  lineHeight: 1.4,
  color: vars.color.text,
});

export const titleBlockEmpty = style({
  borderRadius: '18px',
  border: `1px dashed ${vars.color.borderStrong}`,
  background: 'rgba(255, 252, 247, 0.68)',
  padding: '12px 16px',
  fontSize: '14px',
  lineHeight: 1.75,
  color: vars.color.textMuted,
});

export const statsGrid = style({
  display: 'grid',
  gap: '8px',
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
  background: 'rgba(255, 252, 247, 0.82)',
  padding: '8px 12px',
});

export const statPillLabel = style({
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '0.28em',
  color: vars.color.textMuted,
});

export const statPillValue = style({
  marginTop: '4px',
  fontSize: '14px',
  fontWeight: 500,
  color: vars.color.text,
});

export const contextFooter = style({
  fontSize: '12px',
  lineHeight: 1.75,
  color: vars.color.textMuted,
});
