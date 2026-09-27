# Linkfol — Product Backlog

**Product Vision:** Linkfol is a digital business card and professional identity platform that helps individuals create, share, and manage their professional presence — starting with students and professionals, scaling into a recruiting and networking tool for universities and businesses.

**Live URL:** https://linkfol.com
**Domain:** linkfol.com (connected to Vercel)
**Repo:** https://github.com/jakeHamiltondev/digital-business-card
**Analytics:** Vercel Analytics (enabled)

---

## Completed — MVP (Sprint 1)

- [x] Google OAuth sign-in (Supabase Auth)
- [x] Profile creation and editing (name, title, company, bio, contact info, social links)
- [x] Public shareable card at /{username}
- [x] QR code generation and sharing
- [x] Deployed to Vercel
- [x] Branded as Linkfol

---

## Completed — Foundation Polish (Sprint 2)

- [x] Connect linkfol.com domain to Vercel
- [x] Avatar image upload (Supabase Storage) + image cropper (react-easy-crop)
- [x] Front/back card flip interaction (3D CSS rotateY animation)
- [x] Landing page polish (hero, demo card, features section, footer)
- [x] Open Graph / SEO meta tags (dynamic OG images per user)

---

## Completed — Sharing & Contacts (Sprint 3)

- [x] vCard download (.vcf) — "Or save to phone contacts" on public card for non-logged-in users
- [x] Save Card to in-app collection — logged-in users can save other users' cards
- [x] "Sign in to save to My Cards" flow — auto-saves card after sign-up/sign-in
- [x] My Cards page (/cards) — grid view with favorites, tags, filtering, sorting, search
- [x] Dashboard hub (/dashboard) — welcome page with quick action cards
- [x] Edit Profile moved to /dashboard/edit
- [x] Persistent Navbar across all pages (Dashboard, Edit Profile, My Cards, Sign Out)
- [x] Smart post-login routing (new users → /dashboard, returning users → /{username})
- [x] Redirect to public card after profile save
- [x] Case-insensitive username handling

---

## Completed — Pre-Outreach Prep

- [x] Vercel Analytics enabled (page views, unique visitors, top pages)
- [x] Landing page redesign — student/networking focused (hero, demo card, how it works, social proof, CTA)
- [x] Social proof section — "Join the next generation of networkers" + "Built by a UNCW grad"

---

## Completed — Customization & Themes (Sprint 4)

- [x] 5 preset card themes (Midnight, Clean, Ocean, Forest, Slate) with color + style variations
- [x] Theme picker on Edit Profile page with mini preview cards
- [x] Themes applied dynamically via inline styles on public card
- [x] Theme persisted in Supabase profiles table

---

## Sprint 5 — Apple Wallet Integration

Let users add their Linkfol card to Apple Wallet for instant tap-to-share at events and meetings.

- [ ] **Generate Apple Wallet pass (.pkpass)** — create a pass containing the user's name, title, company, and a QR code linking to their public card
- [ ] **"Add to Apple Wallet" button** — on the dashboard and public card page
- [ ] **Pass signing server** — Vercel API route to generate and sign passes on demand
- [ ] **Auto-update pass** — push updates to wallet pass when profile changes
- [ ] **NFC tap-to-share via Wallet** — built-in Wallet functionality, no extra code needed
- [ ] **Google Wallet support** — extend to Google Wallet passes for Android users

**Prerequisites:** Requires an Apple Developer account ($99/year) for pass signing certificates.

---

## Sprint 6 — Resume Builder

A major feature expansion that adds long-form professional content alongside the card.

- [ ] **Resume builder** — structured form for work experience, education, skills, certifications, and projects
- [ ] **Public resume page** — viewable at linkfol.com/{username}/resume, linked from the card
- [ ] **AI resume builder** — use Claude API to help users generate, rewrite, and polish resume content
- [ ] **Resume PDF export** — generate a clean, downloadable PDF from the stored resume data

---

## Sprint 7 — Analytics (User-Facing)

Help users understand who's viewing their card.

- [ ] **View count** — track and display how many times a public card has been viewed
- [ ] **View history** — timeline of views (date/time, anonymized unless viewer is logged in)
- [ ] **QR scan tracking** — differentiate between direct link visits and QR code scans
- [ ] **Dashboard analytics widget** — summary stats (views this week, total views, top referrers)

---

## Sprint 8 — Advanced Customization

- [ ] **Custom colors** — let users pick their own primary/accent colors via color picker
- [ ] **Multiple card layouts** — different arrangements of the same info (stacked, side-by-side, horizontal, etc.)
- [ ] **Additional preset themes** — expand beyond the initial 5 based on user feedback
- [ ] **Font options** — let users choose from 3-5 font pairings

---

## Sprint 9 — B2B / University Platform (Long-Term)

This is the monetization and scale play. Transforms Linkfol from a personal tool into a platform.

**Student / Individual Tier:**
- [ ] Free account with full card, QR, and resume features
- [ ] Shareable profile optimized for career fairs and networking events

**Business / Recruiter Tier (paid subscription):**
- [ ] Organization account with team management
- [ ] Save and organize contacts acquired at events (career fairs, conferences)
- [ ] Rate and tag saved contacts (e.g. "strong candidate", "follow up", "engineering")
- [ ] Notes on saved contacts
- [ ] Export saved contacts to CSV / Excel
- [ ] Event mode — bulk scan QR codes at a career fair, auto-save to org contacts

**University Tier (paid subscription):**
- [ ] University-branded card templates for students
- [ ] Admin dashboard for career services to manage student profiles
- [ ] Event creation — career fairs with attendee lists and employer matching
- [ ] Analytics for career services (student engagement, employer interest)

---

## Parking Lot (Ideas to Revisit)

- Physical NFC cards/tags — branded Linkfol NFC cards programmed with user's profile URL, potential revenue stream
- Username squatting prevention — reserved username list for common brands/offensive words
- Username change redirects — store previous usernames and 301 redirect
- Verified badge system — for university/enterprise tiers to prevent impersonation
- Custom domain support (e.g. card.jakehill.com)
- Team cards (shared branding for a company's employees)
- API for third-party integrations
- Mobile app (React Native / Expo)
- Multi-language support
- PostHog integration for product event tracking (signups, button clicks, funnels)

---

*Last updated: July 5, 2026*
