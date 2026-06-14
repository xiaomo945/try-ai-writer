import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");

  if (!type) {
    return NextResponse.json(
      { error: "Missing type parameter" },
      { status: 400 }
    );
  }

  const validTypes = ["ab-tests", "analytics", "web-vitals"];
  if (!validTypes.includes(type)) {
    return NextResponse.json(
      { error: `Invalid type. Must be one of: ${validTypes.join(", ")}` },
      { status: 400 }
    );
  }

  // Return mock data structure for each type
  // In a real implementation, this would fetch from database or analytics service
  const responseData = getMockData(type);

  return NextResponse.json(responseData, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      "CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      "Vercel-CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}

function getMockData(type: string): Record<string, unknown> {
  const timestamp = new Date().toISOString();

  switch (type) {
    case "ab-tests":
      return {
        type: "ab-tests",
        timestamp,
        tests: [
          {
            id: "test-1",
            name: "Homepage CTA Test",
            status: "running",
            variants: [
              { id: "control", name: "Control", conversionRate: 12.5, participants: 1000 },
              { id: "variant-a", name: "Variant A", conversionRate: 15.2, participants: 1000 },
            ],
            statisticalSignificance: 0.034,
          },
        ],
      };

    case "analytics":
      return {
        type: "analytics",
        timestamp,
        events: {
          totalEvents: 15420,
          pageViews: 8930,
          conversions: 234,
        },
        funnels: [
          {
            id: "signup-funnel",
            name: "Signup Funnel",
            steps: [
              { name: "Landing", users: 1000, conversionRate: 100 },
              { name: "Signup Form", users: 450, conversionRate: 45 },
              { name: "Email Verified", users: 380, conversionRate: 84.4 },
              { name: "First Action", users: 234, conversionRate: 61.6 },
            ],
          },
        ],
      };

    case "web-vitals":
      return {
        type: "web-vitals",
        timestamp,
        metrics: {
          fcp: 1200,
          lcp: 2400,
          fid: 80,
          cls: 0.05,
          ttfb: 450,
          inp: 120,
        },
        thresholds: {
          fcp: { good: 1800, needsImprovement: 3000 },
          lcp: { good: 2500, needsImprovement: 4000 },
          fid: { good: 100, needsImprovement: 300 },
          cls: { good: 0.1, needsImprovement: 0.25 },
          ttfb: { good: 800, needsImprovement: 1800 },
          inp: { good: 200, needsImprovement: 500 },
        },
      };

    default:
      return { error: "Unknown type" };
  }
}
