import { prisma } from "@/lib/database";
import { requireAdminApi } from "@/lib/auth";
import { NextResponse } from "next/server";

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET: Public
export async function GET() {
  try {
    const fitCategories = await prisma.fitCategory.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(fitCategories);
  } catch (error) {
    console.error("Failed to fetch fit categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch fit categories" },
      { status: 500 },
    );
  }
}

// POST: Admin only
export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.success) return auth.response;

  try {
    const { name } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = generateSlug(name);

    // Check if slug already exists
    const existing = await prisma.fitCategory.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Fit category already exists" },
        { status: 409 },
      );
    }

    const fitCategory = await prisma.fitCategory.create({
      data: {
        name: name.trim(),
        slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    return NextResponse.json(fitCategory, { status: 201 });
  } catch (error) {
    console.error("Failed to create fit category:", error);
    return NextResponse.json(
      { error: "Failed to create fit category" },
      { status: 500 },
    );
  }
}

// DELETE: Admin only
export async function DELETE(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.success) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await prisma.fitCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete fit category:", error);
    return NextResponse.json(
      { error: "Failed to delete fit category" },
      { status: 500 },
    );
  }
}
