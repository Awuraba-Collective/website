import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { initializePayment, generatePaymentReference } from "@/lib/paystack";
import { generateOrderNumber } from "@/lib/order";
import {
  OrderStatus,
  PaymentStatus,
  Prisma,
  Length,
  ProductVariant,
} from "@/app/generated/prisma";

interface InitializePaymentRequest {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  items: Array<{
    productId: string;
    name: string;
    variant: ProductVariant;
    price: number;
    quantity: number;
    selectedSize: string;
    selectedLength: string;
    fitCategory: string;
    customMeasurements?: {
      bust?: string;
      waist?: string;
      hips?: string;
      height?: string;
      additionalNotes?: string;
    };
    note?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: InitializePaymentRequest = await request.json();
    const { email, phone, firstName, lastName, address, city, items } = body;
    console.log("🚀 ~ POST ~ items:", items);

    // Validate request
    if (!email || !items?.length) {
      return NextResponse.json(
        { error: "Email and items are required" },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingCost = 0;
    const discount = 0;
    const total = subtotal + shippingCost - discount;

    // Generate unique identifiers
    let orderNumber = generateOrderNumber();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.order.findUnique({
        where: { orderNumber },
      });
      if (!existing) break;
      orderNumber = generateOrderNumber();
      attempts++;
    }

    const paymentReference = generatePaymentReference();

    // Create order with PENDING status
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: OrderStatus.PENDING,
        guestEmail: email,
        guestPhone: phone,
        subtotal: new Prisma.Decimal(subtotal),
        shippingCost: new Prisma.Decimal(shippingCost),
        discount: new Prisma.Decimal(discount),
        total: new Prisma.Decimal(total),
        currency: "GHS",
        shippingName: `${firstName} ${lastName}`,
        shippingAddress: address || "To be confirmed",
        shippingCity: city || "To be confirmed",
        shippingCountry: "Ghana",
        shippingPhone: phone,
        items: {
          create: items.map((item) => ({
            product: { connect: { id: item.productId } },
            variant: { connect: { id: item.variant.id } },
            productName: item.name,
            variantName: item.variant.name,
            unitPrice: new Prisma.Decimal(item.price),
            quantity: item.quantity,
            totalPrice: new Prisma.Decimal(item.price * item.quantity),
            selectedSize: item.selectedSize,
            selectedLength: (item.selectedLength as Length) || Length.REGULAR,
            fitCategory: item.fitCategory,
            customBust: item.customMeasurements?.bust,
            customWaist: item.customMeasurements?.waist,
            customHips: item.customMeasurements?.hips,
            customHeight: item.customMeasurements?.height,
            customNotes: item.customMeasurements?.additionalNotes,
            note: item.note,
          })),
        },
        payments: {
          create: {
            amount: new Prisma.Decimal(total),
            currency: "GHS",
            status: PaymentStatus.PENDING,
            provider: "paystack",
            providerRef: paymentReference,
          },
        },
        timeline: {
          create: {
            status: OrderStatus.PENDING,
            note: "Order created, awaiting payment",
          },
        },
      },
    });

    // Get callback URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const callbackUrl = `${baseUrl}/checkout/callback`;

    // Initialize Paystack payment
    const paystackResponse = await initializePayment({
      email,
      amount: total,
      reference: paymentReference,
      callbackUrl,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        customerName: `${firstName} ${lastName}`,
        customerPhone: phone,
      },
    });

    return NextResponse.json({
      success: true,
      authorizationUrl: paystackResponse.data.authorization_url,
      accessCode: paystackResponse.data.access_code,
      reference: paystackResponse.data.reference,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
