import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We test the telegram module by mocking fetch and env vars
describe('sendTelegramNotification', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      TELEGRAM_BOT_TOKEN: 'test-token',
      TELEGRAM_ADMIN_CHAT_ID: 'test-chat-id',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('설정이 없으면 false를 반환한다', async () => {
    process.env.TELEGRAM_BOT_TOKEN = '';
    process.env.TELEGRAM_ADMIN_CHAT_ID = '';

    const { sendTelegramNotification } = await import('@/lib/services/telegram');
    const result = await sendTelegramNotification('new_reservation', { date: '2026-03-20' });
    expect(result).toBe(false);
  });

  it('API 호출 성공 시 true를 반환한다', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);

    const { sendTelegramNotification } = await import('@/lib/services/telegram');
    const result = await sendTelegramNotification('new_reservation', {
      date: '2026-03-20',
      time_slot: '14:00',
      service_name: '내추럴 연장',
      user_name: '홍길동',
    });

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const call = mockFetch.mock.calls[0]!;
    const [url, options] = call as [string, { body: string }];
    expect(url).toContain('test-token');
    expect(JSON.parse(options.body).chat_id).toBe('test-chat-id');
    expect(JSON.parse(options.body).text).toContain('새 예약 문의');
  });

  it('API 호출 실패 시 false를 반환한다', async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue({ ok: false, text: () => Promise.resolve('error') });
    vi.stubGlobal('fetch', mockFetch);

    const { sendTelegramNotification } = await import('@/lib/services/telegram');
    const result = await sendTelegramNotification('new_inquiry', { title: '문의합니다' });
    expect(result).toBe(false);
  });

  it('네트워크 에러 시 false를 반환한다', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', mockFetch);

    const { sendTelegramNotification } = await import('@/lib/services/telegram');
    const result = await sendTelegramNotification('cancel_reservation', { date: '2026-03-20' });
    expect(result).toBe(false);
  });

  it('new_inquiry 메시지를 올바르게 포맷한다', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);

    const { sendTelegramNotification } = await import('@/lib/services/telegram');
    await sendTelegramNotification('new_inquiry', {
      title: '시술 문의',
      user_name: '김철수',
    });

    const call1 = mockFetch.mock.calls[0]! as [string, { body: string }];
    const body1 = JSON.parse(call1[1].body);
    expect(body1.text).toContain('상담 문의');
    expect(body1.text).toContain('시술 문의');
    expect(body1.text).toContain('김철수');
  });

  it('cancel_reservation 메시지를 올바르게 포맷한다', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);

    const { sendTelegramNotification } = await import('@/lib/services/telegram');
    await sendTelegramNotification('cancel_reservation', {
      date: '2026-03-20',
      time_slot: '10:00',
      user_name: '이영희',
    });

    const call2 = mockFetch.mock.calls[0]! as [string, { body: string }];
    const body2 = JSON.parse(call2[1].body);
    expect(body2.text).toContain('예약 취소');
    expect(body2.text).toContain('이영희');
  });
});
