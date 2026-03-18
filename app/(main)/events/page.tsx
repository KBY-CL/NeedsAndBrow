import type { Metadata } from 'next';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getActiveEvents } from '@/lib/actions/event';

export const metadata: Metadata = {
  title: '이벤트',
  description: '진행중인 이벤트와 프로모션 확인',
};

const statusConfig = {
  예정: { label: '예정', className: 'bg-info/20 text-info' },
  진행중: { label: '진행중', className: 'bg-success/20 text-success animate-pulse' },
  종료: { label: '종료', className: 'bg-gray-light text-gray' },
} as const;

const fallbackStatus = statusConfig['종료'];

function getStatusStyle(status: string) {
  return statusConfig[status as keyof typeof statusConfig] ?? fallbackStatus;
}

export default async function EventsPage() {
  const events = await getActiveEvents();

  return (
    <div className="mx-auto max-w-screen-lg px-5 py-8 md:px-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-charcoal text-2xl">이벤트</h1>
        <p className="font-ui text-gray mt-2 text-sm">특별한 혜택을 놓치지 마세요.</p>
      </div>

      {events.length === 0 ? (
        <p className="font-ui text-gray py-12 text-center text-sm">
          현재 진행중인 이벤트가 없습니다.
        </p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const status = getStatusStyle(event.status);
            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="border-gray-light shadow-soft hover:shadow-card block overflow-hidden rounded-xl border bg-white transition-all hover:-translate-y-0.5"
              >
                {event.image_url && (
                  <div className="bg-cream aspect-[3/1] overflow-hidden">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={cn(
                        'font-ui rounded-full px-2.5 py-0.5 text-xs font-medium',
                        status.className,
                      )}
                    >
                      {status.label}
                    </span>
                  </div>
                  <h2 className="font-ui text-charcoal text-base font-semibold">{event.title}</h2>
                  <p className="font-ui text-gray mt-1 text-sm">
                    {event.start_date} ~ {event.end_date}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
