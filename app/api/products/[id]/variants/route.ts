import { ProductVariant } from "@/app/generated/prisma";
import { requireAdminApi } from "@/lib/auth";
import { prisma } from "@/lib/database";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const auth = await requireAdminApi();
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    const variant = await prisma.productVariant.findUnique({ where: { id } });
    return NextResponse.json(variant);
  } catch (error) {
    console.error("Failed to fetch variant:", error);
    return NextResponse.json(
      { error: "Failed to fetch variant" },
      { status: 500 },
    );
  }
};

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const auth = await requireAdminApi();
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    const body = (await req.json()) as ProductVariant;
    const variant = await prisma.productVariant.create({
      data: {
        productId: id,
        name: body.name,
        isAvailable: body.isAvailable,
      },
    });
    return NextResponse.json(variant);
  } catch (error) {
    console.error("Failed to create variant:", error);
    return NextResponse.json(
      { error: "Failed to create variant" },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const auth = await requireAdminApi();
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    const variant = await prisma.productVariant.delete({ where: { id } });
    return NextResponse.json({ message: "Variant deleted", id: variant.id });
  } catch (error) {
    console.error("Failed to delete variant:", error);
    return NextResponse.json(
      { error: "Failed to delete variant" },
      { status: 500 },
    );
  }
};

export const PATCH = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const auth = await requireAdminApi();
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    const body = (await req.json()) as ProductVariant;
    const variant = await prisma.productVariant.update({
      where: { id },
      data: {
        name: body.name,
        isAvailable: body.isAvailable,
      },
    });
    return NextResponse.json(variant);
  } catch (error) {
    console.error("Failed to update variant:", error);
    return NextResponse.json(
      { error: "Failed to update variant" },
      { status: 500 },
    );
  }
};
