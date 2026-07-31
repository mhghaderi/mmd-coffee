import mongoose from "mongoose";

import {
    DELIVERY_METHOD,
    DELIVERY_METHOD_VALUES,
    MAX_ADD_ONS_PER_ITEM,
    MAX_ITEM_QUANTITY,
    MAX_ORDER_LINES,
    ORDER_STATUS,
    PAYMENT_METHOD,
    PAYMENT_METHOD_VALUES,
    PAYMENT_STATUS,
} from "@/constants/order";

import connectToDB from "@/lib/db/connectToDB";

import Counter from "@/models/Counter";
import Order from "@/models/Order";
import Product from "@/models/Product";

export class OrderServiceError extends Error {
    constructor(message, status = 400, code = "ORDER_ERROR") {
        super(message);

        this.name = "OrderServiceError";
        this.status = status;
        this.code = code;
    }
}

function cleanText(value, maximumLength = 500) {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim().slice(0, maximumLength);
}

function normalizeEmail(value) {
    return cleanText(value, 150).toLowerCase();
}

function validateEmail(email) {
    if (!email) {
        return true;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getDeliveryFee(method) {
    if (method === DELIVERY_METHOD.PICKUP) {
        return 0;
    }

    const configuredFee = Number(process.env.DELIVERY_FEE);

    return Number.isFinite(configuredFee) && configuredFee >= 0 ? Math.round(configuredFee) : 45000;
}

function normalizeRequestedItems(value) {
    if (!Array.isArray(value) || value.length === 0) {
        throw new OrderServiceError("سبد خرید خالی است", 400, "EMPTY_CART");
    }

    if (value.length > MAX_ORDER_LINES) {
        throw new OrderServiceError(
            `حداکثر ${MAX_ORDER_LINES.toLocaleString("fa-IR")} ردیف محصول مجاز است`,
        );
    }

    return value.map((item, index) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
            throw new OrderServiceError(`محصول شماره ${index + 1} معتبر نیست`);
        }

        const rawIdentifier =
            typeof item.productId === "string"
                ? item.productId.trim()
                : typeof item.id === "string"
                  ? item.id.trim()
                  : "";

        const hasValidProductId = mongoose.isValidObjectId(rawIdentifier);

        const explicitSlug = typeof item.slug === "string" ? item.slug.trim().toLowerCase() : "";

        const identifierAsSlug =
            !hasValidProductId && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rawIdentifier)
                ? rawIdentifier.toLowerCase()
                : "";

        const productId = hasValidProductId ? rawIdentifier : "";

        const slug = explicitSlug || identifierAsSlug;

        if (!productId && !slug) {
            throw new OrderServiceError(`شناسه محصول شماره ${index + 1} معتبر نیست`);
        }

        const quantity = Number(item.quantity);

        if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_ITEM_QUANTITY) {
            throw new OrderServiceError(
                `تعداد محصول شماره ${index + 1} باید بین ۱ تا ${MAX_ITEM_QUANTITY.toLocaleString(
                    "fa-IR",
                )} باشد`,
            );
        }

        const variantId = typeof item.variantId === "string" ? item.variantId.trim() : "";

        if (variantId && !mongoose.isValidObjectId(variantId)) {
            throw new OrderServiceError(`مدل محصول شماره ${index + 1} معتبر نیست`);
        }

        const rawAddOnIds = Array.isArray(item.addOnIds) ? item.addOnIds : [];

        const addOnIds = [
            ...new Set(
                rawAddOnIds
                    .filter((addOnId) => typeof addOnId === "string")
                    .map((addOnId) => addOnId.trim())
                    .filter(Boolean),
            ),
        ];

        if (addOnIds.some((addOnId) => !mongoose.isValidObjectId(addOnId))) {
            throw new OrderServiceError(`افزودنی محصول شماره ${index + 1} معتبر نیست`);
        }

        if (addOnIds.length > MAX_ADD_ONS_PER_ITEM) {
            throw new OrderServiceError(
                `تعداد افزودنی‌های محصول شماره ${index + 1} بیش‌ازحد مجاز است`,
            );
        }

        return {
            productId,
            slug,
            quantity,
            variantId,
            addOnIds,
        };
    });
}

