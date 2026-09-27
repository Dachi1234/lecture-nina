export type PublicSettings = {
  price_gel: number;
  lesson_minutes: number;
  gift_lessons: number;
  contact_email: string | null;
  contact_phone: string | null;
  telegram: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
};

const fallback: PublicSettings = {
  price_gel: 30,
  lesson_minutes: 75,
  gift_lessons: 2,
  contact_email: null,
  contact_phone: null,
  telegram: null,
  instagram_url: null,
  facebook_url: null,
  tiktok_url: null,
};

export async function getPublicSettings(): Promise<PublicSettings> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/v1/public/settings`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return fallback;
    const data = (await response.json()) as Partial<PublicSettings>;
    return {
      price_gel: typeof data.price_gel === "number" ? data.price_gel : fallback.price_gel,
      lesson_minutes: typeof data.lesson_minutes === "number" ? data.lesson_minutes : fallback.lesson_minutes,
      gift_lessons: typeof data.gift_lessons === "number" ? data.gift_lessons : fallback.gift_lessons,
      contact_email: typeof data.contact_email === "string" ? data.contact_email : null,
      contact_phone: typeof data.contact_phone === "string" ? data.contact_phone : null,
      telegram: typeof data.telegram === "string" ? data.telegram : null,
      instagram_url: typeof data.instagram_url === "string" ? data.instagram_url : null,
      facebook_url: typeof data.facebook_url === "string" ? data.facebook_url : null,
      tiktok_url: typeof data.tiktok_url === "string" ? data.tiktok_url : null,
    };
  } catch {
    return fallback;
  }
}
