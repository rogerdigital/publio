'use client';

import * as styles from './error.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background: '#f5f5f4',
          color: '#1a1a1a',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '40px 16px',
          }}
        >
          <div
            style={{
              maxWidth: '40rem',
              borderRadius: '16px',
              border: '1px solid #e5e5e5',
              background: '#ffffff',
              padding: '32px',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.28em',
                color: '#1a1a1a',
                margin: 0,
              }}
            >
              Publio
            </p>
            <h1
              style={{
                marginTop: '16px',
                fontSize: '24px',
                fontWeight: 600,
                lineHeight: 1.3,
                margin: '16px 0 0',
              }}
            >
              应用遇到了严重错误
            </h1>
            <p
              style={{
                marginTop: '12px',
                fontSize: '14px',
                lineHeight: 1.75,
                color: '#737373',
                margin: '12px 0 0',
              }}
            >
              布局组件发生了异常，导致整个页面无法正常渲染。请点击下方按钮尝试恢复。
            </p>
            {error.message && (
              <div
                style={{
                  marginTop: '20px',
                  borderRadius: '12px',
                  border: '1px solid #fecaca',
                  background: '#fef2f2',
                  padding: '12px 16px',
                  fontSize: '13px',
                  lineHeight: 1.6,
                  color: '#991b1b',
                  wordBreak: 'break-word',
                  fontFamily: 'monospace',
                }}
              >
                {error.message}
              </div>
            )}
            <div style={{ marginTop: '24px' }}>
              <button
                type="button"
                onClick={reset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#1a1a1a',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                重新加载
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
