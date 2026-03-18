const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

type NotificationType = 'new_reservation' | 'cancel_reservation' | 'new_inquiry';

interface NotificationData {
  [key: string]: unknown;
}

function formatMessage(type: NotificationType, data: NotificationData): string {
  switch (type) {
    case 'new_reservation':
      return [
        '📅 <b>새 예약 문의</b>',
        `날짜: ${data.date}`,
        `시간: ${data.time_slot}`,
        `서비스: ${data.service_name ?? '-'}`,
        `고객: ${data.user_name ?? '-'}`,
        data.user_note ? `메모: ${data.user_note}` : '',
      ]
        .filter(Boolean)
        .join('\n');

    case 'cancel_reservation':
      return [
        '❌ <b>예약 취소</b>',
        `날짜: ${data.date}`,
        `시간: ${data.time_slot}`,
        `고객: ${data.user_name ?? '-'}`,
      ].join('\n');

    case 'new_inquiry':
      return [
        '💬 <b>새 상담 문의</b>',
        `제목: ${data.title}`,
        `작성자: ${data.user_name ?? '비회원'}`,
      ].join('\n');

    default:
      return `알림: ${JSON.stringify(data)}`;
  }
}

export async function sendTelegramNotification(
  type: NotificationType,
  data: NotificationData,
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('[Telegram] Bot token or chat ID not configured, skipping notification');
    return false;
  }

  const message = formatMessage(type, data);

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!res.ok) {
      console.error('[Telegram] Failed to send:', await res.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Telegram] Error:', error);
    return false;
  }
}
