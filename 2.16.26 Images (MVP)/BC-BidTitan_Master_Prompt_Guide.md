# BC-Bid Titan: Master Prompt Engineering Guide

## Complete End-to-End System Architecture & Miro AI Prompts

**Project:** BC-Bid Titan (13|7 FrameWorks / Burnett Customs)
**Prepared by:** Mingma Inc. — Systems Architecture Team
**Date:** February 16, 2026
**Version:** 1.0 MVP

---

## TABLE OF CONTENTS

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Miro Board Organization Strategy](#2-miro-board-organization-strategy)
3. [PHASE 1 PROMPTS: Customer Estimating Flow](#3-phase-1-prompts-customer-estimating-flow)
4. [PHASE 2 PROMPTS: AI Image Generation Pipeline](#4-phase-2-prompts-ai-image-generation-pipeline)
5. [PHASE 3 PROMPTS: Contract & Legal Agreement Flow](#5-phase-3-prompts-contract--legal-agreement-flow)
6. [PHASE 4 PROMPTS: Payment Collection & Post-Contract](#6-phase-4-prompts-payment-collection--post-contract)
7. [PHASE 5 PROMPTS: BOM & Purchase Order Automation](#7-phase-5-prompts-bom--purchase-order-automation)
8. [PHASE 6 PROMPTS: Project Management Dashboard](#8-phase-6-prompts-project-management-dashboard)
9. [PHASE 7 PROMPTS: Weather & Risk Management](#9-phase-7-prompts-weather--risk-management)
10. [PHASE 8 PROMPTS: Complete Data Architecture (Airtable)](#10-phase-8-prompts-complete-data-architecture)
11. [PHASE 9 PROMPTS: n8n Workflow Architecture](#11-phase-9-prompts-n8n-workflow-architecture)
12. [PHASE 10 PROMPTS: Pipedrive CRM Pipeline](#12-phase-10-prompts-pipedrive-crm-pipeline)
13. [Wireframe Prompts for Key UI Screens](#13-wireframe-prompts-for-key-ui-screens)
14. [fal.ai Image Generation Prompt Templates](#14-falai-image-generation-prompt-templates)
15. [Implementation Sequence & Dependencies](#15-implementation-sequence--dependencies)

---

## HOW TO USE THIS GUIDE

Each prompt in this document follows Miro's recommended **RTCF Framework** (Role, Task, Context, Format). Copy each prompt directly into Miro AI Sidekick to generate the corresponding flowchart, diagram, or wireframe. After generation, refine manually in Miro by adjusting layouts, colors, and connections.

**Miro AI Tips:**
- Paste one prompt at a time into Miro AI Sidekick
- After generation, select all elements and apply consistent styling
- Use Miro's color coding: Blue = customer actions, Green = system automations, Orange = decision points, Red = error/risk paths, Purple = integrations
- Group related flows into Miro Frames for organization
- Connect frames with arrows showing the overall system flow

---

## 1. SYSTEM ARCHITECTURE OVERVIEW

### Master System Prompt (Generate First)

```
ROLE: You are a senior systems architect designing an end-to-end construction
technology platform for a metal building company in Texas.

TASK: Create a high-level architecture diagram showing the complete BC-Bid Titan
system with 6 major subsystems connected by data flows and automation triggers.
The subsystems are:

1. CUSTOMER ESTIMATING APP (React web app on GitHub Pages)
   - Building configurator: 3 types (Pole Barn, Carport, Bolt-Up), 10 sizes
     (30x40 through 60x100), 5 eave heights (10ft-20ft)
   - Add-ons: doors, windows, gutters, insulation, concrete
   - Color selection: roof, walls, trim
   - Real-time pricing from Airtable price matrix

2. AI IMAGE GENERATION (n8n + fal.ai)
   - Generates realistic building renderings based on customer selections
   - Uses Flux Dev model via fal.ai API
   - Triggered automatically when estimate is complete

3. CONTRACT & LEGAL SYSTEM (React contract wizard)
   - 7-section legal agreement with checkbox + initials per section
   - Digital signature capture for customer and contractor
   - PDF generation with building specs, floor plan, and signatures
   - Auto-email to customer and storage in Airtable

4. AIRTABLE DATABASE (Central data hub)
   - Projects, BOM, Clients, Estimates, Contracts, Budget tracking
   - 100 BOM configurations (10 sizes x 5 heights x 2 types)
   - Linked records connecting all tables
   - Automations for status changes and notifications

5. PIPEDRIVE CRM (Sales pipeline)
   - 8-stage pipeline: Lead → Discovery → Estimate → Proposal → Negotiation
     → Contract → Signed → Execution
   - Bi-directional sync with Airtable via n8n
   - Automated follow-up tasks and notifications

6. PROJECT MANAGEMENT (Post-contract operations)
   - Auto-generated dashboards and checklists
   - Material delivery tracking with risk management
   - Weather integration for timeline adjustments
   - Budget vs. actual tracking
   - AI-generated customer communications

CONTEXT: This is for Burnett Customs, a construction company in Victoria, TX
building standardized metal buildings for farm and ranch customers. The company
lost $243K in a lawsuit due to lack of proper contracts, so legal protection is
critical. They handle 30 leads/month with 10 guaranteed paying customers.
Building sizes range from 1,200 to 6,000 sq ft with prices from ~$18K to ~$105K.

FORMAT: Show each subsystem as a large labeled block. Draw data flow arrows
between them showing what data moves where. Include the technology stack labels
(React, n8n, fal.ai, Airtable, Pipedrive) on each block. Show the customer
journey as a primary flow path through the system from left to right. Show
internal automations as secondary flows below.
```

---

## 2. MIRO BOARD ORGANIZATION STRATEGY

### Board Setup Prompt

```
ROLE: You are a Miro workspace organizer setting up a product development board.

TASK: Create a board layout with 10 labeled Miro Frames arranged in a 2x5 grid
showing the complete BC-Bid Titan development roadmap. Each frame represents
one major system component:

Row 1 (Customer-Facing Flow, left to right):
- Frame 1: "ESTIMATING APP FLOW" (customer building configurator)
- Frame 2: "AI IMAGE GENERATION" (fal.ai rendering pipeline)
- Frame 3: "CONTRACT & SIGNING" (legal agreement wizard)
- Frame 4: "PAYMENT COLLECTION" (payment processing)
- Frame 5: "POST-CONTRACT AUTOMATION" (BOM, PO, handoff)

Row 2 (Backend Systems, left to right):
- Frame 6: "AIRTABLE DATA ARCHITECTURE" (database schema)
- Frame 7: "N8N WORKFLOW MAP" (all automation workflows)
- Frame 8: "PIPEDRIVE CRM PIPELINE" (sales stages)
- Frame 9: "PROJECT MANAGEMENT" (dashboards, checklists)
- Frame 10: "WEATHER & RISK MANAGEMENT" (monitoring systems)

FORMAT: Show frames as rectangles with clear titles. Draw connector arrows
between frames showing dependencies. Add a legend showing color coding:
Blue = Customer-facing, Green = Automation, Orange = Data, Purple = Integration.
```

---

## 3. PHASE 1 PROMPTS: Customer Estimating Flow

### Prompt 1A: Complete Estimating App User Journey

```
ROLE: You are a UX flow designer for a construction sales application used by
field sales reps on tablets during in-person customer meetings.

TASK: Create a detailed flowchart showing the complete user journey through the
13|7 FrameWorks metal building estimating application. The flow has 9 sequential
steps with decision branches:

STEP 1 — CUSTOMER INFO ENTRY
- Fields: Name, Phone, Email, Property Address, City, State, ZIP
- Validation: All fields required, email format check, phone format check
- On complete → proceed to Step 2

STEP 2 — SELECT BUILDING TYPE
- 3 options presented as large cards:
  Option A: "Pole Barn" (cookie-cutter pricing, pre-configured)
  Option B: "Carport" (cookie-cutter pricing, pre-configured)
  Option C: "Bolt-Up Construction" (custom quote only)
- Decision: IF Bolt-Up selected → branch to "Custom Quote Request"
  (collect specs, send to Mueller/Lynn supplier, exit main flow)
- IF Pole Barn or Carport → proceed to Step 3

STEP 3 — SELECT BUILDING SIZE
- 10 size options displayed as selectable cards with "Starting at $XX,XXX":
  30x40 (1,200 sqft), 30x50 (1,500 sqft), 40x40 (1,600 sqft),
  40x50 (2,000 sqft), 40x60 (2,400 sqft), 50x50 (2,500 sqft),
  50x60 (3,000 sqft), 50x80 (4,000 sqft), 60x60 (3,600 sqft),
  60x100 (6,000 sqft)
- Base price pulled from Airtable price matrix
- On select → proceed to Step 4

STEP 4 — SELECT EAVE HEIGHT
- 5 height options: 10ft, 12ft, 14ft, 16ft, 20ft
- Price adjusts dynamically based on height selection
  (+$0 at 10ft, +$1,500 at 12ft, +$3,500 at 14ft, +$6,000 at 16ft,
   +$12,000 at 20ft)
- Height is the dominant cost driver (43-78% increase from 10ft to 20ft)
- On select → proceed to Step 5

STEP 5 — DOOR CONFIGURATION
- Roll-Up Doors (12x12): Select quantity, placement on gabled or eave wall
  Rule: Minimum 2ft from wall edge
- Walkthrough Doors: Select quantity, wall placement
- Visual building profile updates in real-time showing door positions
- On complete → proceed to Step 6

STEP 6 — ADD-ONS & OPTIONS
- Gutters (priced per linear foot)
- Wall Insulation (priced per sqft)
- Roof Insulation (priced per sqft)
- Windows (optional, most farm/ranch skip)
- Concrete Slab (4" slab, 12" perimeter beam, #3 rebar, vapor barrier)
- Each add-on priced as line item on top of base price
- On complete → proceed to Step 7

STEP 7 — COLOR SELECTION
- Roof Color (from standard color palette)
- Wall/Panel Color (from standard color palette)
- Trim Color (from standard color palette)
- Visual building preview updates with selected colors
- On complete → proceed to Step 8

STEP 8 — ESTIMATE SUMMARY & REVIEW
- Full configuration summary displayed:
  Building type, size, eave height, doors, add-ons, colors
- Itemized price breakdown with subtotals
- Grand total prominently displayed
- Three action buttons:
  [SAVE ESTIMATE] → saves to Airtable + CRM, triggers follow-up
  [MODIFY SELECTIONS] → return to any previous step
  [PROCEED TO CONTRACT] → advance to contract signing flow

STEP 9 (BRANCH) — SAVE ESTIMATE PATH
- Estimate saved to Airtable with all selections
- CRM deal created/updated in Pipedrive
- Automatic follow-up task created (3-day, 7-day, 14-day cadence)
- Customer receives email summary of saved estimate
- Sales rep notified of saved estimate for follow-up

CONTEXT: The app replaces manual spreadsheet estimating. Sales reps use it on
tablets during face-to-face meetings with farm/ranch customers in Texas. The
cookie-cutter approach means standard packages with add-on customization.
Standard 3:12 roof pitch on all buildings, no variation. All pricing data
lives in Airtable with 100 BOM configurations backing the price matrix.

FORMAT: Create a vertical flowchart flowing top to bottom. Use rectangles for
process steps, diamonds for decisions, and rounded rectangles for start/end
points. Show the Bolt-Up branch splitting off to the right. Show the Save
Estimate branch splitting left from Step 8. Color-code: Blue for customer
input screens, Green for system calculations, Orange for decision points,
Gray for data storage actions.
```

### Prompt 1B: Pricing Engine Data Flow

```
ROLE: You are a data architect designing the pricing calculation engine for a
metal building estimating application.

TASK: Create a data flow diagram showing how pricing is calculated in real-time
as a customer makes selections in the estimating app. Show all data sources,
calculation steps, and the final price assembly.

DATA SOURCES (from Airtable):
- Base Price Matrix: 10 sizes x 5 heights x 2 types = 100 configurations
  Each has: Internal Cost, Selling Price, Margin % (target 45%)
- Add-On Pricing Table: Gutters, insulation, doors, windows, concrete
  Each has: Unit price, quantity multiplier, category
- BOM Reference: 28-32 line items per configuration depending on height tier
  10-12ft = 28 items, 14ft = 30 items (adds fly braces, sag rods),
  16-20ft = 32 items (adds portal bracing, DTI washers)

CALCULATION FLOW:
1. Customer selects Building Type → filter to Pole Barn or Carport matrix
2. Customer selects Size → lookup base price row
3. Customer selects Eave Height → lookup specific price column
4. BASE PRICE = Matrix[Type][Size][Height]
5. Customer adds doors → DOOR_TOTAL = (qty x unit_price) per door type
6. Customer adds options → OPTIONS_TOTAL = sum of all add-on line items
7. Customer selects concrete → CONCRETE_TOTAL = sqft x rate + perimeter beam
8. SUBTOTAL = BASE_PRICE + DOOR_TOTAL + OPTIONS_TOTAL + CONCRETE_TOTAL
9. GRAND_TOTAL = SUBTOTAL (no tax on construction materials in TX)
10. DEPOSIT = GRAND_TOTAL x 50% (payment schedule: 50/25/25)

CONTEXT: Burnett Customs operates in South Texas. 100 BOMs with 12,600 live
Excel formulas currently drive all pricing. The app must match these calculations
exactly. Pole Barn costs run 3-10% higher than I-Beam depending on eave height.
Height is the dominant cost driver with 43-78% increase from 10ft to 20ft.

FORMAT: Show data sources as cylinders on the left. Show calculation steps as
process boxes in the center with formulas. Show the assembled price components
flowing into a final "Grand Total" output on the right. Include arrows showing
which customer selection triggers which data lookup. Label all arrows with the
data type being passed.
```

---

## 4. PHASE 2 PROMPTS: AI Image Generation Pipeline

### Prompt 2A: fal.ai Image Generation Workflow

```
ROLE: You are an automation architect designing an AI image generation pipeline
using n8n workflow automation and fal.ai's Flux Dev model.

TASK: Create a flowchart showing the complete automated workflow for generating
a realistic metal building rendering based on customer selections from the
estimating app. The workflow runs in n8n with these steps:

TRIGGER: Customer clicks "Generate Building Preview" or completes estimate

STEP 1 — WEBHOOK RECEIVES DATA
- n8n Webhook node receives POST request from React app
- Payload includes: building_type, size (width x length), eave_height,
  roof_color, wall_color, trim_color, door_config, add_ons, customer_name

STEP 2 — BUILD AI PROMPT (Function Node)
- Construct a detailed fal.ai prompt from customer selections
- Template: "Photorealistic architectural rendering of a [building_type]
  metal building, [width]ft wide by [length]ft long, [eave_height]ft eave
  height, 3:12 roof pitch, [roof_color] standing seam metal roof,
  [wall_color] corrugated metal wall panels, [trim_color] trim and fascia,
  [door_count] roll-up doors on [wall_position], set on a Texas rural
  farm/ranch property with flat terrain and clear sky, professional
  architectural photography, golden hour lighting, high resolution"
- Add style modifiers for photorealism

STEP 3 — CALL FAL.AI API (HTTP Request Node)
- POST to https://api.fal.ai/v1/run/flux/dev
- Headers: Authorization Bearer + FAL_API_KEY
- Body: prompt, image_size: "1024x768", num_inference_steps: 30,
  guidance_scale: 7.5
- fal.ai automatically handles queue management

STEP 4 — RECEIVE IMAGE URL
- fal.ai returns: image_url, request_id, generation_time
- Decision: IF generation failed → retry once, then notify error

STEP 5 — DOWNLOAD & STORE IMAGE
- Download generated image from fal.ai URL
- Upload to Google Drive project folder
- Generate unique filename: {customer_name}_{size}_{type}_{timestamp}.png

STEP 6 — UPDATE AIRTABLE
- Update project record with image URL
- Set field "Rendering Status" = "Complete"
- Link image to estimate record

STEP 7 — RETURN TO APP
- Send image URL back to React app via webhook response
- App displays generated rendering in estimate summary
- Image included in contract PDF if customer proceeds

ERROR HANDLING:
- If fal.ai fails: Log error to Airtable "Error Log" table
- Retry with exponential backoff (5s, 15s, 30s)
- If all retries fail: Notify sales rep, use placeholder image
- Timeout: 60 seconds maximum per generation request

CONTEXT: This replaces static stock photos with customized renderings that
match the customer's exact selections. The rendering shows the building in a
rural Texas setting matching the customer's property type. This is a key
differentiator for Burnett Customs against competitors using generic catalogs.

FORMAT: Create a vertical flowchart with the n8n workflow steps as blue process
boxes. Show the fal.ai API call as a purple integration box. Show Airtable
and Google Drive as green storage boxes. Include the error handling branch
splitting right with red error boxes. Show data payloads on connector arrows.
```

---

## 5. PHASE 3 PROMPTS: Contract & Legal Agreement Flow

### Prompt 3A: Complete Contract Signing Workflow

```
ROLE: You are a legal workflow architect designing a digital contract signing
system for a Texas residential construction company that lost $243,000 in a
lawsuit due to inadequate contract documentation.

TASK: Create a detailed flowchart showing the complete contract signing process
from when a customer clicks "Proceed to Contract" through final execution and
document delivery. The contract has 8 sections that must be completed in order:

TRIGGER: Customer clicks "Proceed to Contract" from Estimate Summary

SECTION 1 — CUSTOMER INFORMATION (Display Only)
- Auto-populated from estimating app: Name, Address, Phone, Email
- Building specs displayed: Type, Size, Height, Colors, Doors, Add-ons
- Customer reviews for accuracy
- No signature required, just review

SECTION 2 — PROJECT OVERVIEW & DEFINITIONS
- Scope of work description auto-generated from selections
- Key definitions: Change Order ($250 fee), Force Majeure, Substantial
  Completion
- Customer reads terms → checks acknowledgment checkbox → signs initials
  in initials pad → proceeds to next section

SECTION 3 — PAYMENT TERMS
- Payment schedule: 50% deposit, 25% at mid-construction, 25% at final
- Calculated amounts displayed (e.g., $13,250 / $6,625 / $6,625 on $26,500)
- Late payment terms: 10% fee + 10% every 72 hours
- Customer reads → checkbox → initials → next

SECTION 4 — TIMELINE & CHANGE ORDERS
- Estimated construction timeline based on building size
- Change order policy: $250 per change, $150/hr disruption fee
- Force Majeure clause (weather, materials, labor shortages)
- Customer reads → checkbox → initials → next

SECTION 5 — RESPONSIBILITIES
- Contractor responsibilities: Permits, materials, labor, cleanup
- Owner responsibilities: Site access, utilities, decisions within 48hrs
- Site preparation requirements
- Customer reads → checkbox → initials → next

SECTION 6 — WARRANTIES & INSURANCE
- 1-year workmanship warranty
- Electrical, plumbing, structural warranties
- Insurance requirements and proof of coverage
- Customer reads → checkbox → initials → next

SECTION 7 — LEGAL PROVISIONS
- Dispute resolution: Mediation → Binding Arbitration
- Jury Trial Waiver (express waiver)
- RCLA Notice (Texas Property Code Chapter 27)
- Liability limitations and indemnification
- Customer reads → checkbox → initials → next

SECTION 8 — FINAL SIGNATURES
- Contractor certification: Sales rep certifies they personally walked
  the customer through every section of the contract
- Owner printed name field
- Owner signature pad (full signature, not just initials)
- Contractor signature pad
- Date stamps auto-applied to both signatures
- Payment method selection: Cash, Check, ACH, Credit Card

POST-SIGNING AUTOMATION:
1. Generate Contract PDF with all sections, initials, signatures,
   building specs, 2D floor plan, and door placements
2. Email PDF to customer at their provided email address
3. Email copy to contractor (bobby@burnettcustoms.net)
4. Store PDF in Airtable project record
5. Update Airtable status to "Contract Signed"
6. Update Pipedrive deal stage to "Contract Signed"
7. Create Pipedrive activity: "Contract Executed - [date]"
8. Trigger payment collection workflow
9. Trigger internal project setup workflow

VALIDATION RULES:
- Cannot proceed to next section without checkbox AND initials
- Cannot submit without BOTH owner and contractor signatures
- Cannot submit without payment method selection
- All 7 acknowledgment sections must be completed in order
- PDF must contain all captured initials and signatures

CONTEXT: The step-by-step checkbox + initials approach ensures the customer
cannot claim they did not read or agree to the terms. The contractor
certification adds accountability. This system directly addresses the $243K
lawsuit by creating an airtight documentation trail. All contract terms are
Texas-compliant with RCLA notices.

FORMAT: Create a vertical flowchart flowing top to bottom. Show each contract
section as a blue process box with the section number. Show the
checkbox→initials→next validation as a repeating pattern within each section.
Show the post-signing automations branching into parallel paths at the bottom.
Use red borders on the legal provisions section to highlight its importance.
Include a legend explaining the validation requirements.
```

---

## 6. PHASE 4 PROMPTS: Payment Collection & Post-Contract

### Prompt 4A: Payment & Post-Contract Automation

```
ROLE: You are a business process architect designing post-contract automation
for a construction company that needs to track payments, generate internal
documents, and trigger material procurement automatically.

TASK: Create a flowchart showing everything that happens automatically after a
contract is signed and payment method is selected. This covers 6 parallel
automation tracks:

TRIGGER: Contract signed + payment method selected

TRACK 1 — PAYMENT COLLECTION
- Decision: Payment method selected?
  IF Cash/Check → Generate invoice with payment instructions, mark
    "Awaiting Payment", create 48-hour follow-up task
  IF ACH → Trigger ACH payment request via payment processor,
    monitor for confirmation
  IF Credit Card → Process card payment, handle success/failure
- On payment received:
  Update Airtable "Payment Status" = "Deposit Received"
  Update Pipedrive deal with payment note
  Send payment confirmation email to customer
  Trigger Track 2-6 simultaneously

TRACK 2 — INTERNAL PROJECT FILE CREATION
- Auto-create Project File in Airtable:
  Customer name, project details, contract date, payment status
  Link to signed contract PDF
  Link to estimate record
  Link to BOM configuration
- Create Project Management record with:
  Projected start date (based on material lead times)
  Projected completion date
  Assigned project manager
  Budget allocation from contract value

TRACK 3 — BOM GENERATION & PURCHASE ORDER
- Pull BOM template based on building size + type + eave height
  (from 100 pre-configured BOMs)
- Generate Purchase Order PDF via n8n:
  PO Number: auto-incremented
  Supplier: Based on building type (Mueller, Lynn, etc.)
  Line items from BOM with quantities and specifications
  Delivery address: Customer's property address
  Required delivery date: 2 weeks before projected start
- Auto-email PO PDF to distributor
- Store PO in Airtable linked to project
- Create "Awaiting Material Confirmation" task

TRACK 4 — BUDGET VS. ACTUAL SETUP
- Create Budget Tracking record in Airtable:
  Budgeted cost per BOM category (Structural, Roofing, Walls, etc.)
  Actual cost columns (updated as invoices arrive)
  Variance calculation (formula: Actual - Budget)
  Margin tracking (formula: (Revenue - Actual) / Revenue)
- Assign to project management team
- Set monthly review task for budget reconciliation

TRACK 5 — MATERIAL DELIVERY RISK MANAGEMENT
- Calculate critical path from BOM lead times
- Longest lead time item sets the risk threshold
- Create delivery timeline in Airtable:
  Order date, expected ship date, expected delivery date
  Status: Ordered → Shipped → Delivered → Verified
- Automated checks:
  IF delivery date > (start date - 3 days) → RED FLAG alert
  IF delivery date > (start date - 7 days) → YELLOW warning
  Weekly status check automation with supplier
- Notifications to PM and customer if delays detected

TRACK 6 — CRM & COMMUNICATION UPDATES
- Pipedrive deal moved to "Project Execution" stage
- Create milestone activities in Pipedrive:
  "Material Ordered", "Material Delivered", "Construction Start",
  "Mid-Point Inspection", "Final Walkthrough", "Project Complete"
- Schedule automated customer updates at each milestone
- Set up AI-generated communication templates for status updates

CONTEXT: Burnett Customs needs this automation to handle 10+ active projects
per month without manual tracking. The BOM system has 100 configurations
(10 sizes x 5 heights x 2 types) with 28-32 line items each, totaling
12,600 formulas across 10 workbooks. Purchase orders go to steel distributors
who have 2-6 week lead times depending on materials.

FORMAT: Show the 6 tracks as parallel swim lanes flowing left to right from
the trigger event. Use color coding: Blue = payment, Green = project setup,
Orange = procurement, Purple = budget, Red = risk management, Gray = CRM.
Show cross-lane connections where one track's output feeds another track.
```

---

## 7. PHASE 5 PROMPTS: BOM & Purchase Order Automation

### Prompt 5A: BOM Selection & PO Generation

```
ROLE: You are a supply chain automation specialist designing a Bill of Materials
and Purchase Order generation system for standardized metal building packages.

TASK: Create a flowchart showing how the correct BOM is selected from 100
configurations and transformed into a Purchase Order PDF that is automatically
emailed to the distributor.

BOM SELECTION LOGIC:
- Input: Building Type (Pole Barn or I-Beam) + Size + Eave Height
- Matrix: 2 types x 10 sizes x 5 heights = 100 unique BOMs
- Each BOM contains 28-32 line items across these categories:
  STRUCTURAL FRAME: Posts/columns, rafters, headers, base plates
  WALL SYSTEM: Girt channels, wall panels, corner trim
  ROOF SYSTEM: Purlins, ridge cap, roof panels, eave trim
  BRACING: Cross bracing, fly braces (14ft+), portal bracing (16ft+)
  HARDWARE: Tek screws, anchor bolts, DTI washers (16ft+)
  DOORS & ACCESSORIES: As configured by customer

BOM HEIGHT TIERS:
- 10-12ft: 28 line items (standard frame, basic bracing)
- 14ft: 30 line items (adds fly braces + flange brace sag rods)
- 16-20ft: 32 line items (adds portal frame bracing + DTI washers)

PO GENERATION FLOW:
1. Retrieve BOM from Airtable using [Type + Size + Height] lookup
2. Map each BOM line item to PO format:
   Item Code, Description, Qty, Unit, Specification
3. Add customer-specific items (doors, windows, concrete specs)
4. Calculate total material weight for shipping
5. Generate PO Number (format: PO-YYYY-XXXX auto-increment)
6. Populate PDF template:
   Header: 13|7 FrameWorks letterhead, PO number, date
   Ship-to: Customer property address
   Bill-to: Burnett Customs billing address
   Items: Full BOM line items with quantities
   Notes: Required delivery date, special instructions
7. n8n sends PO PDF to distributor email
8. Store PO in Airtable, link to Project record
9. Create delivery tracking record
10. Set follow-up task: "Confirm PO received" (24 hours)

CONTEXT: The 100 BOMs are stored in 10 Excel workbooks (one per building size)
with 10 tabs each. They will be migrated to Airtable for API access. All BOMs
carry a target 45% gross margin. Pole Barn costs run 3-10% higher than I-Beam.
Distributors include Mueller, Lynn, and others depending on availability.

FORMAT: Create a flowchart with the BOM selection decision tree on the left,
the PO assembly process in the center, and the output/delivery actions on
the right. Show the height tier decision as a branching diamond that adds
additional line items. Include sample data labels on key connections.
```

---

## 8. PHASE 6 PROMPTS: Project Management Dashboard

### Prompt 6A: Auto-Generated Project Management System

```
ROLE: You are a construction project management systems architect designing an
automated dashboard and checklist system for metal building construction projects.

TASK: Create a flowchart showing how the project management system is
automatically built when a contract is signed, including dashboards, checklists,
video tutorial integration, and quality control gates.

AUTO-GENERATED DASHBOARD COMPONENTS:
1. PROJECT OVERVIEW PANEL
   - Customer name, project address, contract value
   - Building specs: Type, Size, Height, Configuration
   - Key dates: Contract signed, materials ordered, projected start,
     projected completion
   - Current status with visual progress bar
   - Budget summary: Budgeted vs. Actual vs. Remaining

2. CONSTRUCTION PHASE CHECKLIST (Auto-generated per project)
   Phase 1: Site Preparation
   □ Site survey completed
   □ Permits obtained
   □ Utility locations marked
   □ Grade work completed
   □ Access road confirmed

   Phase 2: Foundation
   □ Concrete forms set (if slab option selected)
   □ Rebar placed and inspected
   □ Concrete poured and cured
   □ Anchor bolts set to spec
   □ Foundation inspection passed

   Phase 3: Structural Frame
   □ Posts/columns erected and plumbed
   □ Rafters/trusses installed
   □ Cross bracing installed
   □ Structural inspection passed

   Phase 4: Roof System
   □ Purlins installed
   □ Roof panels installed
   □ Ridge cap and flashing installed
   □ Roof inspection passed

   Phase 5: Wall System
   □ Girts installed
   □ Wall panels installed
   □ Corner trim and J-trim installed
   □ Doors installed and operational
   □ Windows installed (if applicable)

   Phase 6: Finishing
   □ Gutters installed (if selected)
   □ Insulation installed (if selected)
   □ Final trim and touch-up
   □ Site cleanup completed
   □ Final inspection passed
   □ Customer walkthrough completed

3. VIDEO TUTORIAL INTEGRATION
   - Each checklist item links to a video tutorial showing expected results
   - Videos uploaded by Burnett Customs showing proper installation
   - Supervisors reference videos before inspecting each phase
   - AI analysis of uploaded site photos compared against expected results
   - Green tag (approved) or Red tag (rework needed) per checklist item

4. QUALITY CONTROL GATES
   - Each phase must be "green tagged" before next phase begins
   - Green tag requires: All checklist items checked + supervisor sign-off
   - IF red tag: Create rework task, notify subcontractor, hold payment
   - Payment authorization tied to phase completion:
     Phase 1-2 complete → Release 25% mid-construction payment
     Phase 3-6 complete → Release 25% final payment
   - Photo documentation required at each gate

CONTEXT: This addresses the need to train Alicia (operations/PM) on quality
control. Bobby Chiumento (fractional PM with Six Sigma background) designed
this checklist approach. Each project is a metal building with predictable
construction phases, making standardized checklists highly effective. The
video tutorial approach ensures subcontractors know what "done right" looks
like before they start.

FORMAT: Show the dashboard as a wireframe layout at the top. Below it, show
the construction phases as a horizontal timeline with checklist items beneath
each phase. Show the quality gates as diamond decision points between phases.
Include the payment release triggers connected to gate approvals. Show the
video tutorial and AI analysis as supporting processes connected to each gate.
```

---

## 9. PHASE 7 PROMPTS: Weather & Risk Management

### Prompt 7A: Weather Integration & Automated Risk Response

```
ROLE: You are a risk management systems architect designing weather-aware
construction project monitoring with automated communication and timeline
adjustment capabilities.

TASK: Create a flowchart showing the complete weather monitoring and risk
management system that integrates with active construction projects to
automatically adjust timelines, update customers, and manage logistics.

WEATHER MONITORING SYSTEM:
1. API Integration: Weather API (OpenWeatherMap or similar)
   - Polls every 6 hours for each active project site
   - Checks: Temperature, precipitation, wind speed, severe weather alerts
   - 7-day forecast analysis for planning

2. RISK CLASSIFICATION ENGINE:
   GREEN (No Impact):
   - Clear skies, temps 40-100°F, wind <25mph
   - No action needed, construction proceeds as planned

   YELLOW (Monitor):
   - Rain probability >50%, temps 32-40°F, wind 25-35mph
   - Alert PM, review next 48-hour schedule
   - Prepare contingency communication template

   ORANGE (Delay Likely):
   - Active rain forecast, temps <32°F, wind 35-45mph
   - Auto-notify customer of potential delay
   - Adjust project timeline by estimated delay duration
   - Reschedule material deliveries if in transit

   RED (Work Stoppage - Force Majeure):
   - Severe weather alert (tornado, hurricane, ice storm)
   - Immediately halt all site work
   - Emergency notification to all parties
   - Document conditions for Force Majeure clause
   - Notify insurance if potential damage

3. AUTOMATED CUSTOMER COMMUNICATION:
   - AI generates weather update messages based on risk level
   - Channels: Text (SMS via Twilio), Email, Phone (via Vapi AI agent)
   - Message templates customized per risk level:
     YELLOW: "Hi [Name], we're monitoring weather conditions at your
     project site. We may see some rain this week but currently expect
     no impact to your timeline. We'll keep you posted."
     ORANGE: "Hi [Name], weather conditions will delay work at your
     project for approximately [X] days. Your new estimated completion
     date is [date]. We apologize for the inconvenience..."
     RED: "Hi [Name], severe weather conditions require us to
     temporarily halt work at your site for safety. We are monitoring
     conditions closely and will resume as soon as safe..."

4. LOGISTICS ADJUSTMENT:
   - IF delivery scheduled during weather event:
     Contact distributor to hold shipment
     Reschedule delivery for first clear day
     Update Airtable delivery tracking record
   - IF materials already on-site:
     Verify proper storage/protection
     Create task for PM to inspect after event
   - IF subcontractors scheduled:
     Notify all subcontractors of schedule change
     Reschedule through Airtable task system

5. SITE CONDITION MONITORING (Future Enhancement):
   - Camera integration for remote site monitoring
   - AI analysis of site photos for:
     Standing water, structural damage, material damage
     Safety hazards, access road conditions
   - Automated incident reports if damage detected
   - Photo comparison: pre-event vs post-event

CONTEXT: Burnett Customs operates in South Texas where weather events
(hurricanes, severe thunderstorms, heat waves) can significantly impact
construction schedules. The Force Majeure clause in the contract covers
weather delays, but proactive communication maintains customer trust.
This system replaces manual weather checking and phone calls with
automated monitoring and AI-generated communications.

FORMAT: Show the weather API at the top feeding into the risk classification
engine (4 color-coded paths). Each risk level branches to its specific
actions. Show the customer communication channel as a parallel process.
Show the logistics adjustment as a connected subprocess. Use the 4-color
risk scheme (green/yellow/orange/red) throughout. Include feedback loops
where conditions are re-evaluated daily.
```

---

## 10. PHASE 8 PROMPTS: Complete Data Architecture

### Prompt 8A: Airtable Database Schema

```
ROLE: You are a database architect designing the complete Airtable schema for
a construction company's project management and estimating system.

TASK: Create an Entity Relationship Diagram (ERD) showing all Airtable tables,
their key fields, and the relationships between them. The system has 10
interconnected tables:

TABLE 1: PROJECTS (Master Record)
- Project ID (auto-number, primary)
- Project Name (text)
- Status (select: Lead, Estimating, Quoted, Contract Sent, Signed,
  In Progress, Completed, Cancelled)
- Client (linked → Clients table)
- Building Type (select: Pole Barn, Carport, Bolt-Up)
- Building Size (select: 30x40 through 60x100)
- Eave Height (select: 10, 12, 14, 16, 20)
- Contract Value (currency)
- BOM (linked → BOM Items table, one-to-many)
- Estimate (linked → Estimates table)
- Contract PDF (attachment)
- Rendering Image (attachment, from fal.ai)
- Pipedrive Deal ID (text, for sync)
- Project Manager (linked → Team table)
- Sales Rep (linked → Team table)
- Projected Start Date (date)
- Projected Completion Date (date)
- Actual Start Date (date)
- Actual Completion Date (date)

TABLE 2: CLIENTS
- Client ID (auto-number)
- Name (text, primary)
- Email (email)
- Phone (phone)
- Address (text)
- City, State, ZIP (text fields)
- Projects (linked → Projects, one-to-many)
- Total Revenue (rollup: sum of Project contract values)
- Pipedrive Person ID (text)

TABLE 3: ESTIMATES
- Estimate ID (auto-number)
- Project (linked → Projects)
- Base Price (currency)
- Add-Ons Total (currency)
- Concrete Total (currency)
- Grand Total (currency)
- Configuration JSON (long text: full selections)
- Created Date (date)
- Status (select: Draft, Sent, Accepted, Expired)
- PDF URL (url)

TABLE 4: BOM ITEMS
- Item ID (auto-number)
- Project (linked → Projects)
- Category (select: Structural, Roof, Walls, Bracing, Hardware, Doors)
- Description (text, primary)
- Quantity (number)
- Unit (select: ea, lf, sqft, set)
- Unit Cost (currency)
- Total Cost (formula: Qty x Unit Cost)
- Selling Price (formula: Unit Cost / 0.55 for 45% margin)
- Supplier (linked → Suppliers table)
- Lead Time Days (number)

TABLE 5: PURCHASE ORDERS
- PO Number (auto-number, format: PO-2026-XXXX)
- Project (linked → Projects)
- Supplier (linked → Suppliers)
- Order Date (date)
- Required Delivery Date (date)
- Status (select: Draft, Sent, Confirmed, Shipped, Delivered)
- Total Amount (rollup: sum of PO line items)
- PDF (attachment)

TABLE 6: SUPPLIERS
- Name (text, primary)
- Contact Email (email)
- Contact Phone (phone)
- Address (text)
- Standard Lead Time (number, days)
- Products (multiple select)

TABLE 7: BUDGET TRACKING
- Project (linked → Projects)
- Category (select: matches BOM categories)
- Budgeted Amount (currency)
- Actual Amount (currency)
- Variance (formula: Actual - Budgeted)
- Variance % (formula: Variance / Budgeted x 100)

TABLE 8: CONSTRUCTION CHECKLIST
- Project (linked → Projects)
- Phase (select: Site Prep, Foundation, Structural, Roof, Walls, Finishing)
- Task (text)
- Status (select: Not Started, In Progress, Complete, Rework Needed)
- Assigned To (linked → Team)
- Video Tutorial URL (url)
- Completion Photo (attachment)
- Green Tag (checkbox)
- Signed Off By (linked → Team)
- Completion Date (date)

TABLE 9: TEAM MEMBERS
- Name (text, primary)
- Role (select: Owner, Sales, PM, Estimator, Supervisor)
- Email (email)
- Phone (phone)
- Active (checkbox)

TABLE 10: ACTIVITY LOG
- Project (linked → Projects)
- Type (select: Status Change, Communication, Payment, Inspection, Delivery)
- Description (text)
- Date (date with time)
- Created By (linked → Team)
- Notes (long text)

RELATIONSHIPS:
- Projects ← one-to-many → BOM Items
- Projects ← one-to-many → Purchase Orders
- Projects ← one-to-many → Budget Tracking
- Projects ← one-to-many → Construction Checklist
- Projects ← one-to-many → Activity Log
- Projects ← many-to-one → Clients
- Projects ← many-to-one → Team (PM)
- Projects ← many-to-one → Team (Sales)
- BOM Items ← many-to-one → Suppliers
- Purchase Orders ← many-to-one → Suppliers

FORMAT: Create an ERD with each table as a box showing the table name and
key fields. Draw relationship lines between tables with cardinality notation
(1:N, M:1). Color-code tables by function: Blue = customer-facing data,
Green = operations data, Orange = financial data, Purple = team data.
```

---

## 11. PHASE 9 PROMPTS: n8n Workflow Architecture

### Prompt 9A: Complete n8n Workflow Map

```
ROLE: You are an automation architect mapping all n8n workflows needed for the
BC-Bid Titan system, showing triggers, nodes, and connections between workflows.

TASK: Create a diagram showing all 8 n8n workflows, their trigger conditions,
key processing nodes, and output actions. Show how workflows connect to each
other and to external systems.

WORKFLOW 1: "New Estimate → Airtable + CRM"
- Trigger: Webhook from React estimating app
- Nodes: Create Airtable Estimate record → Create/Update Pipedrive Deal
  → Send confirmation email to customer → Create follow-up task
- Output: Estimate ID returned to app

WORKFLOW 2: "AI Building Rendering"
- Trigger: Webhook from React app (Generate Preview button)
- Nodes: Build fal.ai prompt → Call fal.ai Flux Dev API → Download image
  → Upload to Google Drive → Update Airtable with image URL → Return
  image URL to app
- Error: Retry 3x → fallback to placeholder image

WORKFLOW 3: "Contract Signed → Full Automation"
- Trigger: Airtable automation (Status changed to "Signed")
- Nodes: Fetch project details → Update Pipedrive stage → Generate PO PDF
  → Email PO to supplier → Create Budget Tracking records → Create
  Checklist items → Create delivery tracking → Send customer welcome email
- Output: 6 parallel tracks executed

WORKFLOW 4: "PO Generation & Email"
- Trigger: Called by Workflow 3 (sub-workflow)
- Nodes: Fetch BOM from Airtable → Map to PO format → Generate PDF
  → Email to distributor → Store PDF in Airtable → Create confirmation task
- Output: PO Number and PDF URL

WORKFLOW 5: "Payment Processing"
- Trigger: Webhook from payment processor
- Nodes: Validate payment → Update Airtable payment status → Update
  Pipedrive → Send receipt email → IF deposit complete → trigger Workflow 3
- Error: Payment failed → notify sales rep → retry instructions to customer

WORKFLOW 6: "Weather Monitoring"
- Trigger: Cron schedule (every 6 hours)
- Nodes: Fetch active projects from Airtable → For each: call Weather API
  → Classify risk level → IF Yellow/Orange/Red: generate AI communication
  → Send via appropriate channel → Update project timeline → Log activity
- Output: Risk assessments stored in Airtable

WORKFLOW 7: "Automated Follow-Up Cadence"
- Trigger: Cron schedule (daily at 9am)
- Nodes: Query Airtable for estimates with Status="Quoted" → Filter by
  days since sent (3, 7, 14) → Generate personalized follow-up message
  → Send email/text → Create Pipedrive activity → Update follow-up count
- Output: Follow-ups sent, activities logged

WORKFLOW 8: "Customer Communication Hub"
- Trigger: Airtable automation (milestone status change)
- Nodes: Determine communication type (milestone update, delay notice,
  completion notice) → Generate AI message using GPT → Select channel
  (email, SMS, phone) → Send → Log in Activity Log
- Output: Customer notified, activity recorded

CONTEXT: These 8 workflows form the automation backbone of BC-Bid Titan.
They replace manual processes that currently lose leads, delay follow-ups,
and create inconsistent customer experiences. n8n is self-hosted for data
control. All workflows log errors to a central Error Log table in Airtable
for monitoring.

FORMAT: Show each workflow as a horizontal lane with trigger on the left,
processing nodes in the middle, and outputs on the right. Stack workflows
vertically. Draw dotted arrows between workflows showing where one triggers
or feeds another. Color-code by function: Blue = customer data, Green =
documents, Orange = payments, Purple = communications, Red = monitoring.
Include the external system icons (Airtable, Pipedrive, fal.ai, Gmail,
Weather API, Twilio) connected to the relevant workflow nodes.
```

---

## 12. PHASE 10 PROMPTS: Pipedrive CRM Pipeline

### Prompt 10A: Sales Pipeline & Automation

```
ROLE: You are a CRM architect designing the complete Pipedrive sales pipeline
for a construction company that handles 30 leads per month with a target of
10 paying customers.

TASK: Create a flowchart showing the 8-stage Pipedrive pipeline with automation
triggers, required activities per stage, and integration touchpoints with
Airtable and n8n.

PIPELINE STAGES:

STAGE 1: "Lead Qualified" (Probability: 10%)
- Entry: Website form, phone inquiry, referral
- Required activities: Initial call within 24 hours
- Automation: Assign to sales rep by territory
- Airtable: Create Project record (Status: Lead)
- Exit criteria: Discovery meeting scheduled

STAGE 2: "Discovery Completed" (Probability: 25%)
- Entry: Initial call completed, needs identified
- Required activities: Site visit or detailed spec collection
- Automation: Create "Schedule Site Visit" task
- Airtable: Update with building specs
- Exit criteria: Specifications documented, ready for estimate

STAGE 3: "Estimate Prepared" (Probability: 40%)
- Entry: Specs collected, estimate generated in app
- Required activities: Estimate reviewed internally
- Automation: n8n Workflow 1 creates estimate + rendering
- Airtable: Estimate record linked, rendering generated
- Exit criteria: Estimate approved, ready to present

STAGE 4: "Proposal Sent" (Probability: 50%)
- Entry: Estimate presented to customer
- Required activities: Present estimate in person or send PDF
- Automation: Start 3-7-14 day follow-up cadence (Workflow 7)
- Airtable: Status = "Quoted"
- Exit criteria: Customer responds with feedback

STAGE 5: "Negotiation" (Probability: 65%)
- Entry: Customer engaged, discussing terms/pricing
- Required activities: Handle objections, revise if needed
- Automation: Track revision count, alert if >3 revisions
- Airtable: Log revision history
- Exit criteria: Terms agreed, ready for contract

STAGE 6: "Contract Sent" (Probability: 80%)
- Entry: Customer agrees to proceed
- Required activities: Walk through contract in person
- Automation: Generate contract, track signing progress
- Airtable: Status = "Contract Sent"
- Exit criteria: Contract fully executed

STAGE 7: "Contract Signed" (Probability: 95%)
- Entry: Both parties signed
- Required activities: Collect deposit payment
- Automation: Trigger Workflow 3 (full post-contract automation)
- Airtable: Status = "Signed", trigger all downstream processes
- Exit criteria: Deposit received

STAGE 8: "Project Execution" (Probability: 100%)
- Entry: Payment received, project active
- Required activities: Monthly check-in, milestone tracking
- Automation: Weather monitoring, budget tracking, customer updates
- Airtable: Status = "In Progress"
- Exit criteria: Project completed, final payment received

LOST DEAL HANDLING:
- At any stage, deal can be marked "Lost"
- Require loss reason (select: Price, Timeline, Competitor,
  Changed Mind, No Response, Other)
- Automation: Log loss reason → Create "win-back" task at 90 days
  → Monthly lost deal analysis report

CONTEXT: Burnett Customs currently has no CRM. Michaela (sales) needs
structure. Steve Sala (fractional CRO) coaches her twice weekly using
pipeline data. Target: 30 leads/month, 10 closed deals. Average deal
$26,500-$105,000 depending on building size. Sales cycle: 2-6 weeks.

FORMAT: Show the 8 stages as a horizontal pipeline flowing left to right
with probability percentages. Below each stage, show required activities
and automation triggers. Show Airtable sync points as downward arrows.
Show the "Lost Deal" path branching down from each stage. Include the
win-back loop returning from Lost back to Stage 1 after 90 days.
```

---

## 13. WIREFRAME PROMPTS FOR KEY UI SCREENS

### Prompt 13A: Estimating App Home Screen

```
ROLE: You are a UI/UX designer creating wireframes for a tablet-first
construction estimating application.

TASK: Create a wireframe for the Building Type Selection screen (Step 2 of
the estimating app). This is the first major selection screen after customer
info entry.

LAYOUT:
- Header: 13|7 FrameWorks logo (left), Step indicator "Step 2 of 6" (right)
- Title: "Select Your Building Type"
- Subtitle: "Choose the construction method that fits your needs"

THREE CARDS (equal width, horizontal on tablet, stacked on mobile):
Card 1: POLE BARN
- Icon: Simple barn silhouette
- Title: "Pole Barn"
- Subtitle: "Weld-Up Construction"
- Description: "Our most popular option. Pre-priced packages for quick
  estimates. Perfect for farm storage, workshops, and equipment shelter."
- Badge: "Starting at $18,500"
- Button: "Select Pole Barn"

Card 2: CARPORT
- Icon: Carport silhouette
- Title: "Carport"
- Subtitle: "Open-Side Protection"
- Description: "Cost-effective vehicle and equipment coverage.
  Pre-priced packages with standardized configurations."
- Badge: "Starting at $12,500"
- Button: "Select Carport"

Card 3: BOLT-UP CONSTRUCTION
- Icon: Industrial building silhouette
- Title: "Bolt-Up"
- Subtitle: "Engineered Steel Frame"
- Description: "Heavy-duty engineered buildings. Custom pricing based on
  wind zone, snow load, and specific engineering requirements."
- Badge: "Custom Quote"
- Button: "Request Custom Quote"

FOOTER: Navigation — [← Back] [Next →]

CONTEXT: Used by sales reps on tablets during in-person meetings with
farm/ranch customers. Touch-friendly with 44px minimum tap targets.
Brand colors: black, navy blue, turquoise. Clean, professional look.

FORMAT: Create a wireframe with boxes representing each UI element.
Show the responsive layout for both tablet (landscape) and mobile
(portrait) views. Annotate touch targets and spacing.
```

### Prompt 13B: Estimate Summary Screen

```
ROLE: You are a UI/UX designer creating a wireframe for the estimate review
and action screen of a construction sales application.

TASK: Create a wireframe for the Estimate Summary screen (Step 8) showing the
complete building configuration, itemized pricing, AI-generated rendering,
and the three critical action buttons.

LAYOUT (Tablet Landscape):
LEFT COLUMN (60%):
- Section: "Your Building Configuration"
  Row: Building Type | Size | Eave Height
  Row: Doors (qty, type, placement per wall)
  Row: Add-Ons (gutters, insulation, windows, concrete)
  Row: Colors (roof, walls, trim — show color swatches)

- Section: "2D Floor Plan"
  Aerial view diagram showing building footprint with door placements
  Dimension lines showing width x length
  Wall labels (Front, Back, Left, Right)
  Color-coded legend (Orange = Walk Doors, Teal = Roll-Up Doors)

RIGHT COLUMN (40%):
- AI-Generated Building Rendering (from fal.ai)
  Photorealistic image of the configured building
  Caption: "AI-Generated Preview — Actual building may vary"

- Section: "Price Breakdown"
  Base Package: $XX,XXX
  Roll-Up Doors (x2): $X,XXX
  Walk Door: $XXX
  Gutters: $X,XXX
  Insulation: $X,XXX
  Concrete Slab: $X,XXX
  ─────────────────
  TOTAL: $XX,XXX
  Deposit (50%): $XX,XXX

- THREE ACTION BUTTONS (stacked, full width):
  [SAVE ESTIMATE] — Blue outline, saves to Airtable/CRM
  [MODIFY SELECTIONS] — Gray, returns to step selector
  [PROCEED TO CONTRACT →] — Solid turquoise, large, prominent

CONTEXT: This is the critical decision point. The customer sees everything
they selected, the realistic rendering of their building, and the total
price. The "Proceed to Contract" button must be the most visually prominent.
"Save Estimate" is for customers who need time to decide (triggers automated
follow-up sequence).

FORMAT: Create a detailed wireframe showing the two-column layout with all
sections labeled. Show the button hierarchy with the CTA button being the
largest and most prominent. Include responsive notes for mobile view.
```

---

## 14. FAL.AI IMAGE GENERATION PROMPT TEMPLATES

These prompt templates are used inside the n8n workflow (Workflow 2) to generate
realistic building renderings. Variables in {brackets} are replaced with actual
customer selections.

### Template 1: Exterior Front View (Primary)

```
Photorealistic architectural photograph of a {building_type} metal building,
{width} feet wide by {length} feet long with {eave_height} foot eave height,
3:12 gable roof pitch. {roof_color} standing seam metal roof panels,
{wall_color} ribbed metal wall panels, {trim_color} aluminum trim on all
corners, fascia, and door frames. {door_description}. Building sits on a
{foundation_type} on flat Texas rural farmland with native grass, scattered
mesquite trees, and a dirt access road. Clear blue sky with wispy clouds,
golden hour side lighting casting soft shadows. Shot from a 3/4 front angle
at eye level showing the front and right side walls. Professional architectural
photography, high resolution, sharp detail on metal panel ribbing and
fastener lines. No people, no vehicles, no text overlays.
```

### Template 2: Exterior Rear/Side View (Secondary)

```
Photorealistic architectural photograph showing the rear and left side of a
{building_type} metal building, {width} feet wide by {length} feet long,
{eave_height} foot eave walls, 3:12 symmetrical gable roof. {roof_color}
metal roof, {wall_color} corrugated steel wall panels, {trim_color} trim.
{rear_door_description}. Rural Texas ranch setting with post-and-wire
fencing in background, flat terrain, dry native grass. Overcast professional
lighting for even exposure with no harsh shadows. Shot from 3/4 rear angle
at eye level. Architectural documentation style, high resolution, realistic
material textures visible on metal surfaces.
```

### Template 3: Interior View (Optional Enhancement)

```
Photorealistic interior photograph of a {width} by {length} foot metal building
with {eave_height} foot clear height to eave. Exposed {building_type} structural
frame with metal purlins and girts visible. {roof_color} metal roof underside
with natural light entering through {door_count} open roll-up doors on the
{door_wall} wall. Concrete slab floor with control joints visible. Clean,
empty interior showing the full clear span. Wide-angle lens perspective from
one corner showing depth and scale. Professional real estate photography style,
bright and well-lit, high resolution.
```

---

## 15. IMPLEMENTATION SEQUENCE & DEPENDENCIES

### Prompt 15A: Development Roadmap Gantt Chart

```
ROLE: You are a technical project manager creating a development timeline for
a multi-system construction technology platform.

TASK: Create a Gantt-style timeline showing the implementation sequence for all
BC-Bid Titan components over a 12-week development period. Show dependencies
between components and highlight the critical path.

WEEK 1-2: FOUNDATION
- Airtable database schema setup (all 10 tables)
- Airtable BOM migration (100 configurations from Excel)
- Pipedrive CRM pipeline setup (8 stages + automations)
- Dependencies: None (can all run in parallel)

WEEK 2-3: CORE ESTIMATING
- React estimating app — Steps 1-4 (Customer Info, Building Type, Size, Height)
- Airtable price matrix population
- Pipedrive ↔ Airtable sync via n8n (Workflow 1)
- Dependencies: Airtable schema must be complete

WEEK 3-4: ESTIMATING COMPLETION
- React estimating app — Steps 5-8 (Doors, Add-ons, Colors, Review)
- Real-time pricing engine connected to Airtable
- fal.ai integration (n8n Workflow 2 — image generation)
- Dependencies: Price matrix must be populated

WEEK 4-5: CONTRACT SYSTEM
- Contract wizard (8 sections with acknowledgment flow)
- Signature pad components (touch + mouse)
- Contract PDF generation
- Dependencies: Estimating app must be functional

WEEK 5-6: POST-CONTRACT AUTOMATION
- n8n Workflow 3 (Contract Signed → full automation)
- PO generation workflow (Workflow 4)
- Budget tracking setup in Airtable
- Dependencies: Contract system must be complete

WEEK 6-7: PAYMENT & COMMUNICATION
- Payment processing integration (Workflow 5)
- Automated follow-up cadence (Workflow 7)
- Customer communication hub (Workflow 8)
- Dependencies: Workflows 1-4 must be operational

WEEK 7-8: PROJECT MANAGEMENT
- Auto-generated dashboard and checklists
- Quality control gates with video tutorial links
- Material delivery tracking
- Dependencies: Post-contract automation must work

WEEK 8-9: WEATHER & RISK
- Weather API integration (Workflow 6)
- Risk classification engine
- AI-generated communications (Twilio + Vapi)
- Automated timeline adjustments
- Dependencies: Project management system must be built

WEEK 9-10: INTEGRATION TESTING
- End-to-end flow testing (estimate → contract → project)
- Cross-system data validation (Airtable ↔ Pipedrive ↔ n8n)
- Mobile/tablet testing on actual devices
- Load testing with concurrent users
- Dependencies: All systems must be individually complete

WEEK 10-11: UAT & TRAINING
- User acceptance testing with Bobby and Michaela
- Sales training on estimating app + CRM
- PM training on dashboards + checklists (Alicia)
- Refinement based on user feedback
- Dependencies: Integration testing passed

WEEK 12: LAUNCH
- Production deployment
- Monitoring setup
- Support documentation
- Go-live with first real customer
- Dependencies: UAT completed and approved

CRITICAL PATH: Airtable Schema → Estimating App → Contract System →
Post-Contract Automation → Project Management → Weather Integration

CONTEXT: Development team is Mingma Inc. with Josh Meunier (lead),
Katarina Meunier (developer), Bobby Chiumento (PM), and Steve Sala (CRO).
Some weeks have parallel tracks. The estimating app already has a working
prototype on GitHub Pages that needs enhancement, not a full rebuild.

FORMAT: Create a horizontal Gantt chart with weeks across the top and
components listed vertically on the left. Show each component as a
horizontal bar spanning its development weeks. Draw dependency arrows
between bars. Highlight the critical path in red. Show parallel tracks
where components can be developed simultaneously.
```

---

## APPENDIX A: MIRO STYLING GUIDE

Apply these consistent styles across all Miro diagrams:

**Color Palette:**
- Customer Actions: #3B82F6 (Blue)
- System Automations: #10B981 (Green)
- Decision Points: #F59E0B (Orange/Amber)
- Error/Risk Paths: #EF4444 (Red)
- Integrations: #8B5CF6 (Purple)
- Data Storage: #6B7280 (Gray)
- Financial: #F97316 (Orange)

**Shape Standards:**
- Process Steps: Rounded rectangles
- Decisions: Diamonds
- Start/End: Stadium shapes (rounded ends)
- Data Stores: Cylinders
- External Systems: Cloud shapes
- Manual Processes: Trapezoids

**Typography:**
- Titles: Bold, 24pt
- Process labels: Regular, 14pt
- Annotations: Italic, 11pt
- All text: Dark gray (#1F2937)

**Connector Styles:**
- Primary flow: Solid arrows, 2pt, dark gray
- Secondary flow: Dashed arrows, 1pt, gray
- Error paths: Solid arrows, 2pt, red
- Data flow: Dotted arrows, 1pt, purple

---

## APPENDIX B: PROMPT EXECUTION ORDER

For best results, execute the Miro AI prompts in this order:

1. **System Architecture Overview** (Section 1) — Creates the master view
2. **Board Organization** (Section 2) — Sets up the frame structure
3. **Estimating Flow** (Section 3, Prompt 1A) — Core customer journey
4. **Pricing Data Flow** (Section 3, Prompt 1B) — How prices calculate
5. **AI Image Pipeline** (Section 4) — fal.ai rendering workflow
6. **Contract Signing** (Section 5) — Legal agreement flow
7. **Post-Contract Automation** (Section 6) — Payment + 6 parallel tracks
8. **BOM & PO Generation** (Section 7) — Supply chain automation
9. **Project Management** (Section 8) — Dashboards and checklists
10. **Weather & Risk** (Section 9) — Monitoring and communication
11. **Airtable ERD** (Section 10) — Database architecture
12. **n8n Workflow Map** (Section 11) — All 8 automation workflows
13. **Pipedrive Pipeline** (Section 12) — CRM stages and automations
14. **Wireframes** (Section 13) — Key UI screens
15. **Development Timeline** (Section 15) — Gantt chart with dependencies

After generating all diagrams, connect them with inter-frame arrows in Miro
to show the complete system flow.

---

## APPENDIX C: KEY METRICS & SPECIFICATIONS

**Building Configurations:** 100 total (10 sizes x 5 heights x 2 types)
**BOM Line Items:** 28-32 per configuration (height-dependent)
**Total BOM Formulas:** 12,600 across 10 workbooks
**Target Margin:** 45% gross across all line items
**Price Range:** ~$18,500 (30x40 Pole Barn) to ~$105,000 (60x100 I-Beam 20ft)
**Height Premium:** +$0 (10ft) to +$12,000 (20ft)
**Monthly Lead Volume:** 30 leads, 10 paying customers target
**Sales Cycle:** 2-6 weeks average
**Payment Schedule:** 50% deposit / 25% mid-construction / 25% final
**Contract Sections:** 8 (7 with acknowledgment + final signatures)
**n8n Workflows:** 8 automated workflows
**Pipedrive Stages:** 8 pipeline stages
**Airtable Tables:** 10 interconnected tables

---

*Document prepared by Mingma Inc. Systems Architecture Team*
*For internal development use — BC-Bid Titan MVP Sprint*
*February 16, 2026*