function normalizeCustomer(payload, currentUser) {
    const source =
        payload?.customer && typeof payload.customer === "object" ? payload.customer : {};

    const fullName = cleanText(source.fullName || currentUser?.name, 80);

    const email = normalizeEmail(source.email || currentUser?.email);

    const phone = cleanText(source.phone, 20);

    if (fullName.length < 2) {
        throw new OrderServiceError("نام و نام خانوادگی مشتری الزامی است");
    }

    if (phone.length < 7 || phone.length > 20) {
        throw new OrderServiceError("شماره تماس مشتری معتبر نیست");
    }

    if (!validateEmail(email)) {
        throw new OrderServiceError("ایمیل مشتری معتبر نیست");
    }

    return {
        fullName,
        email,
        phone,
    };
}

function normalizeDelivery(payload) {
    const source =
        payload?.delivery && typeof payload.delivery === "object" ? payload.delivery : {};

    const method = DELIVERY_METHOD_VALUES.includes(source.method)
        ? source.method
        : DELIVERY_METHOD.PICKUP;

    const delivery = {
        method,
        province: cleanText(source.province, 80),
        city: cleanText(source.city, 80),
        addressLine: cleanText(source.addressLine, 500),
        postalCode: cleanText(source.postalCode, 20),
        plaque: cleanText(source.plaque, 20),
        unit: cleanText(source.unit, 20),
    };

    if (method === DELIVERY_METHOD.DELIVERY && (!delivery.city || !delivery.addressLine)) {
        throw new OrderServiceError("برای ارسال، شهر و آدرس کامل الزامی هستند");
    }

    return delivery;
}

function normalizePaymentMethod(payload) {
    const requestedMethod = payload?.paymentMethod;

    return PAYMENT_METHOD_VALUES.includes(requestedMethod) ? requestedMethod : PAYMENT_METHOD.CASH;
}

async function getNextOrderNumber(session = null) {
    const options = {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
    };

    if (session) {
        options.session = session;
    }

    const counter = await Counter.findOneAndUpdate(
        {
            key: "orders",
        },
        {
            $inc: {
                sequence: 1,
            },
        },
        options,
    ).lean();

    return `MMD-${String(counter.sequence).padStart(6, "0")}`;
}

async function loadProducts(requestedItems, session = null) {
    const productIds = [...new Set(requestedItems.map((item) => item.productId).filter(Boolean))];

    const productSlugs = [...new Set(requestedItems.map((item) => item.slug).filter(Boolean))];

    const identityConditions = [];

    if (productIds.length > 0) {
        identityConditions.push({
            _id: {
                $in: productIds,
            },
        });
    }

    if (productSlugs.length > 0) {
        identityConditions.push({
            slug: {
                $in: productSlugs,
            },
        });
    }

    if (identityConditions.length === 0) {
        throw new OrderServiceError("محصول معتبری در سبد خرید وجود ندارد", 400, "INVALID_CART");
    }

    let query = Product.find({
        $and: [
            {
                $or: identityConditions,
            },

            {
                status: "published",
                isAvailable: true,
            },
        ],
    })
        .select(
            "name englishName slug image price discountPercent variants addOns trackStock stock isAvailable status",
        )
        .lean();

    if (session) {
        query = query.session(session);
    }

    const products = await query;

    const productMap = new Map();

    for (const product of products) {
        productMap.set(`id:${product._id.toString()}`, product);

        productMap.set(`slug:${product.slug}`, product);
    }

    for (const requestedItem of requestedItems) {
        const product = requestedItem.productId
            ? productMap.get(`id:${requestedItem.productId}`)
            : productMap.get(`slug:${requestedItem.slug}`);

        if (!product) {
            throw new OrderServiceError(
                "یک یا چند محصول حذف شده، ناموجود است یا امکان سفارش ندارد",
                409,
                "PRODUCT_UNAVAILABLE",
            );
        }
    }

    return productMap;
}

