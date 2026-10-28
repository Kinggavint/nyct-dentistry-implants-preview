# Open items before launch

This site consolidates three websites into one for all three offices: nyctdentistry.com,
clearsmiledentalstudio.com and kentdentistryct.com. kentdentistryct.com already forwards its home
page to nyctdentistry.com, but its other pages return "page not found". Every old URL on all three
domains (175) is mapped to its new page in `REDIRECTS.csv` for 301 redirects at launch.

Everything on the site comes from the practice's onboarding answers, its uploads, its current
website (nyctdentistry.com), or the Stamford office's own website (clearsmiledentalstudio.com,
same address and phone as the Stamford office). Items below need the practice's confirmation or
material we do not have yet.

## Needs the practice's answer

0. **Dr. Byungchul Park.** Restored 2026-10-06: the practice's second email that day sent his website bio
   alongside Dr. Kwon's, so his card (new bio, portrait), the two-doctor photo, the team photo and the patient
   quotes that name him are back on every page. Please confirm his title and which offices he sees patients at;
   his bio names Fairfield and Litchfield counties in Connecticut and Northern Westchester, New York, so the
   site says that rather than naming offices.
2. **Stamford details still unconfirmed.** Hours, HUSKY, the $150 special and Cherry are confirmed (2026-10-06).
   Still from clearsmiledentalstudio.com and not yet confirmed: CBCT and intraoral cameras, and the office photos.
   **Removed 2026-10-06 until confirmed:** asked "which offers are current", the practice listed only the
   $240 and $150 specials and the complimentary consultation, and only Cherry for financing. So the $399
   membership plan, $1,000 off implants, implant packages ($1,499 / $11,999 / $19,999), senior savings,
   CareCredit, Sunbit, Chewsi and GreenSky are off the site. Restore from git (before this commit) if any
   are still offered. The practice confirmed (email 2026-10-11) the $1,499 implant price is old; it stays off.
   Prices: answered 2026-10-13, no prices; patients call or book online for the complimentary consultation.
3. **Team photos for each office.** Every office page now has a "Meet the team" section (2026-10-13): Stamford
   shows Dr. Oh (photo and bio now live), Maggie and Malena Valero; Mount Kisco and Kent show Dr. Kwon and Dr. Park
   for now. The practice is sending team photos: for each person please send the name, role and office.
9. **GIA and GIIA.** Dr. Kwon's new bio says he is faculty for the "GIA Implant Seminar Live Surgery Course"
   in Tijuana; the site now uses that wording. Both old websites also call him part-time faculty at the
   "Gangnam International Implant Academy (GIIA)", which is still listed. Are these the same program? If so,
   we will use one name. **Book:** *Dr. Youngsam Kim's Atlas of Implants* is linked on his page; the
   listing names only Dr. Kim as author. What was Dr. Kwon's role (co-author, translator)? A second book is
   expected by the end of 2026.
22. **New photos of Dr. Kwon (2026-10-06, first upload).** A podium lecture, a live surgery course, a conference talk
    and the UniCamillus photo in Rome are now on his page and the home page. Please tell us where and
    when each was taken if you would like that in the captions, and confirm the live surgery patient is
    comfortable being shown (face not visible).
10. **Spanish review.** Maggie will review the Spanish pages and the articles. The practice also wants the
    intro and the services in Spanish: the Spanish home intro and the Spanish services overview exist; the
    16 service detail pages are English only. Which ones should be translated first?
11. **Services list.** The practice plans to send its own list of services (Dental Implants, Smile Makeover,
    Veneers and Crowns, Extraction and Bone Grafting, Wisdom Teeth Extraction and more) with an explanation of
    each procedure, process and recovery time. The services page now opens with an Apple-style row of service
    buttons; new services from that list get their own page and button. There is no bone grafting page yet.
15. **Town pages.** The ten "dental implants in <town>" pages were near-duplicates of each other,
    which search engines treat as doorway pages. They are combined into one Areas We Serve page,
    and each old address redirects there.
16. **Blog posts.** All 31 Stamford blog posts are rewritten under the same addresses. Market prices,
    statistics and lifespan figures that could not be verified were removed.

## Photos

17. **Before and after order.** Set 7 (front tooth veneer) was reversed; swapped 2026-10-13 as the practice
    pointed out. Please confirm set 2 (missing front tooth replaced) is one patient.
18. **Unpaired photos.** DSC_0248 and DSC_0259 are now shown as a pair (the old site pairs them too).
    DSC_0667 and DSC_0679 still have no "after"; the old site shows them as a pair, but both look
    like "before" photos. The two full-arch X-ray cases come from the old site's gallery.
