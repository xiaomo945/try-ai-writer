import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getActivePromotions,
  getBestPromotion,
  calculateDiscountedPrice,
  usePromotion,
} from "@/lib/conversion/promotion-service";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const best = searchParams.get("best");

    if (code) {
      const price = parseFloat(searchParams.get("price") || "99");
      const result = await calculateDiscountedPrice(price, code);
      if (!result) {
        return NextResponse.json(
          { error: "Invalid promo code" },
          { status: 400 }
        );
      }
      return NextResponse.json(result);
    }

    if (best === "true") {
      const promo = await getBestPromotion();
      return NextResponse.json({ promotion: promo });
    }

    const promotions = await getActivePromotions();
    return NextResponse.json({ promotions });
  } catch (error) {
    console.error("Get promotions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    const success = await usePromotion(code);
    if (!success) {
      return NextResponse.json(
        { error: "Invalid promo code" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Use promotion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
