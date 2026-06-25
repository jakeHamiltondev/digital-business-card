# Linkfol — Product Backlog

**Product Vision:** Linkfol is a digital business card and professional identity platform that helps individuals create, share, and manage their professional presence — starting with students and professionals, scaling into a recruiting and networking tool for universities and businesses.

**Live URL:** https://digital-business-card-alpha-seven.vercel.app
**Domain:** linkfol.com (purchased, not yet connected)
**Repo:** https://github.com/jakeHamiltondev/digital-business-card

---

## Completed — MVP (Sprint 1)

- [x] Google OAuth sign-in (Supabase Auth)
- [x] Profile creation and editing (name, title, company, bio, contact info, social links)
- [x] Public shareable card at /{username}
- [x] QR code generation and sharing
- [x] Deployed to Vercel
- [x] Branded as Linkfol

---

## Sprint 2 — Foundation Polish

These items make the MVP feel like a real product. Low effort, high impact.

- [ ] **Connect linkfol.com domain to Vercel** — replace the long Vercel URL with linkfol.com so cards live at linkfol.com/jake
- [ ] **Avatar image upload** — use Supabase Storage so users can upload a profile photo instead of relying on the initial placeholder
- [ ] **Front/back card concept** — front of card shows: Full Name, Title, Company, Email, Phone, Avatar, Social Links. Back of card shows: Description/Bio. Add a flip interaction or tab toggle on the public card page
- [ ] **Landing page polish** — marketing copy, demo card preview, clear CTA for sign-up

---

## Sprint 3 — Sharing & Contacts

These features turn Linkfol from a static card into a networking tool.

- [ ] **vCard download (.vcf)** — "Save to Contacts" button on the public card that downloads a .vcf file to the viewer's phone
- [ ] **Saved Contacts page** — logged-in users can save other people's Linkfol cards to a personal contacts list within the app
- [ ] **Open Graph / SEO meta tags** — when someone shares a linkfol.com/jake URL on LinkedIn, iMessage, Slack, etc., it shows a rich preview with name, title, and avatar

---

## Sprint 4 — Customization & Themes

Let users make their card feel personal.

- [ ] **Card themes** — offer 3-5 preset color/layout themes users can choose from (e.g. minimal light, dark mode, bold color, corporate)
- [ ] **Custom colors** — let users pick primary/accent colors for their card
- [ ] **Multiple card layouts** — different arrangements of the same info (stacked, side-by-side, etc.)

---

## Sprint 5 — Apple Wallet Integration

Let users add their Linkfol card to Apple Wallet for instant tap-to-share at events and meetings.

- [ ] **Generate Apple Wallet pass (.pkpass)** — create a pass containing the user's name, title, company, and a QR code linking to their public card. Uses the PKPass format (JSON manifest + assets, zipped and signed)
- [ ] **"Add to Apple Wallet" button** — on the dashboard and public card page, a button that downloads the .pkpass file and prompts the user to add it
- [ ] **Pass signing server** — Apple requires passes to be cryptographically signed with an Apple Developer certificate. Set up a serverless function (Vercel API route) to generate and sign passes on demand
- [ ] **Auto-update pass** — when a user updates their profile, push an update to their wallet pass so the QR code and info stay current (requires Apple Push Notification service for wallet)
- [ ] **Google Wallet support** — extend the same concept to Google Wallet passes for Android users

**Prerequisites:** Requires an Apple Developer account ($99/year) for pass signing certificates.

---

## Sprint 6 — Resume Builder

A major feature expansion that adds long-form professional content alongside the card.

- [ ] **Resume builder** — structured form for work experience, education, skills, certifications, and projects. Stored in Supabase, linked to the user's profile
- [ ] **Public resume page** — viewable at linkfol.com/jake/resume, linked from the card
- [ ] **AI resume builder** — use Claude API to help users generate, rewrite, and polish resume content from bullet points or rough notes
- [ ] **Resume PDF export** — generate a clean, downloadable PDF from the stored resume data

---

## Sprint 7 — Analytics

Help users understand who's viewing their card.

- [ ] **View count** — track and display how many times a public card has been viewed
- [ ] **View history** — show a timeline of views (date/time, anonymized unless the viewer is logged in)
- [ ] **QR scan tracking** — differentiate between direct link visits and QR code scans
- [ ] **Dashboard analytics widget** — summary stats on the dashboard (views this week, total views, top referrers)

---

## Sprint 8 — B2B / University Platform (Long-Term)

This is the monetization and scale play. Transforms Linkfol from a personal tool into a platform.

**Student / Individual Tier:**
- [ ] Free account with full card, QR, and resume features
- [ ] Shareable profile optimized for career fairs and networking events

**Business / Recruiter Tier (paid subscription):**
- [ ] Organization account with team management
- [ ] Save and organize contacts acquired at events (career fairs, conferences)
- [ ] Rate and tag saved contacts (e.g. "strong candidate", "follow up", "engineering")
- [ ] Notes on saved contacts
- [ ] Export saved contacts to CSV / ATS integration
- [ ] Event mode — bulk scan QR codes at a career fair, auto-save to org contacts

**University Tier (paid subscription):**
- [ ] University-branded card templates for students
- [ ] Admin dashboard for career services to manage student profiles
- [ ] Event creation — career fairs with attendee lists and employer matching
- [ ] Analytics for career services (student engagement, employer interest)

---

## Parking Lot (Ideas to Revisit)

- NFC tap-to-share (physical card integration)
- Custom domain support (e.g. card.jakehill.com)
- Team cards (shared branding for a company's employees)
- API for third-party integrations
- Mobile app (React Native / Expo)
- Multi-language support

---

*Last updated: June 24, 2026*
