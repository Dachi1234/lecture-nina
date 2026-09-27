import { Suspense } from "react";
import { BookProvider } from "@/components/landing/booking";
import { CabinetPreview } from "@/components/landing/cabinet";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { Gift } from "@/components/landing/gift";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Materials } from "@/components/landing/materials";
import { MeetNina } from "@/components/landing/meet";
import { Method } from "@/components/landing/method";
import { Path } from "@/components/landing/path";
import { Pricing } from "@/components/landing/pricing";
import { Stories } from "@/components/landing/stories";
import { WhyNina } from "@/components/landing/why";
import { assertLandingReady, landing } from "@/content/landing.ka";
import { getPublicSettings } from "@/lib/settings";

export default async function HomePage() {
  assertLandingReady();
  const settings = await getPublicSettings();
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: landing.faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <div className="pointer-events-none fixed inset-0 z-20 opacity-20 mix-blend-multiply" aria-hidden>
        <svg className="h-full w-full">
          <filter id="paper-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#paper-grain)" />
        </svg>
      </div>
      <Suspense>
        <BookProvider>
          <Header />
          <main>
            <Hero />
            <MeetNina />
            <WhyNina />
            <Stories />
            <Method />
            <Materials />
            <CabinetPreview />
            <Path />
            <Gift giftLessons={settings.gift_lessons} />
            <Pricing settings={settings} />
            <Faq minutes={settings.lesson_minutes} />
            <FinalCta />
          </main>
          <Footer settings={settings} />
        </BookProvider>
      </Suspense>
    </>
  );
}
