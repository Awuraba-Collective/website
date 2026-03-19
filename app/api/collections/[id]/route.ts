import { prisma } from "@/lib/database";
import { requireAdminApi } from "@/lib/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// PATCH: Admin only
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    const { name, coverImage, coverVideo, coverType, coverProductId, isActive } = await req.json();

    const data: any = {};
    if (name !== undefined) {
      data.name = name.trim();
      data.slug = generateSlug(name);
    }
    if (coverImage !== undefined) {
      data.coverImage = coverImage;
    }
    if (coverVideo !== undefined) {
      data.coverVideo = coverVideo;
    }
    if (coverType !== undefined) {
      data.coverType = coverType;
    }
    if (coverProductId !== undefined) {
      data.coverProductId = coverProductId;
    }
    if (isActive !== undefined) {
      data.isActive = isActive;
    }

    const collection = await prisma.collection.update({
      where: { id },
      data,
    });

    revalidatePath("/");
    revalidatePath("/shop");

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Failed to update collection:", error);
    return NextResponse.json(
      { error: "Failed to update collection" },
      { status: 500 },
    );
  }
}

// DELETE: Admin only
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminApi();
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;

    await prisma.collection.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/shop");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete collection:", error);
    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 },
    );
  }
}
