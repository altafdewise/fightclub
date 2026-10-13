export type VenueCategory =
  | "gym"
  | "crossfit"
  | "yoga"
  | "pilates"
  | "boxing_mma"
  | "dance"
  | "sports_centre";

export type Venue = {
  id: string;
  name: string;
  category: VenueCategory;
  brand?: string;
  area: string;
  address: string;
  phone: string;
  phones?: string[];
  website?: string;
  instagram?: string;
  hours?: string;
  lat?: number | null;
  lng?: number | null;
  rating?: number | null;
  ratingCount?: number | null;
  sources: string[];
};

export type VenueDataset = {
  city: string;
  generatedAt: string;
  sources: string[];
  venues: Venue[];
};

export const CATEGORY_LABELS: Record<VenueCategory, string> = {
  gym: "Gym",
  crossfit: "CrossFit",
  yoga: "Yoga",
  pilates: "Pilates",
  boxing_mma: "Boxing / MMA",
  dance: "Dance fitness",
  sports_centre: "Sports centre",
};

/** Digits-only Indian number for wa.me links, or null if it is not a mobile number. */
export function whatsappDigits(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  const national = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits.length === 10 ? digits : null;
  if (!national || !/^[6-9]\d{9}$/.test(national)) return null;
  return `91${national}`;
}

export function mapsUrl(v: Venue): string {
  if (typeof v.lat === "number" && typeof v.lng === "number") {
    return `https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lng}`;
  }
  const q = encodeURIComponent(`${v.name} ${v.address || v.area} Hyderabad`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
