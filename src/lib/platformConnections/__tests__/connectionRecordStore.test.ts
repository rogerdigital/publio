import { describe, expect, test } from 'vitest';

import { createConnectionRecordStore } from '@/lib/platformConnections';

describe('createConnectionRecordStore', () => {
  test('returns null for unknown platform', () => {
    const store = createConnectionRecordStore();
    expect(store.getRecord('wechat')).toBeNull();
  });

  test('upsertRecord creates and retrieves a record', () => {
    const store = createConnectionRecordStore();
    const record = store.upsertRecord('wechat', {
      accountName: 'Test Account',
      connectedAt: '2024-01-01T00:00:00.000Z',
    });

    expect(record).toMatchObject({
      platform: 'wechat',
      accountName: 'Test Account',
      connectedAt: '2024-01-01T00:00:00.000Z',
    });
    expect(store.getRecord('wechat')).toEqual(record);
  });

  test('clearRecord removes the record', () => {
    const store = createConnectionRecordStore({
      initialRecords: [{ platform: 'x', accountName: '@test' }],
    });

    expect(store.getRecord('x')).not.toBeNull();
    store.clearRecord('x');
    expect(store.getRecord('x')).toBeNull();
  });

  test('markChecked updates lastCheckedAt and sets failureReason on failure', () => {
    const store = createConnectionRecordStore({
      initialRecords: [{ platform: 'zhihu', accountName: 'test' }],
    });

    const result = store.markChecked('zhihu', {
      platform: 'zhihu',
      ok: false,
      failureReason: '缺少必要凭证: ZHIHU_COOKIE',
      checkedAt: '2024-06-01T12:00:00.000Z',
    });

    expect(result.lastCheckedAt).toBe('2024-06-01T12:00:00.000Z');
    expect(result.failureReason).toBe('缺少必要凭证: ZHIHU_COOKIE');
  });

  test('markChecked clears failureReason on success', () => {
    const store = createConnectionRecordStore({
      initialRecords: [{ platform: 'zhihu', failureReason: '之前失败' }],
    });

    const result = store.markChecked('zhihu', {
      platform: 'zhihu',
      ok: true,
      checkedAt: '2024-06-01T12:00:00.000Z',
    });

    expect(result.failureReason).toBeUndefined();
  });

  test('listRecords returns all stored records', () => {
    const store = createConnectionRecordStore({
      initialRecords: [
        { platform: 'wechat', accountName: 'A' },
        { platform: 'x', accountName: 'B' },
      ],
    });

    const list = store.listRecords();
    expect(list).toHaveLength(2);
    expect(list.map((r) => r.platform)).toEqual(expect.arrayContaining(['wechat', 'x']));
  });
});
