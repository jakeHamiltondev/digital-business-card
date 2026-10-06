# Linkfol Business Plan
*Working draft — strategic planning document*
*Last updated: July 2026*

---

## 1. Executive Summary

Linkfol (linkfol.com) is a digital business card and professional networking platform that lets users create a shareable, always-up-to-date profile — accessible via QR code or link — that replaces paper business cards and simplifies professional connection-sharing. Linkfol is currently pre-launch, with a working product (Google OAuth, public profile pages, QR generation, avatar/branding, saved cards with tagging, and vCard export) and a planned go-to-market beachhead of UNCW students, expanding next to small business owners.

**Status:** Pre-launch, core product built, no users yet.
**Model:** Freemium — free tier for individuals, paid tier(s) for power users/businesses.
**This document exists for:** personal strategic clarity — not an investor pitch.

---

## 2. Problem & Solution

**Problem:**
- Paper business cards are wasteful, easy to lose, and can't be updated once printed.
- Existing digital alternatives are either too narrow (Linktree — link-in-bio only, no identity/contact layer) or too heavyweight (LinkedIn — great for connections, poor for instant in-person exchange).
- Small business owners and students alike need a fast, professional way to share contact info and links in one tap, without carrying printed cards or awkwardly typing a LinkedIn URL into someone's phone.

**Solution:**
Linkfol gives anyone a personal, brandable profile page (`linkfol.com/[username]`) shareable instantly via QR code, with saved-card organization for the people you meet, and no app required for the person receiving it.

---

## 3. Market Analysis

*(Flagging: no market sizing has been done yet — below are placeholder categories worth filling in with real research before this section is "done.")*

- **TAM:** Global professional population needing networking/contact tools
- **SAM:** US students + small business owners actively networking
- **SOM (beachhead):** UNCW student body (~17,000 students) as initial wedge

**Trends supporting demand:**
- Growing normalization of QR-based interactions (post-2020 habit shift)
- Gen Z discomfort with paper/traditional networking tools, preference for mobile-first
- Small business owners increasingly managing their own marketing/networking digitally without dedicated staff

**Open question for you:** worth a quick pass at estimating SAM/SOM with real numbers once you have even a little usage data — flag if you want help sourcing that.

---

## 4. Product Overview

**Shipped (as of current build):**
1. Google OAuth authentication
2. Public shareable profile cards at `/[username]`
3. QR code generation per profile
4. Avatar upload with cropping
5. Dynamic Open Graph images (for link previews when shared)
6. Saved cards system — favorites, tags, filtering
7. Dashboard hub
8. vCard download for non-users (no account needed to save a contact)

**Planned (from your product backlog):**
- Customization/themes
- Apple Wallet / NFC support
- AI resume builder (using Claude API)
- Analytics

---

## 5. Business Model — Freemium

**Free tier (individuals):**
- One profile card, QR code, saved cards (limited count), vCard export

**Paid tier — a few directions to consider, since this isn't locked yet:**

| Option | What's included | Best fit |
|---|---|---|
| **A. Pro Individual** | Custom domain/vanity URL, advanced analytics (who scanned/viewed your card, when), unlimited saved cards | Sales/BD, job seekers, power networkers |
| **B. Branding/Themes** | Custom themes, colors, layout branding, priority support | Anyone wanting a polished personal brand |
| **C. AI Resume Builder** | Claude-powered resume generation tied to your Linkfol profile data | Students/job seekers — strong fit with UNCW beachhead |
| **D. Business/Team plan** | Multiple team member cards under one branded org, shared analytics, bulk QR codes for events | Small business owners (your next target segment) |

**Suggested path:** Option D pairs naturally with your small-business-owner expansion — a "team card" package (e.g., $X/month for up to 5 employee cards, shared branding, lead capture analytics) is a clean B2B upsell beyond the free individual tier. Worth prototyping pricing (e.g. $9–15/mo individual Pro, $29–49/mo small team) once you have early user feedback on willingness to pay.

---

## 6. Go-to-Market Strategy

**Phase 1 — UNCW students (current focus):**
- Campus ambassador/referral approach
- Target career fairs, networking events, student orgs
- Viral loop: every shared QR code exposes a new person to Linkfol

**Phase 2 — Small business owners:**
- Position as "digital business card for your whole team" — solves the same paper-card problem but with a B2B angle (consistent branding, lead capture)
- Channels to consider: local Chamber of Commerce networking events (natural given Wilmington NC base), small business Facebook/LinkedIn groups, direct outreach to service businesses (realtors, contractors, consultants) who network heavily
- Low-cost validation: talk to 5–10 small business owners before building anything SMB-specific (same "5-person validation sprint" approach you used for MergeTender)

---

## 7. Competitive Landscape

| Competitor | Strength | Linkfol's differentiation |
|---|---|---|
| **Linktree** | Simple, huge brand recognition | Linktree is link-aggregation only — no contact-card identity layer, no QR-first in-person use case |
| **HiHello** | Direct digital business card competitor | Opportunity to differentiate on modern UX, AI resume feature, and campus-first community growth |
| **LinkedIn** | Massive network effects | Too heavy for instant in-person exchange; Linkfol complements rather than replaces it (Linkfol can link *to* LinkedIn) |
| **Popl** | NFC-focused digital cards | Popl leans hardware/NFC; Linkfol is software-first and free to start, lower friction |

---

## 8. Financial Projections

*(Placeholder — no real financials yet since you're pre-launch. Structure below for when you're ready to fill in numbers.)*

- **Costs:** Vercel + Supabase hosting (currently minimal at pre-launch scale), domain renewal, any paid APIs (Claude API for resume builder feature)
- **Revenue (once monetized):** Freemium conversion rate assumption (industry freemium benchmarks often land 2–5% free-to-paid — worth using as a rough anchor, not a promise)
- **Milestone to revisit this section:** once you have your first 100–500 users, model actual conversion and cost-per-user

---

## 9. Team

- **Jake Hamilton** — Founder. B.S. Business Application Development (UNCW), Business Solutions Specialist at Campbell Oil Company, U.S. Marine Corps veteran, pursuing PMP certification. Technical background spanning Next.js, TypeScript, Supabase, and prior ventures (MergeTender — Clover/Square POS integration platform).

---

## 10. Milestones / Roadmap

- [x] Core product build (auth, profiles, QR, saved cards, dashboard)
- [ ] UNCW beachhead launch — first real users
- [ ] Gather usage data → revisit Sections 3, 8 with real numbers
- [ ] Validate small business owner segment (5-person conversation sprint)
- [ ] Decide + build paid tier (pending pricing decision above)
- [ ] Themes/customization sprint
- [ ] AI resume builder sprint
- [ ] Apple Wallet / NFC sprint

---

## Open items to revisit
1. Real market sizing (Section 3) once you have data or want to research it
2. Lock in pricing for paid tier (Section 5)
3. Small business GTM specifics — which channel to test first (Section 6)
4. Financial model with real numbers (Section 8)
