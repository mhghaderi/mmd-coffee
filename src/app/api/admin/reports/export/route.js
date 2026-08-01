import { requireAdmin } from "@/lib/auth/session";
import getAdminReports from "@/lib/admin/reports/getAdminReports";

function escapeCsv(value) {
    const text = String(value ?? "");
    return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request) {
    const authorization = await requireAdmin();

    if (!authorization.ok) {
        return authorization.response;
    }

    try {
        const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
        const data = await getAdminReports(searchParams);

        if (!data) {
            return Response.json({ success: false, message: "دسترسی مجاز نیست" }, { status: 403 });
        }

        const rows = [
            ["گزارش مدیریتی ممد کافی"],
            ["از", data.range.fromInput, "تا", data.range.toInput],
            [],
            ["شاخص", "مقدار"],
            ["درآمد پرداخت‌شده", data.summary.revenue],
            ["تمام سفارش‌ها", data.summary.totalOrders],
            ["سفارش‌های تکمیل‌شده", data.summary.completedOrders],
            ["سفارش‌های لغوشده", data.summary.cancelledOrders],
            ["میانگین سفارش", data.summary.averageOrderValue],
            ["کاربران جدید", data.summary.newUsers],
            [],
            ["محصولات پرفروش"],
            ["محصول", "تعداد", "تعداد سفارش", "درآمد"],
            ...data.topProducts.map((item) => [item.name, item.quantity, item.orderCount, item.revenue]),
            [],
            ["مشتریان برتر"],
            ["نام", "ایمیل", "تعداد سفارش", "مجموع خرید"],
            ...data.topCustomers.map((item) => [item.name, item.email, item.orders, item.spent]),
        ];

        const csv = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n")}`;
        const filename = `mmd-coffee-report-${data.range.fromInput}-${data.range.toInput}.csv`;

        return new Response(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${filename}"`,
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error("EXPORT REPORT ERROR:", error);
        return Response.json({ success: false, message: "ساخت خروجی گزارش انجام نشد" }, { status: 500 });
    }
}
