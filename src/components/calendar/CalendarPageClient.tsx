'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AppShellHeader from '@/components/layout/AppShellHeader';
import * as styles from '@/app/calendar/page.css';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: 'scheduled' | 'draft' | 'published' | 'failed';
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

function getMonthDays(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: Date[] = [];

  // Pad start (Monday = 0)
  let startDay = first.getDay() - 1;
  if (startDay < 0) startDay = 6;
  for (let i = startDay - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }

  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  // Pad end
  while (days.length % 7 !== 0) {
    days.push(new Date(year, month + 1, days.length - startDay - last.getDate() + 1));
  }

  return days;
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const typeStyles: Record<string, string> = {
  scheduled: styles.eventScheduled,
  draft: styles.eventDraft,
  published: styles.eventPublished,
  failed: styles.eventFailed,
};

export default function CalendarPageClient() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const today = new Date();

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      try {
        const [draftsRes, syncRes] = await Promise.all([
          fetch('/api/drafts', { cache: 'no-store' }),
          fetch('/api/sync-tasks', { cache: 'no-store' }),
        ]);

        const evts: CalendarEvent[] = [];

        if (draftsRes.ok) {
          const draftsData = (await draftsRes.json()) as { drafts?: Array<{ id: string; title: string; scheduledAt?: string; status: string }> };
          for (const d of draftsData.drafts ?? []) {
            if (d.scheduledAt) {
              evts.push({
                id: d.id,
                title: d.title || '未命名稿件',
                date: d.scheduledAt.slice(0, 10),
                type: 'scheduled',
              });
            } else if (d.status === 'draft') {
              evts.push({
                id: d.id,
                title: d.title || '未命名稿件',
                date: d.id.match(/\d+/)?.[0]
                  ? new Date(Number(d.id.match(/\d+/)?.[0])).toISOString().slice(0, 10)
                  : formatDate(today),
                type: 'draft',
              });
            }
          }
        }

        if (syncRes.ok) {
          const syncData = (await syncRes.json()) as { syncTasks?: Array<{ id: string; title: string; createdAt: string; status: string }> };
          for (const t of syncData.syncTasks ?? []) {
            evts.push({
              id: t.id,
              title: t.title || '已发布',
              date: t.createdAt.slice(0, 10),
              type: t.status === 'failed' ? 'failed' : 'published',
            });
          }
        }

        setEvents(evts);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    void loadEvents();
  }, []);

  const days = useMemo(
    () => getMonthDays(currentDate.getFullYear(), currentDate.getMonth()),
    [currentDate],
  );

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const evt of events) {
      if (!map[evt.date]) map[evt.date] = [];
      map[evt.date].push(evt);
    }
    return map;
  }, [events]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  return (
    <div className={styles.pageWrap}>
      <AppShellHeader
        kicker="Editorial"
        title="内容排期"
        description="查看稿件排期和发布记录。"
      />

      <div className={styles.navRow}>
        <button type="button" onClick={prevMonth} className={styles.navBtn} aria-label="上个月">
          <ChevronLeft size={16} />
        </button>
        <span className={styles.monthLabel}>
          {currentDate.getFullYear()} 年 {currentDate.getMonth() + 1} 月
        </span>
        <button type="button" onClick={nextMonth} className={styles.navBtn} aria-label="下个月">
          <ChevronRight size={16} />
        </button>
        <button type="button" onClick={goToday} className={styles.todayBtn}>
          今天
        </button>
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: 'rgba(217,119,87,0.4)' }} />
          定时发布
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#bbb' }} />
          草稿
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#4caf50' }} />
          已发布
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#f44336' }} />
          失败
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>加载中...</div>
      ) : (
        <div className={styles.calendarGrid}>
          {WEEKDAYS.map((d) => (
            <div key={d} className={styles.dayHeader}>{d}</div>
          ))}
          {days.map((day) => {
            const dateKey = formatDate(day);
            const isToday = isSameDay(day, today);
            const isOutside = day.getMonth() !== currentDate.getMonth();
            const dayEvents = eventsByDate[dateKey] ?? [];

            return (
              <div
                key={dateKey}
                className={`${styles.dayCell} ${isToday ? styles.dayCellToday : ''} ${isOutside ? styles.dayCellOutside : ''}`}
              >
                <div className={`${styles.dayNumber} ${isToday ? styles.dayNumberToday : ''}`}>
                  {day.getDate()}
                </div>
                {dayEvents.slice(0, 3).map((evt) => (
                  <button
                    key={evt.id}
                    type="button"
                    className={`${styles.eventChip} ${typeStyles[evt.type]}`}
                    onClick={() => {
                      if (evt.type === 'draft' || evt.type === 'scheduled') {
                        router.push(`/?draftId=${evt.id}`);
                      } else {
                        router.push(`/sync-tasks/${evt.id}`);
                      }
                    }}
                    title={evt.title}
                  >
                    {evt.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <span style={{ fontSize: '11px', color: '#999', padding: '0 4px' }}>
                    +{dayEvents.length - 3}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
