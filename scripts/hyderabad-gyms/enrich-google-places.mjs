#!/usr/bin/env node
/**
 * Fill phone numbers, addresses, ratings and coordinates for the Hyderabad gym directory
 * from the Google Places API (New) – Text Search. Run it once a month to refresh the dataset.
 *
 *   GOOGLE_PLACES_API_KEY=... node scripts/hyderabad-gyms/enrich-google-places.mjs [--max-calls 600]
 *
 * It reads lib/data/hyderabad-gyms.json, searches each locality in LOCALITIES for every QUERY,
 * pages through results, and merges by name + proximity. Phone/website/hours fields are in the
 * "Enterprise" Text Search SKU (1,000 free calls per month at the time of writing); the --max-calls
 * cap keeps the run inside that. Billing must be enabled on the Google Cloud project.
 * Google's terms do not allow caching Places data for more than 30 days except place IDs – re-run
 * this script monthly rather than treating the stored values as permanent.
 */
import fs from "node:fs/promises";
import path from "node:path";

const KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!KEY) {
  console.error("Set GOOGLE_PLACES_API_KEY (a Google Maps Platform key with Places API (New) enabled).");
  process.exit(1);
}
const argMax = process.argv.indexOf("--max-calls");
const MAX_CALLS = argMax > -1 ? Number(process.argv[argMax + 1]) : 600;
const DATA = path.resolve("lib/data/hyderabad-gyms.json");

const LOCALITIES = [
  "Kukatpally", "KPHB", "Miyapur", "Chanda Nagar", "Lingampally", "Nizampet", "Bachupally", "Pragathi Nagar",
  "Kondapur", "Gachibowli", "Madhapur", "Hitec City", "Jubilee Hills", "Banjara Hills", "Nanakramguda", "Kokapet",
  "Manikonda", "Narsingi", "Tellapur", "Financial District", "Tolichowki", "Mehdipatnam", "Attapur", "Rajendranagar",
  "Shamshabad", "Ameerpet", "Somajiguda", "Begumpet", "Punjagutta", "Sanath Nagar", "Moosapet", "Erragadda",
  "Secunderabad", "Bowenpally", "Alwal", "Kompally", "Suchitra", "Medchal", "Tarnaka", "Malkajgiri", "Sainikpuri",
  "AS Rao Nagar", "ECIL", "Uppal", "Boduppal", "Nagole", "LB Nagar", "Dilsukhnagar", "Vanasthalipuram", "Hayathnagar",
  "Kothapet", "Saroornagar", "Chaitanyapuri", "Abids", "Koti", "Narayanguda", "Himayatnagar", "Basheerbagh",
  "Charminar", "Malakpet", "Santoshnagar", "Falaknuma", "Chandrayangutta", "Gudimalkapur", "Masab Tank",
  "Yousufguda", "Srinagar Colony", "Marredpally", "Trimulgherry", "Kapra", "Nacharam", "Habsiguda", "Ramanthapur",
  "Amberpet", "Musheerabad", "Kavadiguda", "Khairatabad", "Lakdikapul", "Film Nagar", "Shaikpet", "Puppalaguda",
  "Gopanpally", "Kollur", "Patancheru", "Beeramguda", "Ameenpur", "Gajularamaram", "Jeedimetla", "Shamirpet",
  "Ghatkesar", "Pocharam", "Peerzadiguda", "Meerpet", "Badangpet", "Turkayamjal", "Adibatla",
];
const QUERIES = ["gym", "fitness studio", "crossfit", "yoga studio", "pilates studio", "boxing gym", "zumba dance fitness"];
const FIELDS = [
  "places.id", "places.displayName", "places.formattedAddress", "places.nationalPhoneNumber", "places.internationalPhoneNumber",
  "places.websiteUri", "places.location", "places.rating", "places.userRatingCount", "places.regularOpeningHours.weekdayDescriptions",
  "places.businessStatus", "places.primaryType", "nextPageToken",
].join(",");

