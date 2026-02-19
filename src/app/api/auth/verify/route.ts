import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token not found" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { verifyToken: token },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // Already verified — return success
    if (user.emailVerified) {
      return NextResponse.json({ message: "Email verified successfully!" });
    }

    if (user.verifyTokenExpiry && user.verifyTokenExpiry < new Date()) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
      },
    });

    return NextResponse.json({ message: "Email verified successfully!" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
