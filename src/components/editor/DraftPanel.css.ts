import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/tokens.css';

export const panel = style({
  display: 'flex',
  flexDirection: 'column',
  width: '216px',
  height: '100%',
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

// Edit mode action buttons in header
export const editActionBtn = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    borderRadius: '5px',
    border: '1px solid transparent',
    padding: '3px 7px',
    fontSize: '11px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'opacity 150ms',
    selectors: {
      '&:disabled': {
        opacity: 0.4,
        cursor: 'not-allowed',
      },
    },
  },
  variants: {
    variant: {
      cancel: {
        background: 'transparent',
        borderColor: vars.color.border,
        color: vars.color.textMuted,
        ':hover': {
          color: vars.color.text,
          borderColor: vars.color.borderStrong,
        },
      },
      delete: {
        background: vars.color.errorBg,
        borderColor: vars.color.errorBorder,
        color: vars.color.errorText,
      },
    },
  },
});

// Selectable item in edit mode
export const itemSelectable = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: vars.radius.lg,
    padding: '7px 10px',
    cursor: 'pointer',
    marginBottom: '1px',
    transition: 'background-color 150ms',
  },
  variants: {
    selected: {
      true: {
        background: vars.color.accentSoft,
      },
      false: {
        ':hover': {
          background: 'rgba(0,0,0,0.04)',
        },
      },
    },
  },
  defaultVariants: { selected: false },
});

export const itemCheckbox = style({
  flexShrink: 0,
  width: '14px',
  height: '14px',
  borderRadius: '3px',
  accentColor: vars.color.accent,
  cursor: 'pointer',
});

export const itemBody = style({
  minWidth: 0,
  flex: 1,
});
