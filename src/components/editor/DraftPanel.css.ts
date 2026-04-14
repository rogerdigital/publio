import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/tokens.css';

export const panel = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight: '480px',
  background: vars.color.canvasDeep,
  borderRadius: vars.radius.xl,
  overflow: 'hidden',
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 14px 10px',
  borderBottom: `1px solid ${vars.color.border}`,
  flexShrink: 0,
});

export const headerTitle = style({
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.22em',
  color: vars.color.textMuted,
});

export const headerActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
});

export const newBtn = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '22px',
  height: '22px',
  borderRadius: '6px',
  border: 'none',
  background: 'transparent',
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'background-color 150ms, color 150ms',
  ':hover': {
    background: vars.color.borderStrong,
    color: vars.color.text,
  },
});

// 分发记录快捷入口（header 右侧图标按钮）
export const historyLink = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '22px',
  height: '22px',
  borderRadius: '6px',
  color: vars.color.textMuted,
  textDecoration: 'none',
  transition: 'background-color 150ms, color 150ms',
  ':hover': {
    background: vars.color.borderStrong,
    color: vars.color.accent,
  },
});

export const list = style({
  flex: 1,
  overflowY: 'auto',
  padding: '6px',
  overscrollBehavior: 'contain',
});

export const item = recipe({
  base: {
    display: 'block',
    borderRadius: vars.radius.lg,
    padding: '7px 10px',
    textDecoration: 'none',
    transition: 'background-color 150ms',
    marginBottom: '1px',
  },
  variants: {
    active: {
      true: {
        background: vars.color.surface,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      },
      false: {
        ':hover': {
          background: 'rgba(0,0,0,0.04)',
        },
      },
    },
  },
  defaultVariants: { active: false },
});

export const itemTitle = style({
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  color: vars.color.text,
  lineHeight: 1.4,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const itemMeta = style({
  display: 'block',
  marginTop: '2px',
  fontSize: '11px',
  color: vars.color.textMuted,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const center = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '24px',
  color: vars.color.textMuted,
});

export const empty = style({
  margin: 0,
  padding: '20px 10px',
  fontSize: '13px',
  color: vars.color.textMuted,
  textAlign: 'center',
});

export const footerLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '12px',
  color: vars.color.textMuted,
  textDecoration: 'none',
  transition: 'color 150ms',
  ':hover': {
    color: vars.color.accent,
  },
});
