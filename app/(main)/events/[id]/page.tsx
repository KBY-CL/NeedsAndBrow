import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEventById } from '@/lib/actions/event';

const statusConfig = {
  예정: { label: '예정', className: 'bg-info/20 text-info' },
  진행중: { label: '진행중', className: 'bg-success/20 text-success' },
  종료: { label: '종료', className: 'bg-gray-light text-gray' },
} as const;

function getStatusStyle(status: string) {
  return statusConfig[status as keyof typeof statusConfig] ?? statusConfig['종료'];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return { title: '이벤트를 찾을 수 없습니다' };
  return { title: event.title };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const status = getStatusStyle(event.status);

  return (
    <div className="mx-auto max-w-lg px-5 py-8 md:px-8">
      <Link
        href="/events"
        className="font-ui text-gray mb-6 inline-flex items-center gap-1 text-sm hover:underline"
      >
        <ArrowLeft size={14} />
        목록으로
      </Link>

      {event.image_url && (
        <div className="bg-cream mb-6 overflow-hidden rounded-xl">
          <img src={event.image_url} alt={event.title} className="h-auto w-full object-cover" />
        </div>
      )}

      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn('font-ui rounded-full px-2.5 py-0.5 text-xs font-medium', status.className)}
        >
          {status.label}
        </span>
        <span className="font-ui text-gray text-sm">
          {event.start_date} ~ {event.end_date}
        </span>
      </div>

      <h1 className="font-display text-charcoal mb-6 text-2xl">{event.title}</h1>

      <div className="font-ui text-charcoal-light text-base leading-relaxed whitespace-pre-wrap">
        {event.content}
      </div>

      {event.status === '진행중' && (
        <Link
          href="/reservation"
          className="font-ui bg-gold hover:bg-gold-dark mt-8 inline-flex h-12 items-center gap-2 rounded-lg px-8 text-sm font-medium text-white transition-colors"
        >
          <CalendarDays size={16} strokeWidth={1.5} />
          지금 예약하기
        </Link>
      )}
    </div>
  );
}