function buildOrderItems(requestedItems, productMap) {
    const orderItems = [];
    const inventoryMap = new Map();

    let subtotal = 0;

    for (const requestedItem of requestedItems) {
        const product = requestedItem.productId
            ? productMap.get(`id:${requestedItem.productId}`)
            : productMap.get(`slug:${requestedItem.slug}`);
        if (!product) {
            throw new OrderServiceError("محصول انتخاب‌شده پیدا نشد", 404);
        }

        const activeVariants = Array.isArray(product.variants)
            ? product.variants.filter((variant) => variant.isActive !== false)
            : [];

        let selectedVariant = null;

        if (activeVariants.length > 0) {
            selectedVariant = requestedItem.variantId
                ? activeVariants.find(
                      (variant) => variant._id.toString() === requestedItem.variantId,
                  )
                : activeVariants.find((variant) => variant.isDefault) || activeVariants[0];

            if (!selectedVariant) {
                throw new OrderServiceError(`مدل انتخاب‌شده برای ${product.name} معتبر نیست`);
            }
        } else if (requestedItem.variantId) {
            throw new OrderServiceError(`محصول ${product.name} مدل قابل انتخابی ندارد`);
        }

        const activeAddOns = Array.isArray(product.addOns)
            ? product.addOns.filter((addOn) => addOn.isActive !== false)
            : [];

        const selectedAddOns = requestedItem.addOnIds.map((addOnId) => {
            const addOn = activeAddOns.find((item) => item._id.toString() === addOnId);

            if (!addOn) {
                throw new OrderServiceError(`یکی از افزودنی‌های ${product.name} معتبر نیست`);
            }

            return addOn;
        });

        const basePrice = Math.round(product.price);

        const discountPercent = Number(product.discountPercent) || 0;

        const discountedBasePrice = Math.round(basePrice * (1 - discountPercent / 100));

        const variantPriceAdjustment = Number(selectedVariant?.priceAdjustment) || 0;

        const addOnsTotal = selectedAddOns.reduce(
            (total, addOn) => total + (Number(addOn.price) || 0),
            0,
        );

        const unitPrice = discountedBasePrice + variantPriceAdjustment + addOnsTotal;

        const lineTotal = unitPrice * requestedItem.quantity;

        subtotal += lineTotal;

        orderItems.push({
            product: product._id,
            name: product.name,
            englishName: product.englishName || "",
            slug: product.slug,
            image: product.image || "",

            quantity: requestedItem.quantity,

            basePrice,
            discountPercent,
            discountedBasePrice,

            variant: selectedVariant
                ? {
                      originalId: selectedVariant._id,
                      title: selectedVariant.title,
                      priceAdjustment: variantPriceAdjustment,
                  }
                : null,

            addOns: selectedAddOns.map((addOn) => ({
                originalId: addOn._id,
                title: addOn.title,
                price: Number(addOn.price) || 0,
            })),

            unitPrice,
            lineTotal,
        });

        const inventoryKey = product._id.toString();

        const previousInventory = inventoryMap.get(inventoryKey);

        if (previousInventory) {
            previousInventory.quantity += requestedItem.quantity;
        } else {
            inventoryMap.set(inventoryKey, {
                productId: product._id,
                productName: product.name,
                quantity: requestedItem.quantity,
                trackStock: Boolean(product.trackStock),
                currentStock: Number(product.stock) || 0,
            });
        }
    }

    return {
        orderItems,
        inventoryPlans: [...inventoryMap.values()],
        subtotal,
    };
}

async function reserveInventory(plans, session, appliedPlans) {
    for (const plan of plans) {
        if (!plan.trackStock) {
            continue;
        }

        if (plan.currentStock < plan.quantity) {
            throw new OrderServiceError(
                `موجودی ${plan.productName} کافی نیست`,
                409,
                "INSUFFICIENT_STOCK",
            );
        }

        const options = {};

        if (session) {
            options.session = session;
        }

        const result = await Product.updateOne(
            {
                _id: plan.productId,
                status: "published",
                isAvailable: true,
                trackStock: true,
                stock: {
                    $gte: plan.quantity,
                },
            },

            [
                {
                    $set: {
                        stock: {
                            $subtract: ["$stock", plan.quantity],
                        },

                        isAvailable: {
                            $gt: [
                                {
                                    $subtract: ["$stock", plan.quantity],
                                },
                                0,
                            ],
                        },
                    },
                },
            ],

            options,
        );

        if (result.modifiedCount !== 1) {
            throw new OrderServiceError(
                `موجودی ${plan.productName} تغییر کرده است؛ سبد خرید را بررسی کن`,
                409,
                "STOCK_CHANGED",
            );
        }

        appliedPlans.push(plan);
    }
}

async function rollbackInventory(plans) {
    for (const plan of [...plans].reverse()) {
        try {
            await Product.updateOne(
                {
                    _id: plan.productId,
                    trackStock: true,
                },
                {
                    $inc: {
                        stock: plan.quantity,
                    },

                    $set: {
                        isAvailable: true,
                    },
                },
            );
        } catch (error) {
            console.error("CRITICAL INVENTORY ROLLBACK ERROR:", {
                plan,
                error,
            });
        }
    }
}

