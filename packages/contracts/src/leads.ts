import { z } from "zod";

export const weekDaySchema = z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]);
export const contactChannelSchema = z.enum(["PHONE", "WHATSAPP", "TELEGRAM", "EMAIL"]);
export const goalSchema = z.enum(["TRAVEL", "STUDY", "RELOCATION", "FUN", "OTHER"]);
export const timeOfDaySchema = z.enum(["MORNING", "DAY", "EVENING"]);

export const leadInputSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    phone: z.string().trim().min(1).max(32),
    email: z.string().trim().email().optional().or(z.literal("")),
    channel: contactChannelSchema,
    goal: goalSchema.optional(),
    days: z.array(weekDaySchema).default([]),
    timeOfDay: timeOfDaySchema.optional(),
    note: z.string().trim().max(2000).optional(),
    consent: z.literal(true),
    source: z.string().trim().max(80).optional(),
    utm: z.record(z.string(), z.string()).optional(),
    hp: z.string().optional(),
    t: z.number().int().nonnegative().optional(),
  })
  .superRefine((value, ctx) => {
    const digits = value.phone.replace(/\D/g, "");
    if (digits.length < 12 || !digits.includes("995")) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "ნომერი არასრულია" });
    }
    if (value.channel === "EMAIL" && !value.email) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "ელ-ფოსტა სავალდებულოა" });
    }
  });

export type LeadInput = z.infer<typeof leadInputSchema>;

export function phoneDigits(phone: string) {
  return phone.replace(/\D/g, "");
}
