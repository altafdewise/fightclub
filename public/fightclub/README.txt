FIGHT CLUB — image drop folder
==============================

Put Fight Club photos in THIS folder. Files here are served from the
website root, so a file named "champion.jpg" here becomes the URL
"/fightclub/champion.jpg".

After adding files, edit  lib/fightclub/config.ts  to point at them.

------------------------------------------------------------------
1) CHAMPION PHOTO (Fighter of the Night — the big highlight section)
------------------------------------------------------------------
  - Drop the winner's photo here, e.g.:  champion.jpg
  - Portrait orientation, ~4:5 ratio, shot tight on the fighter,
    dark background looks best in the gold/blood frame.
  - Then in config.ts set:
        export const CHAMPION = {
          name: "Their Name",
          photo: "/fightclub/champion.jpg",
          wonOn: "Series One · 8th June",
          record: "3 bouts · 3 stoppages",   // optional
          quote: "Nobody left standing.",     // optional
        };
  - Leave name "" to show the "THE THRONE IS EMPTY" state.

------------------------------------------------------------------
2) GALLERY PHOTOS (Series One hype strip on the landing page)
------------------------------------------------------------------
  - Drop any number of photos here, e.g.:
        s1-01.jpg, s1-02.jpg, s1-03.jpg, ...
  - Then in config.ts list them (uncomment / edit GALLERY):
        export const GALLERY = [
          "/fightclub/s1-01.jpg",
          "/fightclub/s1-02.jpg",
          "/fightclub/s1-03.jpg",
        ];
  - Square-ish crops look best (they're shown in a square grid).
  - Leave GALLERY empty to show placeholder tiles instead.

Tip: keep each image under ~500 KB so the page stays fast.
You can delete this README — it isn't used by the site.
