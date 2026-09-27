const shortMonths = ["იან.", "თებ.", "მარ.", "აპრ.", "მაი.", "ივნ.", "ივლ.", "აგვ.", "სექ.", "ოქტ.", "ნოე.", "დეკ."];
const fullMonths = [
  "იანვარი",
  "თებერვალი",
  "მარტი",
  "აპრილი",
  "მაისი",
  "ივნისი",
  "ივლისი",
  "აგვისტო",
  "სექტემბერი",
  "ოქტომბერი",
  "ნოემბერი",
  "დეკემბერი",
];
const weekdays = ["კვირა", "ორშაბათი", "სამშაბათი", "ოთხშაბათი", "ხუთშაბათი", "პარასკევი", "შაბათი"];

function tbilisi(iso: string) {
  const shifted = new Date(new Date(iso).getTime() + 4 * 60 * 60 * 1000);
  return {
    day: shifted.getUTCDate(),
    month: shifted.getUTCMonth(),
    weekday: shifted.getUTCDay(),
    hour: String(shifted.getUTCHours()).padStart(2, "0"),
    minute: String(shifted.getUTCMinutes()).padStart(2, "0"),
  };
}

export function shortDate(iso: string) {
  const parts = tbilisi(iso);
  return `${parts.day} ${shortMonths[parts.month]}`;
}

export function lessonOverline(number: number, iso: string) {
  const parts = tbilisi(iso);
  return `LECCIÓN ${number} · ${parts.day} ${fullMonths[parts.month]}`;
}

export function lessonWhen(iso: string) {
  const parts = tbilisi(iso);
  return `${weekdays[parts.weekday]}, ${parts.day} ${shortMonths[parts.month]} · ${parts.hour}:${parts.minute}`;
}
