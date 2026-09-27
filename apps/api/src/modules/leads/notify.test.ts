import { describe, expect, it } from "vitest";
import { leadNotice } from "./notify.js";

describe("leadNotice", () => {
  it("writes a Georgian recap with contact links", () => {
    const notice = leadNotice({
      name: "მარიამი",
      phone: "995555123456",
      email: "mariam@example.com",
      channel: "WHATSAPP",
      goal: "TRAVEL",
      days: ["MON", "FRI"],
      timeOfDay: "EVENING",
      note: "ვალენსია",
      source: "hero",
    });

    expect(notice.subject).toBe("ახალი ჯავშანი — მარიამი");
    expect(notice.text).toContain("არხი: WhatsApp");
    expect(notice.text).toContain("მიზანი: მოგზაურობა");
    expect(notice.text).toContain("დღეები: ორშ, პარ");
    expect(notice.text).toContain("დრო: საღამო");
    expect(notice.text).toContain("https://wa.me/995555123456");
    expect(notice.text).toContain("წყარო: hero");
  });

  it("escapes a name that contains markup", () => {
    const notice = leadNotice({
      name: "<b>ნინა</b>",
      phone: "995555000000",
      email: null,
      channel: "PHONE",
      goal: null,
      days: [],
      timeOfDay: null,
      note: null,
      source: null,
    });

    expect(notice.html).toContain("&lt;b&gt;ნინა&lt;/b&gt;");
    expect(notice.html).not.toContain("<b>ნინა</b>");
  });
});
