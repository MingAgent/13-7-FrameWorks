/**
 * planService.ts — Local Plan Generation Service Client
 * 13|7 FRAMEWORKS — Bid Titan
 *
 * Communicates with the local Python plan generation server (plan_server.py)
 * to generate professional construction plans.
 *
 * The server runs on Josh's Mac at localhost:5137.
 * If the server isn't running, functions return null gracefully —
 * the contract falls back to the basic JS-generated plans.
 */

const PLAN_SERVER_URL = 'http://localhost:5137';

// ── Types ───────────────────────────────────────────────────────────────────

export interface PlanPage {
  image_b64: string;
  width: number;
  height: number;
}

export interface PlanSheet {
  code: string;
  name: string;
  status: 'PASS' | 'FAIL';
  pages?: PlanPage[];
  pdf_b64?: string;
  error?: string;
}

export interface PlanGenerationResult {
  success: boolean;
  building: {
    type: string;
    width: number;
    length: number;
    height: number;
    projectNumber: string;
  };
  customer: string;
  generated_at: string;
  total: number;
  passed: number;
  failed: number;
  sheets: PlanSheet[];
}

export interface PlanServerHealth {
  status: string;
  service: string;
  version: string;
  has_pymupdf: boolean;
  timestamp: string;
}

// ── Server Status ───────────────────────────────────────────────────────────

/**
 * Check if the local plan server is running.
 * Returns health info or null if unreachable.
 */
export async function checkPlanServer(): Promise<PlanServerHealth | null> {
  try {
    const response = await fetch(`${PLAN_SERVER_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if the plan server is available (quick boolean check).
 */
export async function isPlanServerAvailable(): Promise<boolean> {
  const health = await checkPlanServer();
  return health !== null && health.status === 'ok';
}

// ── Plan Generation ─────────────────────────────────────────────────────────

/**
 * Generate construction plans by sending building config to the local server.
 *
 * @param buildingConfig - Building configuration from the estimator store
 * @param customerConfig - Customer information
 * @returns Plan generation result with base64-encoded sheet images, or null if server unavailable
 */
export async function generatePlans(
  buildingConfig: {
    buildingType: string;
    width: number;
    length: number;
    height: number;
  },
  customerConfig: {
    name: string;
    constructionAddress?: {
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
  }
): Promise<PlanGenerationResult | null> {
  try {
    const response = await fetch(`${PLAN_SERVER_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        building: {
          buildingType: buildingConfig.buildingType,
          width: buildingConfig.width,
          length: buildingConfig.length,
          height: buildingConfig.height,
        },
        customer: {
          name: customerConfig.name,
          constructionAddress: customerConfig.constructionAddress || {},
        },
      }),
      // 2 minute timeout for generation (9 sheets can take a bit)
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Plan generation failed:', errorData);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Plan server error:', error);
    return null;
  }
}

// ── Plan Image Helpers ──────────────────────────────────────────────────────

/**
 * Get all successfully generated plan page images as data URLs.
 * Ready to embed directly into jsPDF with doc.addImage().
 */
export function getPlanImageDataUrls(result: PlanGenerationResult): Array<{
  code: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}> {
  const images: Array<{
    code: string;
    name: string;
    dataUrl: string;
    width: number;
    height: number;
  }> = [];

  for (const sheet of result.sheets) {
    if (sheet.status !== 'PASS' || !sheet.pages) continue;

    for (const page of sheet.pages) {
      images.push({
        code: sheet.code,
        name: sheet.name,
        dataUrl: `data:image/png;base64,${page.image_b64}`,
        width: page.width,
        height: page.height,
      });
    }
  }

  return images;
}