19. **Office photos.** Kent's nine photos (Drive, 2026-10-08) are on the Kent page (2026-10-13):
    exterior as the page opening, waiting room, treatment room and X-ray room. Mount Kisco's photos
    were already live. Not used: "Dr Kwon taking photo in Stamford office" (a patient is in the chair; may we show
    it?). The home page opening now cycles Kent and Stamford photos without office signs instead of Mount Kisco
    only, as the practice asked.
    **Office tour videos (2026-10-28):** the Kent tour (two clips, sound removed) and the Stamford tour are being
    added to the live Kent and Stamford pages through PR #12 on the live branch. The earlier preview-only
    versions on this branch were removed so this branch does not show tours that were never live.
    **Mount Kisco has no tour video yet**; please send one if you would like all three offices to have one.

## Answered 2026-10-06 (email)

- Domains: all three are in two GoDaddy accounts owned by the practice. No other domains.
- Hours confirmed with corrections (Kent and Stamford changed; Stamford is open Thursdays every other week).
- Specials: $240 new patient special (Mount Kisco, Kent), $150 (Stamford), complimentary consultation at all three.
- Cherry at all three offices, 0% for 12 to 18 months; per-office apply links and a payment calculator are live.
- Stamford accepts HUSKY for children and adults. Sedation: nitrous oxide at Kent only, no other types.
- Dr. Chun was never with the practice. Booking links confirmed. Before and after photos, more office
  photos and the office tour video are in progress.

## Answered 2026-10-06 (second email)

- Mission statement is on the home page (English and Spanish) right under the opening, and its first line,
  "Dentistry Built on Trust. Implants Designed to Last.", is now the signature line in the home page opening,
  the site footer and Dr. Kwon's page. It replaces "Built on Trust. Built to Last."
- Dr. Kwon's new bio is on his page and the team page (English and Spanish), in his words. Changes from the old
  text: full university name (UniCamillus, Saint Camillus International University of Health Sciences), the
  award was received during dental school, the Tijuana course runs several times each year (was "ten times a
  year"), and he lectures across North America since 2024 (was "North and Central America"). Travel added to
  his off-the-clock section.
- Dr. Park's bio received; he is restored (see item 0).

## Answered 2026-10-13 (email)

- **Logo and name.** The practice chose its black tooth logo ("Logo 2026", simple, black on white). It is in the
  header, the home page opening, the footer (white) and the browser icon. The name "NY, CT Dentistry & Implants"
  is used in page titles, Google's listing data and the footer copyright (and, after the second email, the
  header and home page wordmark). Original kept in logo-concepts/client-originals/.
