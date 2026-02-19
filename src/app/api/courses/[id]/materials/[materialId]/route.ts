import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; materialId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { materialId } = await params;

    const material = await prisma.courseMaterial.findUnique({
      where: { id: materialId },
    });

    if (!material) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 });
    }

    // Try to delete the file from disk
    try {
      const filePath = path.join(process.cwd(), "public", material.fileUrl);
      await unlink(filePath);
    } catch {
      // File may not exist on disk
    }

    await prisma.courseMaterial.delete({ where: { id: materialId } });

    return NextResponse.json({ message: "Material deleted" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
