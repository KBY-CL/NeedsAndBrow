import Link from 'next/link';
import { ArrowRight, Sparkles, CalendarDays, Star } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-cream relative overflow-hidden px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-screen-lg text-center">
          <p className="font-body text-gold-dark mb-3 text-sm tracking-widest uppercase">
            Premium Beauty Care
          </p>
          <h1 className="font-display text-charcoal text-3xl leading-tight md:text-4xl">
            당신의 아름다움을
            <br />
            완성하는 곳
          </h1>
          <p className="font-ui text-charcoal-light mx-auto mt-4 max-w-md text-base leading-relaxed">
            섬세한 손길로 완성하는 속눈썹 연장과 반영구 시술.
            <br className="hidden md:block" />
            자연스러운 아름다움을 경험하세요.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/reservation"
              className="font-ui bg-charcoal inline-flex h-12 items-center gap-2 rounded-lg px-8 text-sm font-medium tracking-wide text-white transition-colors hover:bg-black"
            >
              <CalendarDays size={16} strokeWidth={1.5} />
              예약하기
            </Link>
            <Link
              href="/gallery"
              className="font-ui border-charcoal text-charcoal hover:bg-charcoal inline-flex h-12 items-center gap-2 rounded-lg border px-8 text-sm font-medium tracking-wide transition-colors hover:text-white"
            >
              Before & After
              <ArrowRight size={16} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white px-5 py-16 md:px-8">
        <div className="mx-auto max-w-screen-lg">
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Sparkles size={24} strokeWidth={1.5} className="text-gold" />}
              title="프리미엄 시술"
              description="최고급 자재와 숙련된 기술로 자연스러운 눈매를 완성합니다."
            />
            <FeatureCard
              icon={<CalendarDays size={24} strokeWidth={1.5} className="text-gold" />}
              title="간편한 예약"
              description="원하는 날짜와 시간을 선택하여 간편하게 예약하세요."
            />
            <FeatureCard
              icon={<Star size={24} strokeWidth={1.5} className="text-gold" />}
              title="실제 후기"
              description="시술을 받으신 고객님들의 솔직한 후기를 확인하세요."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-cream px-5 py-16 md:px-8">
        <div className="mx-auto max-w-screen-lg text-center">
          <h2 className="font-display text-charcoal text-2xl">지금 바로 시작하세요</h2>
          <p className="font-ui text-charcoal-light mt-3 text-sm">
            첫 방문 고객님께 특별 할인 혜택을 드립니다.
          </p>
          <Link
            href="/events"
            className="font-ui bg-gold hover:bg-gold-dark mt-6 inline-flex h-12 items-center gap-2 rounded-lg px-8 text-sm font-medium tracking-wide text-white transition-colors"
          >
            이벤트 확인하기
            <ArrowRight size={16} strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="border-gray-light shadow-soft rounded-xl border bg-white p-6 text-center">
      <div className="bg-cream mx-auto flex h-12 w-12 items-center justify-center rounded-full">
        {icon}
      </div>
      <h3 className="font-ui text-charcoal mt-4 text-base font-semibold">{title}</h3>
      <p className="font-ui text-gray mt-2 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
