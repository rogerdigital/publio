import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@/styles/tokens.css';

export const sectionGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const sectionHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '14px',
  fontWeight: 600,
  color: vars.color.text,
});

export const sectionHint = style({
  fontSize: '13px',
  color: vars.color.textMuted,
  lineHeight: 1.5,
  margin: 0,
});

export const sourceForm = style({
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
});

export const sourceInput = style({
  flex: 1,
  minWidth: '140px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '8px 12px',
  fontSize: '13px',
  color: vars.color.text,
  outline: 'none',
  transition: 'border-color 150ms',
  ':focus': {
    borderColor: vars.color.accent,
  },
});

export const sourceAddBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.accent}`,
  background: vars.color.accent,
  padding: '8px 14px',
  fontSize: '13px',
  fontWeight: 500,
  color: '#ffffff',
  cursor: 'pointer',
  transition: 'filter 150ms',
  ':hover': { filter: 'brightness(1.1)' },
});

export const sourceError = style({
  fontSize: '13px',
  color: vars.color.errorText,
  margin: 0,
});

export const sourceList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
});

export const sourceItem = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '10px 12px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.bgElevated,
});

export const sourceInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  minWidth: 0,
  flex: 1,
});

export const sourceName = style({
  fontSize: '13px',
  fontWeight: 500,
  color: vars.color.text,
});

export const sourceUrl = style({
  fontSize: '11px',
  color: vars.color.textMuted,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const sourceActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  flexShrink: 0,
});

export const sourceToggle = style({
  background: 'none',
  border: 'none',
  padding: '2px',
  cursor: 'pointer',
  color: vars.color.textMuted,
  transition: 'color 150ms',
});

export const sourceToggleOn = style({
  color: vars.color.accent,
});

export const sourceDeleteBtn = style({
  background: 'none',
  border: 'none',
  padding: '4px',
  cursor: 'pointer',
  color: vars.color.textMuted,
  borderRadius: vars.radius.sm,
  transition: 'color 150ms',
  ':hover': { color: vars.color.errorText },
});

// --- Prompt Editor ---

export const promptTargetTabs = style({
  display: 'flex',
  gap: '4px',
  flexWrap: 'wrap',
});

export const promptTab = recipe({
  base: {
    borderRadius: vars.radius.lg,
    border: `1px solid ${vars.color.border}`,
    background: 'transparent',
    padding: '6px 12px',
    fontSize: '13px',
    color: vars.color.textMuted,
    cursor: 'pointer',
    transition: 'all 150ms',
  },
  variants: {
    active: {
      true: {
        borderColor: vars.color.accent,
        background: vars.color.accent,
        color: '#ffffff',
      },
    },
  },
});

export const promptTextarea = style({
  width: '100%',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '10px 12px',
  fontSize: '13px',
  color: vars.color.text,
  lineHeight: 1.6,
  resize: 'vertical',
  outline: 'none',
  transition: 'border-color 150ms',
  ':focus': {
    borderColor: vars.color.accent,
  },
});

export const promptActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});
