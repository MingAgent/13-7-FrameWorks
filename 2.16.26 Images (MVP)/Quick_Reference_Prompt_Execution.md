# BC-Bid Titan: Quick Reference — Prompt Execution Checklist

## How to Execute These Prompts in Miro

### Step 1: Open Miro Board
Create a new Miro board named **"BC-Bid Titan — System Architecture MVP"**

### Step 2: Open the Master Prompt Guide
Reference: `BC-BidTitan_Master_Prompt_Guide.md` in this same folder

### Step 3: Execute Prompts in Order

Copy each prompt into **Miro AI Sidekick** (the AI assistant panel in Miro).
Wait for generation, then style and arrange before moving to the next.

---

## EXECUTION CHECKLIST

### Round 1: Big Picture (Do First)
- [ ] **Prompt: System Architecture Overview** (Section 1)
  → Creates the 6-subsystem master view
  → Place at TOP CENTER of board

- [ ] **Prompt: Board Organization** (Section 2)
  → Creates 10 labeled frames
  → Arrange in 2x5 grid below master view

### Round 2: Customer Journey (Left to Right)
- [ ] **Prompt 1A: Estimating App Flow** (Section 3)
  → 9-step customer journey with branches
  → Place in Frame 1

- [ ] **Prompt 1B: Pricing Data Flow** (Section 3)
  → How prices calculate in real-time
  → Place below Prompt 1A in Frame 1

- [ ] **Prompt 2A: AI Image Generation** (Section 4)
  → fal.ai rendering pipeline
  → Place in Frame 2

- [ ] **Prompt 3A: Contract Signing** (Section 5)
  → 8-section legal agreement flow
  → Place in Frame 3

- [ ] **Prompt 4A: Payment & Post-Contract** (Section 6)
  → 6 parallel automation tracks
  → Place in Frame 4-5

### Round 3: Backend Systems
- [ ] **Prompt 5A: BOM & PO Generation** (Section 7)
  → Supply chain automation
  → Place in Frame 5

- [ ] **Prompt 6A: Project Management** (Section 8)
  → Dashboards, checklists, QC gates
  → Place in Frame 9

- [ ] **Prompt 7A: Weather & Risk** (Section 9)
  → 4-level risk classification
  → Place in Frame 10

### Round 4: Data & Integration Architecture
- [ ] **Prompt 8A: Airtable ERD** (Section 10)
  → 10-table database schema
  → Place in Frame 6

- [ ] **Prompt 9A: n8n Workflow Map** (Section 11)
  → All 8 automation workflows
  → Place in Frame 7

- [ ] **Prompt 10A: Pipedrive Pipeline** (Section 12)
  → 8-stage CRM pipeline
  → Place in Frame 8

### Round 5: UI & Timeline
- [ ] **Prompt 13A: Building Type Screen** (Section 13)
  → Wireframe for key selection screen
  → Place in a new "UI Wireframes" frame

- [ ] **Prompt 13B: Estimate Summary Screen** (Section 13)
  → Wireframe for review/action screen
  → Place next to 13A

- [ ] **Prompt 15A: Development Timeline** (Section 15)
  → 12-week Gantt chart
  → Place at BOTTOM of board spanning full width

### Round 6: Connect Everything
- [ ] Draw arrows between frames showing system flow
- [ ] Apply consistent color coding (see Appendix A)
- [ ] Add legend frame in top-right corner
- [ ] Review all diagrams for completeness

---

## COLOR CODE REFERENCE

| Color | Hex | Use For |
|-------|-----|---------|
| Blue | #3B82F6 | Customer actions / inputs |
| Green | #10B981 | System automations |
| Orange | #F59E0B | Decision points |
| Red | #EF4444 | Errors / Risk paths |
| Purple | #8B5CF6 | External integrations |
| Gray | #6B7280 | Data storage |

---

## PLATFORM QUICK LINKS

| Platform | Purpose | Key Integration |
|----------|---------|-----------------|
| **Miro** | Flowcharts & wireframes | AI Sidekick for generation |
| **Airtable** | Central database (10 tables) | n8n API integration |
| **n8n** | Workflow automation (8 workflows) | Connects all systems |
| **fal.ai** | AI building renderings | Called via n8n HTTP node |
| **Pipedrive** | CRM (8-stage pipeline) | Bi-directional Airtable sync |
| **React/Vite** | Estimating web app | GitHub Pages deployment |
| **Twilio/Vapi** | SMS + AI phone agent | Customer communications |

---

*Total prompts to execute: 16*
*Estimated time: 2-3 hours for full board generation and styling*
