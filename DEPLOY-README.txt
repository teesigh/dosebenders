DoseBenders — deploy bundle
===========================

UPLOAD THESE 11 FILES to the ROOT of your GitHub repo (overwrite existing):

  index.html            the whole app
  404.html              identical copy — makes SPA routing work on refresh
  sw.js                 service worker (offline support)
  site.webmanifest      PWA manifest
  favicon.svg           browser tab icon
  apple-touch-icon.png  iOS home screen icon (180x180)
  icon-192.png          PWA icon
  icon-512.png          PWA icon / splash
  og.png                social share image (1200x630)
  robots.txt            search engine directives
  sitemap.xml           search engine sitemap


>>> DO NOT DELETE OR OVERWRITE: config.js <<<

  index.html loads /config.js for your Supabase URL and anon key.
  That file is NOT in this bundle because it holds YOUR credentials.
  If you delete it, sign-in and cross-device sync will silently break.
  Leave your existing config.js exactly where it is.


NOT FOR GITHUB
--------------
The feedback-email folder is for Supabase, not Netlify:
  notify-feedback.ts     deploy as a Supabase Edge Function
  diagnose-and-fix.sql   run in the Supabase SQL editor
  SETUP.md               instructions
Do not put your Resend API key in this repo — index.html is public.


AFTER DEPLOYING
---------------
1. Hard-refresh (Ctrl/Cmd + Shift + R). The old service worker caches
   aggressively; the new sw.js is network-first so this is a one-time step.
2. Check the social preview at https://www.opengraph.xyz — paste your URL.
3. Confirm compression is on:
     curl -I -H "Accept-Encoding: br" https://dosebenders.com/
   Look for "content-encoding: br" or "gzip". The HTML is ~2.2 MB raw
   and should compress to roughly 350 KB.
