"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
    FiCoffee,
    FiCreditCard,
    FiMapPin,
    FiShoppingBag,
    FiTruck,
    FiUser,
} from "react-icons/fi";
import { useStore } from "@/context/StoreContext";
import useCurrentUser from "@/hooks/useCurrentUser";
import { notifyError } from "@/lib/ui/notify";

const money = new Intl.NumberFormat("fa-IR");
const fallbackImage = "/images/shop/product-placeholder.svg";

export default function CheckoutClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const requestedType = searchParams.get("type");
    const { user } = useCurrentUser();
    const {
        cafeCartItems,
        shopCartItems,
        subtotalsByType,
        getCheckoutItems,
        clearCartType,
        isHydrated,
    } = useStore();

    const availableTypes = useMemo(() => {
        const result = [];
        if (cafeCartItems.length) result.push("cafe");
        if (shopCartItems.length) result.push("shop");
        return result;
    }, [cafeCartItems.length, shopCartItems.length]);

    const [orderType, setOrderType] = useState(
        requestedType === "shop" || requestedType === "cafe" ? requestedType : "",
    );
    const [fulfillmentType, setFulfillmentType] = useState("");
    const [customer, setCustomer] = useState({ fullName: "", email: "", phone: "" });
    const [delivery, setDelivery] = useState({ province: "", city: "", addressLine: "", postalCode: "", plaque: "", unit: "" });
    const [tableNumber, setTableNumber] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [customerNote, setCustomerNote] = useState("");
    const [quote, setQuote] = useState(null);
    const [status, setStatus] = useState({ loading: false, error: "" });

    useEffect(() => {
        if (!orderType && availableTypes.length === 1) setOrderType(availableTypes[0]);
        if (orderType && !availableTypes.includes(orderType) && availableTypes.length) setOrderType(availableTypes[0]);
    }, [availableTypes, orderType]);

    useEffect(() => {
        if (user) {
            setCustomer((current) => ({
                fullName: current.fullName || user.name || "",
                email: current.email || user.email || "",
                phone: current.phone || user.phone || "",
            }));
        }
    }, [user]);

    useEffect(() => {
        setFulfillmentType(orderType === "cafe" ? "dine_in" : orderType === "shop" ? "pickup" : "");
        setQuote(null);
    }, [orderType]);

    const items = orderType === "shop" ? shopCartItems : orderType === "cafe" ? cafeCartItems : [];
    const localSubtotal = orderType ? subtotalsByType[orderType] || 0 : 0;

    const buildPayload = () => ({
        orderType,
        fulfillmentType,
        tableNumber: fulfillmentType === "dine_in" ? tableNumber : "",
        customer,
        delivery: {
            ...delivery,
            method: fulfillmentType === "delivery" ? "delivery" : "pickup",
        },
        paymentMethod,
        customerNote,
        items: getCheckoutItems(orderType),
    });

    const requestQuote = async () => {
        const response = await fetch("/api/orders/quote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(buildPayload()),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || "محاسبه مبلغ انجام نشد");
        setQuote(payload.data);
        return payload.data;
    };

    const submitOrder = async (event) => {
        event.preventDefault();
        setStatus({ loading: true, error: "" });
        try {
            await requestQuote();
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(buildPayload()),
            });
            const payload = await response.json();
            if (!response.ok) throw new Error(payload.message || "ثبت سفارش انجام نشد");

            const number = payload.data?.orderNumber || "";
            const total = payload.data?.pricing?.total || quote?.pricing?.total || localSubtotal;
            clearCartType(orderType);
            router.push(`/checkout/success?number=${encodeURIComponent(number)}&type=${orderType}&total=${encodeURIComponent(total)}`);
        } catch (error) {
            const message = error.message || "ثبت سفارش انجام نشد";
            setStatus({ loading: false, error: message });
            notifyError("ثبت سفارش انجام نشد", message);
        }
    };

    if (!isHydrated) {
        return <main className="page-container py-12"><div className="h-[520px] animate-pulse rounded-[2rem] bg-white" /></main>;
    }

    if (!availableTypes.length) {
        return <main className="page-container py-16 text-center"><div className="mx-auto max-w-lg rounded-[2rem] border border-coffee-100 bg-white p-10 shadow-sm"><h1 className="text-2xl font-black text-coffee-950">سبد خرید خالی است</h1><p className="mt-3 text-sm text-coffee-500">از منوی کافه یا فروشگاه آیتم انتخاب کن.</p><div className="mt-6 flex justify-center gap-2"><Link href="/menu" className="rounded-xl bg-coffee-900 px-5 py-3 text-xs font-black text-white">منوی کافه</Link><Link href="/shop" className="rounded-xl bg-cream-100 px-5 py-3 text-xs font-black text-coffee-700">فروشگاه</Link></div></div></main>;
    }

    if (!orderType) {
        return <main className="page-container py-12"><div className="mx-auto max-w-2xl"><h1 className="text-3xl font-black text-coffee-950">کدام سفارش را تکمیل می‌کنی؟</h1><div className="mt-6 grid gap-4 sm:grid-cols-2">{cafeCartItems.length > 0 && <button type="button" onClick={()=>setOrderType("cafe")} className="rounded-[1.75rem] border border-coffee-100 bg-white p-6 text-right shadow-sm"><FiCoffee className="text-2xl text-caramel-600" /><h2 className="mt-4 text-lg font-black">سفارش کافه</h2><p className="mt-2 text-xs text-coffee-400">مصرف داخل کافه یا بیرون‌بر</p></button>}{shopCartItems.length > 0 && <button type="button" onClick={()=>setOrderType("shop")} className="rounded-[1.75rem] border border-coffee-100 bg-white p-6 text-right shadow-sm"><FiShoppingBag className="text-2xl text-caramel-600" /><h2 className="mt-4 text-lg font-black">خرید فروشگاهی</h2><p className="mt-2 text-xs text-coffee-400">ارسال به آدرس یا تحویل حضوری</p></button>}</div></div></main>;
    }

    return (
        <main className="page-container py-10 sm:py-14">
            <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div><p className="text-xs font-bold text-caramel-600">تکمیل سفارش</p><h1 className="mt-2 text-3xl font-black text-coffee-950">{orderType === "cafe" ? "سفارش کافه" : "خرید فروشگاهی"}</h1><p className="mt-2 text-sm text-coffee-500">{orderType === "cafe" ? "برای داخل کافه شماره میز را بزن؛ سفارش مستقیم برای آماده‌سازی ثبت می‌شود." : "محصولات را ارسال می‌کنیم یا می‌توانی حضوری تحویل بگیری."}</p></div>
                {availableTypes.length > 1 && <button type="button" onClick={()=>setOrderType(orderType === "cafe" ? "shop" : "cafe")} className="w-fit rounded-xl bg-white px-4 py-2.5 text-xs font-black text-coffee-600 shadow-sm">تکمیل بخش دیگر سبد</button>}
            </div>

            <form onSubmit={submitOrder} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
                <div className="space-y-5">
                    <section className="rounded-[1.75rem] border border-coffee-100 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-cream-100"><FiUser /></span><h2 className="text-lg font-black text-coffee-950">اطلاعات مشتری</h2></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><input required placeholder="نام و نام خانوادگی" value={customer.fullName} onChange={(e)=>setCustomer({...customer,fullName:e.target.value})} className="h-12 rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm outline-none focus:border-caramel-400" /><input required type="email" dir="ltr" placeholder="email@example.com" value={customer.email} onChange={(e)=>setCustomer({...customer,email:e.target.value})} className="h-12 rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm outline-none focus:border-caramel-400" /><input required dir="ltr" placeholder="شماره تماس" value={customer.phone} onChange={(e)=>setCustomer({...customer,phone:e.target.value})} className="h-12 rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm outline-none focus:border-caramel-400 sm:col-span-2" /></div></section>

                    <section className="rounded-[1.75rem] border border-coffee-100 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-cream-100">{orderType === "cafe" ? <FiCoffee /> : <FiTruck />}</span><h2 className="text-lg font-black text-coffee-950">روش دریافت</h2></div>
                        {orderType === "cafe" ? <div className="mt-5 grid gap-3 sm:grid-cols-2"><button type="button" onClick={()=>setFulfillmentType("dine_in")} className={`rounded-xl border p-4 text-right ${fulfillmentType === "dine_in" ? "border-caramel-400 bg-caramel-50" : "border-coffee-100"}`}><p className="text-sm font-black">مصرف داخل کافه</p><p className="mt-1 text-xs text-coffee-400">سفارش را آماده می‌کنیم و برای میزت می‌آوریم.</p></button><button type="button" onClick={()=>setFulfillmentType("takeaway")} className={`rounded-xl border p-4 text-right ${fulfillmentType === "takeaway" ? "border-caramel-400 bg-caramel-50" : "border-coffee-100"}`}><p className="text-sm font-black">بیرون‌بر</p><p className="mt-1 text-xs text-coffee-400">آماده می‌شود و از کانتر تحویل می‌گیری.</p></button>{fulfillmentType === "dine_in" && <input required placeholder="شماره میز، مثلاً ۱۲" value={tableNumber} onChange={(e)=>setTableNumber(e.target.value)} className="h-12 rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm outline-none focus:border-caramel-400 sm:col-span-2" />}</div> : <div className="mt-5"><div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={()=>setFulfillmentType("pickup")} className={`rounded-xl border p-4 text-right ${fulfillmentType === "pickup" ? "border-caramel-400 bg-caramel-50" : "border-coffee-100"}`}><p className="text-sm font-black">تحویل حضوری</p><p className="mt-1 text-xs text-coffee-400">بدون هزینه ارسال از مجموعه تحویل بگیر.</p></button><button type="button" onClick={()=>setFulfillmentType("delivery")} className={`rounded-xl border p-4 text-right ${fulfillmentType === "delivery" ? "border-caramel-400 bg-caramel-50" : "border-coffee-100"}`}><p className="text-sm font-black">ارسال به آدرس</p><p className="mt-1 text-xs text-coffee-400">محصول برایت ارسال می‌شود.</p></button></div>{fulfillmentType === "delivery" && <div className="mt-4 grid gap-3 sm:grid-cols-2"><input placeholder="استان" value={delivery.province} onChange={(e)=>setDelivery({...delivery,province:e.target.value})} className="h-12 rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm" /><input required placeholder="شهر" value={delivery.city} onChange={(e)=>setDelivery({...delivery,city:e.target.value})} className="h-12 rounded-xl border border-coffee-100 bg-cream-50 px-4 text-sm" /><textarea required rows={3} placeholder="آدرس کامل" value={delivery.addressLine} onChange={(e)=>setDelivery({...delivery,addressLine:e.target.value})} className="resize-none rounded-xl border border-coffee-100 bg-cream-50 p-4 text-sm sm:col-span-2" /></div>}</div>}
                    </section>

                    <section className="rounded-[1.75rem] border border-coffee-100 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-cream-100"><FiCreditCard /></span><h2 className="text-lg font-black text-coffee-950">پرداخت و توضیحات</h2></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><button type="button" onClick={()=>setPaymentMethod("cash")} className={`rounded-xl border p-4 text-sm font-black ${paymentMethod === "cash" ? "border-caramel-400 bg-caramel-50" : "border-coffee-100"}`}>پرداخت حضوری</button><button type="button" onClick={()=>setPaymentMethod("online")} className={`rounded-xl border p-4 text-sm font-black ${paymentMethod === "online" ? "border-caramel-400 bg-caramel-50" : "border-coffee-100"}`}>پرداخت آنلاین</button><textarea rows={3} value={customerNote} onChange={(e)=>setCustomerNote(e.target.value)} placeholder="توضیحات سفارش (اختیاری)" className="resize-none rounded-xl border border-coffee-100 bg-cream-50 p-4 text-sm sm:col-span-2" /></div></section>
                </div>

                <aside className="self-start rounded-[1.75rem] border border-coffee-100 bg-white p-5 shadow-sm xl:sticky xl:top-24"><h2 className="text-lg font-black text-coffee-950">خلاصه سفارش</h2><div className="mt-4 max-h-72 space-y-3 overflow-y-auto">{items.map((item)=><div key={item.key} className="flex gap-3 rounded-xl bg-cream-50 p-2.5"><div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-white"><Image src={item.image || fallbackImage} alt={item.name} fill sizes="56px" className="object-contain p-1" /></div><div className="min-w-0 flex-1"><p className="line-clamp-1 text-xs font-black text-coffee-900">{item.name}</p><p className="mt-1 text-[10px] text-coffee-400">{item.quantity.toLocaleString("fa-IR")} عدد</p></div></div>)}</div><div className="mt-5 space-y-2 border-t border-coffee-100 pt-4 text-xs"><div className="flex justify-between text-coffee-500"><span>جمع محصولات</span><span>{money.format(quote?.pricing?.subtotal ?? localSubtotal)} تومان</span></div><div className="flex justify-between text-coffee-500"><span>ارسال</span><span>{money.format(quote?.pricing?.deliveryFee || 0)} تومان</span></div><div className="flex justify-between border-t border-coffee-100 pt-3 text-sm font-black text-coffee-950"><span>مبلغ نهایی</span><span>{money.format(quote?.pricing?.total ?? localSubtotal)} تومان</span></div></div>{status.error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-danger">{status.error}</p>}<button type="submit" disabled={status.loading} className="mt-5 h-12 w-full rounded-xl bg-coffee-900 text-sm font-black text-white disabled:opacity-50">{status.loading ? "در حال ثبت..." : "ثبت نهایی سفارش"}</button></aside>
            </form>
        </main>
    );
}
