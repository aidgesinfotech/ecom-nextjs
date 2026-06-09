import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { DEFAULT_POLICIES, type Policies } from "@/lib/policy-defaults";
import { getPolicies, savePolicies } from "@/lib/policies";

export async function GET() {
  try {
    const policies = await getPolicies();
    return NextResponse.json(
      { policies },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ policies: DEFAULT_POLICIES });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const current = await getPolicies();

    const next: Policies = {
      privacy: String(body.privacy ?? current.privacy),
      shipping: String(body.shipping ?? current.shipping),
      returnRefund: String(body.returnRefund ?? current.returnRefund),
      terms: String(body.terms ?? current.terms),
    };

    await savePolicies(next);
    return NextResponse.json({ success: true, policies: next });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save policies" }, { status: 500 });
  }
}
