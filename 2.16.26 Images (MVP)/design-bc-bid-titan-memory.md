# BC-Bid Titan — Project Memory File

## What This Project Is

BC-Bid Titan is an end-to-end metal building estimation, contract, and project management platform built for **13|7 FrameWorks / Burnett Customs** in Victoria, TX. It replaces manual spreadsheet estimating, handshake deals, and scattered project tracking with a fully automated digital pipeline.

---

## The Business Context

**Client:** Bobby Burnett — Burnett Custom Homes, LLC (doing business as 13|7 FrameWorks)
**Builder:** Mingma Inc. — Josh Meunier (Project Lead), Steve Sala (CRO), Bobby Chiumento (PM), Katarina Meunier (Developer)
**Engagement:** 3-month, $45,000 ($15K upfront + $10K/mo x 3)

**Why this matters:** Bobby lost $243,000 in a lawsuit because there were no signed terms of service. Every contract now requires section-by-section acknowledgment with initials and dual signatures. Legal protection is non-negotiable.

**Market:** Farm and ranch customers in South Texas. Standardized "cookie-cutter" metal building packages — not custom engineering. Target: 30 leads/month, 10 paying customers.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite + TypeScript | Estimating app + contract wizard |
| Hosting | GitHub Pages | Static site deployment |
| Database | Airtable (10 tables) | Central data hub for everything |
| CRM | Pipedrive (8-stage pipeline) | Sales pipeline and deal tracking |
| Automation | n8n (8 workflows) | Connects all systems, handles triggers |
| AI Images | fal.ai (Flux Dev model) | Generates realistic building renderings |
| Communications | Twilio + Vapi | SMS, AI phone agent, email |
| PDF Generation | jsPDF + html2canvas | Contracts, POs, construction plans |

---

## Building Configurations

- **2 construction types:** Pole Barn (weld-up) and I-Beam (rigid frame)
- **10 building sizes:** 30x40, 30x50, 40x40, 40x50, 40x60, 50x50, 50x60, 50x80, 60x60, 60x100
- **5 eave heights:** 10ft, 12ft, 14ft, 16ft, 20ft
- **100 total BOM configurations** (2 types × 10 sizes × 5 heights)
- **28–32 line items per BOM** depending on height tier
- **12,600 live Excel formulas** across 10 workbooks
- **Target margin:** 45% gross across all line items
- **Standard roof pitch:** 3:12 on everything, no variation
- **Carport** uses same cookie-cutter approach as Pole Barn
- **Bolt-Up** is custom-quote only (sent to Mueller/Lynn for engineering)

### Height Tiers (Cost Driver)

| Height | BOM Items | What Changes |
|--------|-----------|-------------|
| 10–12ft | 28 items | Standard frame, basic bracing |
| 14ft | 30 items | Adds fly braces + flange brace sag rods |
| 16–20ft | 32 items | Adds portal frame bracing + DTI washers |

Height is the dominant cost driver: 43–78% increase from 10ft to 20ft. The height modifier in the app: +$0 (10ft), +$1,500 (12ft), +$3,500 (14ft), +$6,000 (16ft), +$12,000 (20ft).

Pole Barn costs 3–10% more than I-Beam at standard heights. The gap narrows at taller heights.

---

## Estimating App Flow (8 Steps)

1. **Customer Info** — Name, phone, email, address (all required)
2. **Building Type** — Pole Barn, Carport, or Bolt-Up (Bolt-Up exits to custom quote)
3. **Building Size** — 10 options with "Starting at $XX,XXX" pricing
4. **Eave Height** — 5 options with dynamic price adjustment
5. **Doors** — Roll-up (12x12) and walk-through, placement on walls, min 2ft from edges
6. **Colors** — Roof, wall panels, trim from standard palette
7. **Add-Ons** — Gutters, insulation (wall + roof), windows, concrete slab
8. **Summary** — Full config, price breakdown, AI rendering, three buttons: Save / Modify / Proceed to Contract

---

## Contract System (8 Sections)

Every section requires: read → checkbox → initials pad → next section.

1. Customer Information (display only, no signature)
2. Project Overview & Definitions (scope, change orders)
3. Payment Terms (50/25/25 schedule, late fees)
4. Timeline & Changes (force majeure, change order policy)
5. Responsibilities (contractor + owner duties)
6. Warranties & Insurance (1-year workmanship, material warranties)
7. Legal Provisions (arbitration, jury waiver, RCLA Ch. 27, liability)
8. Final Signatures (owner + contractor full signatures, payment method selection)

**Post-signing automation:** PDF generated → emailed to both parties → stored in Airtable → Pipedrive updated → payment workflow triggered → internal project file created → BOM pulled → PO generated and emailed to distributor.

---

## Airtable Schema (10 Tables)

1. **Projects** — Master record linking everything
2. **Clients** — Customer contact info and history
3. **Estimates** — Saved configurations with pricing
4. **BOM Items** — Line items per project (28–32 per config)
5. **Purchase Orders** — Auto-generated POs to distributors
6. **Suppliers** — Mueller, Lynn, etc. with lead times
7. **Budget Tracking** — Budgeted vs. actual per category
8. **Construction Checklist** — 6-phase QC with green/red tags
9. **Team Members** — Internal staff and roles
10. **Activity Log** — All project actions and communications

---

## n8n Workflows (8 Total)

1. **New Estimate → Airtable + CRM** — Webhook from app, creates records
2. **AI Building Rendering** — Calls fal.ai Flux Dev, stores image
3. **Contract Signed → Full Automation** — Triggers 6 parallel tracks
4. **PO Generation & Email** — BOM → PDF → distributor email
5. **Payment Processing** — Validates payment, triggers project setup
6. **Weather Monitoring** — 6-hour polling, 4-level risk classification
7. **Automated Follow-Up** — 3/7/14-day cadence for saved estimates
8. **Customer Communication Hub** — AI-generated milestone updates

