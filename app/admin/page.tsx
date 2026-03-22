import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  HelpCircle,
  Users,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { getDashboardData } from '@/lib/actions/admin-dashboard';
import { DashboardActions } from './DashboardActions';

export default async function AdminDashboard() {
  const data = await getDashboardData();

  if (!data) {
    return <p className="font-ui text-gray py-12 text-center">접근 권한이 없습니다.</p>;
  }

  const {
    stats,
    todayReservations,
    pendingReservations,
    unansweredInquiries,
    recentMembers,
    recentReviews,
  } = data;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-charcoal text-2xl">대시보드</h1>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Link
          href="/admin/reservations"
          className="border-gray-light shadow-soft hover:border-gold/50 rounded-xl border bg-white p-4 transition-colors"
        >
          <CalendarDays size={20} strokeWidth={1.5} className="text-gold mb-2" />
          <p className="font-ui text-charcoal text-2xl font-bold">{stats.todayTotal}</p>
          <p className="font-ui text-gray text-xs">오늘 예약</p>
          {stats.todayPending > 0 && (
            <p className="font-ui text-warning mt-1 text-xs font-medium">
              확인중 {stats.todayPending}건
            </p>
          )}
        </Link>

        <Link
          href="/admin/inquiries"
          className="border-gray-light shadow-soft hover:border-gold/50 rounded-xl border bg-white p-4 transition-colors"
        >
          <HelpCircle size={20} strokeWidth={1.5} className="text-gold mb-2" />
          <p className="font-ui text-charcoal text-2xl font-bold">{stats.unansweredInquiries}</p>
          <p className="font-ui text-gray text-xs">미답변 문의</p>
        </Link>

        <Link
          href="/admin/members"
          className="border-gray-light shadow-soft hover:border-gold/50 rounded-xl border bg-white p-4 transition-colors"
        >
          <Users size={20} strokeWidth={1.5} className="text-gold mb-2" />
          <p className="font-ui text-charcoal text-2xl font-bold">{stats.newMembers}</p>
          <p className="font-ui text-gray text-xs">신규 회원 (7일)</p>
        </Link>
      </div>

      {/* 오늘 예약 */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-ui text-charcoal text-lg font-semibold">오늘 예약</h2>
          <Link
            href="/admin/reservations"
            className="font-ui text-gold-dark flex items-center gap-1 text-xs hover:underline"
          >
            전체 보기 <ArrowRight size={12} />
          </Link>
        </div>

        {todayReservations.length === 0 ? (
          <div className="border-gray-light rounded-xl border bg-white py-8 text-center">
            <CalendarDays size={24} strokeWidth={1.5} className="text-gray mx-auto mb-2" />
            <p className="font-ui text-gray text-sm">오늘 예약이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayReservations.map((r) => {
              const service = r.service as {
                name: string;
                category: string;
                duration: number;
              } | null;
              const profile = r.profile as { name: string; phone: string | null } | null;
              return (
                <div
                  key={r.id}
                  className="border-gray-light shadow-soft rounded-xl border bg-white p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-ui text-charcoal flex items-center gap-1 text-sm font-semibold">
                          <Clock size={13} strokeWidth={1.5} className="text-gray" />
                          {r.time_slot}
                        </span>
                        <span className="font-ui text-charcoal-light text-sm">{service?.name}</span>
                        <StatusBadge status={r.status} />
                      </div>
                      <div className="font-ui text-gray mt-1 flex items-center gap-2 text-xs">
                        <span>{profile?.name ?? '-'}</span>
                        {profile?.phone && (
                          <>
                            <span>&middot;</span>
                            <span className="flex items-center gap-0.5">
                              <Phone size={10} strokeWidth={1.5} />
                              {profile.phone}
                            </span>
                          </>
                        )}
                      </div>
                      {r.user_note && (
                        <p className="font-ui text-gray mt-1 text-xs">메모: {r.user_note}</p>
                      )}
                    </div>
                    {r.status === 'pending' && <DashboardActions reservationId={r.id} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 처리 필요 — 확인 대기 예약 */}
      {pendingReservations.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-warning" />
            <h2 className="font-ui text-charcoal text-lg font-semibold">
              확인 대기 예약 ({pendingReservations.length})
            </h2>
          </div>
          <div className="space-y-2">
            {pendingReservations.slice(0, 5).map((r) => {
              const service = r.service as { name: string } | null;
              const profile = r.profile as { name: string; phone: string | null } | null;
              return (
                <Link
                  key={r.id}
                  href="/admin/reservations"
                  className="border-warning/30 bg-warning/5 hover:bg-warning/10 flex items-center justify-between rounded-xl border p-3 transition-colors"
                >
                  <div>
                    <p className="font-ui text-charcoal text-sm font-medium">
                      {r.date} {r.time_slot} — {service?.name}
                    </p>
                    <p className="font-ui text-gray text-xs">
                      {profile?.name ?? '-'}
                      {profile?.phone && ` · ${profile.phone}`}
                    </p>
                  </div>
                  <ArrowRight size={14} className="text-gray" />
                </Link>
              );
            })}
            {pendingReservations.length > 5 && (
              <Link
                href="/admin/reservations"
                className="font-ui text-gold-dark block text-center text-xs hover:underline"
              >
                +{pendingReservations.length - 5}건 더 보기
              </Link>
            )}
          </div>
        </section>
      )}

      {/* 처리 필요 — 미답변 문의 */}
      {unansweredInquiries.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <HelpCircle size={16} className="text-info" />
            <h2 className="font-ui text-charcoal text-lg font-semibold">
              미답변 문의 ({unansweredInquiries.length})
            </h2>
          </div>
          <div className="space-y-2">
            {unansweredInquiries.slice(0, 5).map((inq) => {
              const profile = inq.profile as { name: string } | null;
              return (
                <Link
                  key={inq.id}
                  href="/admin/inquiries"
                  className="border-info/30 bg-info/5 hover:bg-info/10 flex items-center justify-between rounded-xl border p-3 transition-colors"
                >
                  <div>
                    <p className="font-ui text-charcoal text-sm font-medium">{inq.title}</p>
                    <p className="font-ui text-gray text-xs">
                      {profile?.name ?? '비회원'}
                      {inq.contact_phone && ` · ${inq.contact_phone}`}
                      {' · '}
                      {new Date(inq.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <ArrowRight size={14} className="text-gray" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 최근 활동 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 최근 회원 */}
        {recentMembers.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-ui text-charcoal text-sm font-semibold">최근 가입</h2>
              <Link
                href="/admin/members"
                className="font-ui text-gold-dark text-xs hover:underline"
              >
                전체
              </Link>
            </div>
            <div className="border-gray-light rounded-xl border bg-white">
              {recentMembers.map((m, i) => (
                <div
                  key={m.id}
                  className={`flex items-center justify-between px-4 py-2.5 ${
                    i < recentMembers.length - 1 ? 'border-gray-light border-b' : ''
                  }`}
                >
                  <span className="font-ui text-charcoal text-sm">{m.name}</span>
                  <span className="font-ui text-gray text-xs">
                    {new Date(m.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 최근 후기 */}
        {recentReviews.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-ui text-charcoal text-sm font-semibold">최근 후기</h2>
              <Link
                href="/admin/reviews"
                className="font-ui text-gold-dark text-xs hover:underline"
              >
                전체
              </Link>
            </div>
            <div className="border-gray-light rounded-xl border bg-white">
              {recentReviews.map((rv, i) => {
                const profile = rv.profile as { name: string } | null;
                return (
                  <div
                    key={rv.id}
                    className={`flex items-center justify-between px-4 py-2.5 ${
                      i < recentReviews.length - 1 ? 'border-gray-light border-b' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare size={12} className="text-gray" />
                      <span className="font-ui text-charcoal text-sm">{rv.title}</span>
                    </div>
                    <span className="font-ui text-gray text-xs">{profile?.name ?? '-'}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: '확인중', className: 'bg-warning/20 text-warning' },
    confirmed: { label: '확정', className: 'bg-success/20 text-success' },
    rejected: { label: '거절', className: 'bg-error/20 text-error' },
    cancelled: { label: '취소', className: 'bg-gray-light text-gray' },
  };
  const c = config[status] ?? { label: status, className: 'bg-gray-light text-gray' };
  return (
    <span className={`font-ui rounded-full px-2 py-0.5 text-xs font-medium ${c.className}`}>
      {c.label}
    </span>
  );
}