const norm = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").replace(/\b(the|gym|gyms|fitness|centre|center|studio|club|hyderabad)\b/g, "").trim();
const km = (a, b) => {
  const r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};
const categoryOf = (name, type) => {
  const n = name.toLowerCase();
  if (/crossfit/.test(n)) return "crossfit";
  if (/yoga/.test(n) || type === "yoga_studio") return "yoga";
  if (/pilates/.test(n)) return "pilates";
  if (/boxing|mma|martial|kickbox|muay|jiu|karate|taekwondo/.test(n)) return "boxing_mma";
  if (/zumba|dance/.test(n)) return "dance";
  return "gym";
};

const dataset = JSON.parse(await fs.readFile(DATA, "utf8"));
const byPlaceId = new Map(dataset.venues.filter((v) => v.placeId).map((v) => [v.placeId, v]));
let calls = 0, added = 0, enriched = 0;

async function search(textQuery, pageToken) {
  if (calls >= MAX_CALLS) return null;
  calls++;
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": FIELDS },
    body: JSON.stringify({ textQuery, pageSize: 20, pageToken, languageCode: "en", regionCode: "IN",
      locationBias: { circle: { center: { latitude: 17.4, longitude: 78.48 }, radius: 40000 } } }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

function merge(p) {
  if (p.businessStatus === "CLOSED_PERMANENTLY") return;
  const loc = p.location ? { lat: p.location.latitude, lng: p.location.longitude } : null;
  const name = p.displayName?.text ?? "";
  let v = byPlaceId.get(p.id);
  if (!v) {
    const key = norm(name);
    v = dataset.venues.find((x) => !x.placeId && norm(x.name) === key && (!loc || typeof x.lat !== "number" || km(loc, { lat: x.lat, lng: x.lng }) < 1.5));
  }
  const phone = p.nationalPhoneNumber || p.internationalPhoneNumber || "";
  if (!v) {
    v = { id: `gp-${p.id}`, name, category: categoryOf(name, p.primaryType), area: "", address: "", phone: "", sources: [] };
    dataset.venues.push(v);
    added++;
  } else enriched++;
  v.placeId = p.id;
  if (!v.phone && phone) v.phone = phone;
  if (!v.address && p.formattedAddress) v.address = p.formattedAddress.replace(/, India$/, "");
  if (!v.website && p.websiteUri) v.website = p.websiteUri;
  if (loc && typeof v.lat !== "number") Object.assign(v, loc);
  if (typeof p.rating === "number") { v.rating = p.rating; v.ratingCount = p.userRatingCount ?? null; }
  if (!v.hours && p.regularOpeningHours?.weekdayDescriptions?.length) v.hours = p.regularOpeningHours.weekdayDescriptions.join("; ");
  if (!v.area) {
    const hit = LOCALITIES.find((l) => new RegExp(`\\b${l}\\b`, "i").test(v.address));
    v.area = hit ?? "";
  }
  if (!v.sources.includes("google-places")) v.sources.push("google-places");
  byPlaceId.set(p.id, v);
}

outer: for (const locality of LOCALITIES) {
  for (const q of QUERIES) {
    let token;
    do {
      const page = await search(`${q} in ${locality}, Hyderabad`, token);
      if (!page) break outer;
      for (const p of page.places ?? []) merge(p);
      token = page.nextPageToken;
      if (token) await new Promise((r) => setTimeout(r, 1500));
    } while (token && calls < MAX_CALLS);
  }
  console.log(`${locality}: calls=${calls} venues=${dataset.venues.length}`);
}

dataset.generatedAt = new Date().toISOString().slice(0, 10);
if (!dataset.sources.includes("Google Places API")) dataset.sources.push("Google Places API");
dataset.venues.sort((a, b) => a.area.localeCompare(b.area) || a.name.localeCompare(b.name));
await fs.writeFile(DATA, JSON.stringify(dataset, null, 1) + "\n");
console.log(`done: ${calls} API calls, ${added} added, ${enriched} enriched, ${dataset.venues.filter((v) => v.phone).length}/${dataset.venues.length} with phone`);