- **Home page.** "Dentistry" and "Implants" in the opening line are highlighted like "Trust" and "Last".
- **Prices.** None listed; patients call or book online (the practice's online booking links).
- **Insurance.** The plan lists are gone from all three offices; the insurance page and office pages say to
  call the office, with each phone number. Stamford still notes HUSKY Health (Medicaid).
- **Clear aligners** are now "Spark Aligners" in the service buttons and menus (renamed "Clear Aligners - Spark" after the second email), and the aligner page links to
  the Spark Aligners brand page. Please confirm all three offices offer Spark.
- **Parking** is no longer mentioned anywhere (all offices have it).
- **Dr. Ryan Oh.** His bio (sent 2026-10-06) is now live on his own page, the team page and the Stamford page,
  with his photo (Drive, 2026-10-08).
- The practice asked to be told when all the old websites forward to the new one, and for the Drive link
  again to upload team photos.

## Answered 2026-10-13 (second email)

- **The live site was not updated.** The practice checked nyctdentistry.com, which still runs an older build
  (production branch `launch-cloudfront`), so the logo, home highlight and Dr. Oh's page it asked about were only
  on this preview. Production needs a deploy before the practice sees any of the 2026-10-13 work.
- **Wordmark (answers item 27).** The name reads "NY, CT Dentistry & Implants" in the header, home page opening
  and footer, in normal case (the live site shows it in capitals). It is set in Figtree, the closest open font to
  the lettering in the "Logo 2026" file, self-hosted in assets/fonts/.
- **Home page.** "Dentistry" and "Implants" are now clearly highlighted (blue with a full underline, also on
  phones); before, they had the same faint underline as "Trust" and "Last".
- **Dr. Park.** The line under his name now reads "Calm, Conservative, and Detail-Oriented" (was "Caring for
  Connecticut patients since 2015") on the team page, the home page and the office team cards. His bio text
  still says he has cared for Connecticut patients since 2015.
- **Services.** The aligner button and links read "Clear Aligners - Spark" (Spanish: "Alineadores transparentes
  - Spark"). The aligner page heading still reads "Spark Aligners for a Straighter Smile".
- **Root canals.** The root canal page now says "Most root canals can be done in our office, including molar
  root canals and retreatments."

## Answered 2026-10-13 (third email)

- **Dr. Oh on the home page.** The practice found his page "a bit secluded" and asked for his bio on the front page.
  The home page doctors section (English and Spanish) now shows Dr. Kwon, Dr. Park and Dr. Oh side by side, with a
  short bio card for Dr. Oh (from the bio the practice sent) and a "Meet Dr. Oh" link to his full page.
- **Still preview only.** Like the rest of the 2026-10-13 work, this is on the preview, not yet on nyctdentistry.com.

## Questions from 2026-10-13

28. **Logo color on the site.** The logo is black; buttons and links still use the blue accent. Keep blue for
    buttons, or move to black and white throughout?
29. **Root canal X-ray.** The practice asked whether an X-ray of a root canal would help. Yes: please send one or
    two of your own root canal X-rays (before and after, no patient name or date on the image) and we will add
    them to the root canal page. We have no root canal X-ray from the practice yet.
30. **Logo font.** The exact font in the "Logo 2026" file is not named in the file. If the designer can tell us
    the font name (or send the font), we will switch the name to it; until then the site uses the closest open
    match.
## Answered 2026-10-15 (email)

- **Team photos and root canal X-ray are coming.** The practice wrote "Will get the two things done soon":
  team photos for Meet the Team and a root canal X-ray (no patient information) go to the shared Drive folder.
  Nothing new was attached to this email, so the site is unchanged.
- **Clear Smile forwarding.** The practice asked when clearsmiledentalstudio.com will be merged into the new
  site. See item 25: the forward depends on who controls the Clear Smile DNS and hosting (GoDaddy manager
  access was added; the Energize answer on Cloudflare and hosting is still pending). We owe the practice a
  date or the blocker in plain words.

## Answered 2026-10-27 (email)

- **Stamford office tour.** The practice sent its Stamford tour video (Google Drive link). It is going on the
  Stamford page (see item 19). No patient information appears in it.
- **"Do you have the video tour of all 3 offices now?"** Kent and Stamford, yes. Mount Kisco, no: no Mount
  Kisco tour has come in by Drive or email (see item 19).
- **Hosting.** The practice wrote that the hosting for all three websites looks done. We owe the practice a
  reply confirming the status of each domain forward (item 25).

## Features waiting on access

20. **Live Google reviews.** Business Profile access is confirmed: support@apexailabs.ai has been a Manager
    on all three profiles since 2026-10-06 (Google's "You are now a manager" emails for Mt Kisco Dentistry &
    Implants, Kent Dentistry and Implants, and Stamford Dentistry & Implants - Clear Smile Dental Studio).
    The practice asked us to double check (email 2026-10-12); nothing more is needed from the practice.
    Live reviews on the site still need the Business Profile API connection on our side, which Google has
    not opened for our project yet. Real patient quotes from both websites are shown meanwhile. Google names
    today: Kent Dentistry and Implants, Mt Kisco Dentistry & Implants, Stamford Dentistry & Implants - Clear
    Smile Dental Studio (practice is open to suggestions).
25. **Clear Smile domain.** clearsmiledentalstudio.com needs to forward to the new Stamford page. The practice
    (2026-10-11) only knows about GoDaddy, not Cloudflare, and has emailed Energize to ask whether they run
    Cloudflare and the hosting for the Clear Smile site. It also added Apex as a manager on the GoDaddy account
    for Clear Smile and asked whether that is enough.
    Asked again 2026-10-15: "Any clue when the clear smile dental studio website will be merged to the new one?"
    The merged content is already on the new site (Stamford page, blog posts, redirects in REDIRECTS.csv); only
    the domain forward is outstanding.
26. **Google Analytics and Search Console.** The practice wants them owned by nyctdentistryimplants@gmail.com
    (email 2026-10-11).
21. **Website chat.** Live. Handoffs go to nyctdentistryimplants@gmail.com (confirmed 2026-10-06). It now opens
    by asking which location works best and offers the three offices as buttons, as the practice asked.
    Common questions and answers from the practice would make it more useful.
23. **Teaching photos and fliers (2026-10-06, second upload).** Three live surgery photos from
    Tijuana (patients covered by drapes) and the 2026 Dallas lecture photo are on his page and the
    home slideshow. From the fliers his page now lists: Dallas 2026 and New York 2024 hands-on crestal
    sinus lift courses at the K-Dental World Conference, and interpreting Dr. Youngsam Kim's 2024 Los
    Angeles third molar seminar. The fliers themselves are not shown (prices and sponsor logos).
    One Tijuana photo was left out because a patient's name is readable on the X-ray screen.
24. **Patient videos (2026-10-06).** Nine testimonial videos are live: all nine on the Reviews page,
    three on each home page (English and Spanish), and one on each office page. Please confirm:
    - Each patient agreed to appear on the website.
    - Which office the five videos without an office are from (1.mp4, 2.mp4 and 3.mp4 are one patient;
      "1 (1).mp4", "2 (1).mp4"). Kent comes from the phone's location data, Stamford from the sign.
    - The Stamford video shows the old Clear Smile sign on a screen behind the patient. Keep it?
    - The Spanish video "2 (1).mp4" has a built-in caption reading "Doctor Quick". Keep it as is?
    - Two patients say their full names; the site shows first name and last initial only.
    Still wanted: a short introduction of Dr. Kwon and the team.
