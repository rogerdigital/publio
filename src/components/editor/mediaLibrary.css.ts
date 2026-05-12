import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const trigger = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: '6px 10px',
  fontSize: '14px',
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'background-color 150ms, color 150ms, border-color 150ms',
  ':hover': {
    background: vars.color.canvasDeep,
    color: vars.color.text,
    borderColor: vars.color.borderStrong,
  },
});

export const overlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  background: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
});

export const modal = style({
  width: '100%',
  maxWidth: 640,
  maxHeight: '80vh',
  borderRadius: vars.radius.xl,
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
});

export const modalHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  borderBottom: `1px solid ${vars.color.border}`,
});

export const modalTitle = style({
  margin: 0,
  fontSize: '16px',
  fontWeight: 600,
  color: vars.color.text,
});

export const modalHeaderActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const closeBtn = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  borderRadius: vars.radius.lg,
  border: 'none',
  background: 'transparent',
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'background-color 150ms, color 150ms',
  ':hover': {
    background: vars.color.bgElevated,
    color: vars.color.text,
  },
});

export const uploadBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  borderRadius: vars.radius.lg,
  border: 'none',
  background: vars.color.accent,
  color: vars.color.surfaceDarkText,
  padding: '6px 12px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'opacity 150ms',
  ':hover': {
    opacity: 0.9,
  },
});

export const modalBody = style({
  flex: 1,
  overflowY: 'auto',
  padding: '16px',
});

export const emptyState = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
  padding: '40px 16px',
  color: vars.color.textMuted,
});

export const emptyText = style({
  fontSize: '14px',
  color: vars.color.textMuted,
  textAlign: 'center',
});

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap: '12px',
});

export const gridItem = style({
  position: 'relative',
  aspectRatio: '1',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  overflow: 'hidden',
  cursor: 'pointer',
  background: vars.color.bgElevated,
  padding: 0,
  transition: 'border-color 150ms, transform 150ms',
  ':hover': {
    borderColor: vars.color.accent,
    transform: 'scale(1.02)',
  },
});

export const gridImage = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export const gridMeta = style({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '4px 8px',
  background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
  fontSize: '11px',
  color: '#fff',
  textAlign: 'right',
});