async function createOrderDocument({ payload, currentUser, session }) {
    const requestedItems = normalizeRequestedItems(payload.items);

    const customer = normalizeCustomer(payload, currentUser);

    const delivery = normalizeDelivery(payload);

    const paymentMethod = normalizePaymentMethod(payload);

    const productMap = await loadProducts(requestedItems, session);

    const { orderItems, inventoryPlans, subtotal } = buildOrderItems(requestedItems, productMap);

    const deliveryFee = getDeliveryFee(delivery.method);

    const discountAmount = 0;

    const total = Math.max(subtotal + deliveryFee - discountAmount, 0);

    const appliedPlans = [];

    try {
        await reserveInventory(inventoryPlans, session, appliedPlans);

        const orderNumber = await getNextOrderNumber(session);

        const initialPaymentStatus =
            paymentMethod === PAYMENT_METHOD.ONLINE
                ? PAYMENT_STATUS.PENDING
                : PAYMENT_STATUS.UNPAID;

        const orderData = {
            orderNumber,

            user: currentUser?.id || null,

            customer,
            items: orderItems,
            delivery,

            pricing: {
                subtotal,
                deliveryFee,
                discountAmount,
                total,
                priceUnit: "toman",
            },

            payment: {
                method: paymentMethod,
                status: initialPaymentStatus,
            },
            paymentHistory: [
                {
                    status: initialPaymentStatus,
                    note: "وضعیت پرداخت هنگام ثبت سفارش",
                    changedBy: currentUser?.id || null,
                    changedAt: new Date(),
                },
            ],
            status: ORDER_STATUS.PENDING,

            statusHistory: [
                {
                    status: ORDER_STATUS.PENDING,
                    note: "سفارش توسط مشتری ثبت شد",

                    changedBy: currentUser?.id || null,

                    changedAt: new Date(),
                },
            ],

            customerNote: cleanText(payload.customerNote, 1000),

            source: "web",
        };

        let order;

        if (session) {
            [order] = await Order.create([orderData], {
                session,
            });
        } else {
            order = await Order.create(orderData);
        }

        return order;
    } catch (error) {
        /*
      در حالت Transaction، خود MongoDB تغییرات را
      Rollback می‌کند. این Rollback فقط برای حالت
      MongoDB محلی بدون Transaction است.
    */

        if (!session && appliedPlans.length > 0) {
            await rollbackInventory(appliedPlans);
        }

        throw error;
    }
}

export async function createOrder({ payload, currentUser = null }) {
    await connectToDB();

    const useTransactions = process.env.MONGO_USE_TRANSACTIONS === "true";

    if (!useTransactions) {
        return createOrderDocument({
            payload,
            currentUser,
            session: null,
        });
    }

    const session = await mongoose.startSession();

    let createdOrder = null;

    try {
        await session.withTransaction(async () => {
            createdOrder = await createOrderDocument({
                payload,
                currentUser,
                session,
            });
        });

        return createdOrder;
    } finally {
        await session.endSession();
    }
}

export async function calculateOrderQuote({ payload }) {
    await connectToDB();

    const requestedItems = normalizeRequestedItems(payload.items);

    const productMap = await loadProducts(requestedItems, null);

    const { orderItems, subtotal } = buildOrderItems(requestedItems, productMap);

    const requestedDeliveryMethod = payload?.delivery?.method;

    const deliveryMethod = DELIVERY_METHOD_VALUES.includes(requestedDeliveryMethod)
        ? requestedDeliveryMethod
        : DELIVERY_METHOD.PICKUP;

    const deliveryFee = getDeliveryFee(deliveryMethod);

    const discountAmount = 0;

    const total = Math.max(subtotal + deliveryFee - discountAmount, 0);

    return {
        items: orderItems.map((item) => ({
            productId: item.product.toString(),

            name: item.name,
            englishName: item.englishName,
            slug: item.slug,
            image: item.image,

            quantity: item.quantity,

            basePrice: item.basePrice,

            discountPercent: item.discountPercent,

            discountedBasePrice: item.discountedBasePrice,

            variant: item.variant
                ? {
                      originalId: item.variant.originalId?.toString() || "",

                      title: item.variant.title,

                      priceAdjustment: item.variant.priceAdjustment,
                  }
                : null,

            addOns: item.addOns.map((addOn) => ({
                originalId: addOn.originalId?.toString() || "",

                title: addOn.title,
                price: addOn.price,
            })),

            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
        })),

        delivery: {
            method: deliveryMethod,
        },

        pricing: {
            subtotal,
            deliveryFee,
            discountAmount,
            total,
            priceUnit: "toman",
        },
    };
}