---

## Pipedrive Pipeline (8 Stages)

1. Lead Qualified (10%)
2. Discovery Completed (25%)
3. Estimate Prepared (40%)
4. Proposal Sent (50%)
5. Negotiation (65%)
6. Contract Sent (80%)
7. Contract Signed (95%)
8. Project Execution (100%)

Bi-directional sync with Airtable via n8n. Automated follow-up tasks at each stage. Lost deal tracking with 90-day win-back loop.

---

## Project Management System

- **Auto-generated per project** when contract is signed
- **6 construction phases:** Site Prep → Foundation → Structural → Roof → Walls → Finishing
- **Each phase has a checklist** with video tutorial links for expected results
- **Green tag / Red tag gate system** — phase must be approved before next begins
- **Payment tied to gates:** 25% mid-construction released at Phase 2 completion, 25% final at Phase 6
- **Weather integration:** OpenWeatherMap API, 6-hour polling, 4-level risk (Green/Yellow/Orange/Red)
- **AI communications:** Auto-generated delay notices via SMS, email, and Vapi phone agent
- **Budget vs. actual tracking** in Airtable with variance formulas

---

## Key Files in This Repository

```
gryphon-frameworks/
├── 2.16.26 Images (MVP)/
│   ├── BC-BidTitan_Master_Prompt_Guide.md    ← 16 Miro AI prompts
│   ├── Quick_Reference_Prompt_Execution.md    ← Team execution checklist
│   ├── BC-BidTitan_System_Architecture.html   ← Visual system diagram
│   └── design-bc-bid-titan-memory.md          ← THIS FILE
├── BOMS/                                      ← 10 BOM workbooks (100 configs)
├── Plans/                                     ← Construction plan PDFs
├── internal-docs/
│   ├── bom/                                   ← BOM source files
│   └── plans/                                 ← 100 plan PDFs (all configs)
├── react-app/                                 ← React estimating app source
├── PROJECT_PLAN.md                            ← Implementation status
├── REACT_ARCHITECTURE_PLAN.md                 ← Full React architecture
└── README.md                                  ← App overview and setup
```

**BC-Bid Titan Project Docs (in .projects/):**
- `Burnett customs Scope 2.10.2026.md` — Full scope of work ($45K engagement)
- `BOM_Executive_Summary_V2.md` — Analysis of 100 BOMs with cost comparisons
- `Burnett_Metal_Building_Closer_Specification.md` — App technical spec
- `2026 MSA Burnett Customs.md` — Master service agreement

---

## Uploaded Reference Files

- `137-Contract-Johnny-Appleseed-2026-02-16.pdf` — Sample completed contract showing full signing flow, construction plans (Exhibit A with 6 sheets: S-1 Aerial/Site Plan, S-2 Front/Rear Elevations, S-3 Left/Right Elevations, S-4 Roof Plan, S-5 Foundation/Concrete Plan, S-6 Door & Window Schedule)
- `BOM_30x40.xlsx` — Sample BOM workbook with Summary tab + 10 configuration tabs (PB and IB at all 5 heights)

---

## Payment Schedule

- **Draw 1 (30%):** Due upon contract signing
- **Draw 2 (30%):** Due upon delivery of materials to job site
- **Draw 3 (30%):** Due upon completion of framing
- **Final Draw (10%):** Due upon Substantial Completion

Material cost escalation clause: if costs increase >5% between signing and ordering, owner notified with option to accept Change Order or cancel with refund less admin fees.

---

## People to Remember

| Person | Role | Company |
|--------|------|---------|
| Bobby Burnett | Owner / Client | Burnett Custom Homes, LLC |
| Michaela | Sales Rep (needs coaching) | Burnett Customs |
| Alicia | Operations / PM (needs training) | Burnett Customs |
| Amber | Marketing / Books | Burnett Customs |
| Josh Meunier | Project Lead | Mingma Inc. |
| Steve Sala | Fractional CRO (sales strategy) | Mingma Inc. |
| Bobby Chiumento | Fractional PM (Six Sigma) | Mingma Inc. |
| Katarina Meunier | Developer | Mingma Inc. |

---

## Critical Design Decisions

1. **No 3D rendering** — Static AI-generated images via fal.ai, not a Mueller-style 3D builder
2. **Cookie-cutter only** — Pre-priced packages for Pole Barn and Carport; Bolt-Up is custom quote
3. **GitHub Pages** — Static hosting, no server-side processing in the app itself
4. **Airtable as backend** — All pricing, BOM, project data lives in Airtable, accessed via API
5. **n8n as orchestrator** — Self-hosted workflow automation connects everything
6. **Section-by-section contract** — Legal protection pattern: checkbox + initials per section, not a single "I agree" at the end
7. **45% target margin** — Applied uniformly across all BOM line items
8. **3:12 roof pitch** — Standardized, no variation, keeps crews consistent

---

## What's Built vs. What's Planned

### Built (Working Prototype)
- React estimating app (Steps 1–8)
- Contract wizard (8 sections with acknowledgment flow)
- Signature pad (touch + mouse)
- Contract PDF generation with floor plans and signatures
- 2D building profile with door placement visualization
- Color selection with building preview
- 100 BOM workbooks with 12,600 formulas
- 100 construction plan PDFs

### Needs Building
- Airtable database migration (from Excel workbooks)
- n8n workflow automation (all 8 workflows)
- fal.ai integration for AI renderings
- Pipedrive CRM setup and bi-directional sync
- Payment processing integration
- Weather monitoring system
- Auto-generated project management dashboards
- Material delivery risk tracking
- AI customer communications (Twilio + Vapi)
- Budget vs. actual tracking system
