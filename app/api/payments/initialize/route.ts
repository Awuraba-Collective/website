import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database";
import { paymentRatelimit, checkRateLimit } from "@/lib/ratelimit";
import { initializePayment, generatePaymentReference } from "@/lib/paystack";
import { generateOrderNumber } from "@/lib/order";
import {
  OrderStatus,
  PaymentStatus,
  Prisma,
  Length,
  ProductVariant,
} from "@/app/generated/prisma";
import { getProductPrice } from "@/lib/utils/currency";

interface InitializePaymentRequest {
  phone: string;
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  region?: string;
  items: Array<{
    productId: string;
    name: string;
    variant: ProductVariant;
    price: number;
    quantity: number;
    selectedSize: string;
    selectedLength: string;
    fitCategory: string;
    note?: string;
  }>;
  currency: string;
  exchangeRate: number;
}

export async function POST(request: NextRequest) {
  // Rate limiting: 5 requests per minute per IP
  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "anonymous";
  const { success: rateLimitOk } = await checkRateLimit(paymentRatelimit, ip);

  if (!rateLimitOk) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 },
    );
  }

  try {
    const body: InitializePaymentRequest = await request.json();
    const {
      phone,
      firstName,
      lastName,
      address,
      city,
      region,
      items,
      currency,
      exchangeRate,
    } = body;

    // Derived email for Paystack (required)
    const whatsappClean = phone.replace(/[\s\-\+\(\)]/g, "");
    const email = `${whatsappClean}@awuraba.com`;

    // Validate request
    if (!phone || !items?.length) {
      return NextResponse.json(
        { error: "Phone and items are required" },
        { status: 400 },
      );
    }

    // Verify prices and calculate totals on server
    const productIds = items.map((item) => item.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        prices: true,
        discount: true,
      },
    });

    let subtotalInCurrency = 0;
    const validatedItems = items.map((item) => {
      const dbProduct = dbProducts.find((p) => p.id === item.productId);
      if (!dbProduct) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      // Calculate price in the selected currency
      const { price: basePrice, discountPrice } = getProductPrice(
        dbProduct,
        currency,
      );
      const currentPrice = discountPrice ?? basePrice;

      subtotalInCurrency += currentPrice * item.quantity;

      return {
        ...item,
        price: currentPrice, // Price in selected currency
      };
    });

    // Convert total to GHS for Paystack if necessary
    const subtotal =
      currency === "GHS"
        ? subtotalInCurrency
        : Math.round(subtotalInCurrency * (exchangeRate || 1) * 100) / 100;

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

    const dbCustomer = await prisma.customer.upsert({
      where: { whatsappNumber: whatsappClean },
      update: {
        firstName,
        lastName,
        phone,
        lastAddress: address || undefined,
        lastCity: city || undefined,
        lastRegion: region || undefined,
        orderCount: { increment: 1 },
        totalSpent: { increment: new Prisma.Decimal(total) },
      },
      create: {
        whatsappNumber: whatsappClean,
        firstName,
        lastName,
        phone,
        lastAddress: address || undefined,
        lastCity: city || undefined,
        lastRegion: region || undefined,
        orderCount: 1,
        totalSpent: new Prisma.Decimal(total),
      },
    });

    // Create order with PENDING status
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: OrderStatus.PENDING,
        customerId: dbCustomer.id,
        subtotal: new Prisma.Decimal(subtotal),
        shippingCost: new Prisma.Decimal(shippingCost),
        discount: new Prisma.Decimal(discount),
        total: new Prisma.Decimal(total),
        currency: "GHS",
        shippingName: `${firstName} ${lastName}`,
        shippingAddress: address || "To be confirmed",
        shippingCity: city || "To be confirmed",
        shippingRegion: region || "To be confirmed",
        shippingCountry: "Ghana",
        shippingPhone: phone,
        items: {
          create: validatedItems.map((item) => ({
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
    console.error("Failed to initialize payment:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 },
    );
  }
}
