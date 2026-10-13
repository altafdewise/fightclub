# Hyderabad gym directory data

`lib/data/hyderabad-gyms.json` feeds `/gyms/hyderabad`.

Sources in the shipped file:
- OpenStreetMap (Overpass query over the Hyderabad metro bounding box 17.15–17.70 N, 78.15–78.80 E for
  `leisure=fitness_centre`, `amenity=gym`, `sport=fitness|crossfit|yoga|boxing`, and fitness-named
  `leisure=sports_centre`), localities filled with Nominatim reverse geocoding. ODbL: keep the attribution line on the page.
- Official brand websites for chain branches (Cult.fit, Gold's Gym, Anytime Fitness, Snap Fitness, F45, Talwalkars,
  Fitness One and local chains), each record's `sources[]` has the page it came from.

To get phone numbers and ratings for the long tail, run the Google Places enrichment with your own key:

```bash
GOOGLE_PLACES_API_KEY=... node scripts/hyderabad-gyms/enrich-google-places.mjs --max-calls 600
```

The script stays inside the monthly free Enterprise Text Search quota by default. Google's terms allow caching
place IDs indefinitely but other fields only for 30 days, so re-run monthly instead of treating the stored values as permanent.
