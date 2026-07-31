import Link from "next/link";
import {
    FiCheckCircle,
    FiEye,
    FiMail,
    FiPhone,
    FiUser,
    FiUsers,
    FiXCircle,
} from "react-icons/fi";

import UserActions from "@/components/admin/users/UserActions";

const priceFormatter = new Intl.NumberFormat("fa-IR");

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

function Avatar({ user }) {
    if (user.avatar) {
        return (
            <img
                src={user.avatar}
                alt={user.name}
                className="size-11 shrink-0 rounded-2xl object-cover"
            />
        );
    }

    return (
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-coffee-900 text-sm font-black text-white">
            {user.name?.trim()?.charAt(0) || "ک"}
        </span>
    );
}

function RoleBadge({ role }) {
    return role === "admin" ? (
        <span className="inline-flex rounded-full bg-caramel-50 px-3 py-1.5 text-[10px] font-bold text-caramel-700">
            مدیر
        </span>
    ) : (
        <span className="inline-flex rounded-full bg-coffee-100 px-3 py-1.5 text-[10px] font-bold text-coffee-600">
            کاربر
        </span>
    );
}

function StatusBadge({ isActive }) {
    return isActive ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700">
            <FiCheckCircle />
            فعال
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-bold text-red-700">
            <FiXCircle />
            غیرفعال
        </span>
    );
}

function UserOperationButtons({ user, currentAdminId }) {
    return (
        <div className="flex items-center gap-2">
            <Link
                href={`/admin/users/${user._id}`}
                aria-label={`مشاهده جزئیات ${user.name}`}
                className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 bg-white text-coffee-600 transition hover:bg-cream-100 hover:text-coffee-950"
            >
                <FiEye />
            </Link>

            <UserActions user={user} currentAdminId={currentAdminId} />
        </div>
    );
}

export default function UsersTable({ users, currentAdminId }) {
    if (!users.length) {
        return (
            <div className="flex min-h-96 flex-col items-center justify-center rounded-[2rem] border border-dashed border-coffee-200 bg-white px-5 text-center">
                <FiUsers size={34} className="text-coffee-300" />

                <h2 className="mt-5 text-xl font-black text-coffee-950">کاربری پیدا نشد</h2>

                <p className="mt-2 text-sm leading-7 text-coffee-400">
                    عبارت جست‌وجو یا فیلترهای کاربران را تغییر بده.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="hidden overflow-hidden rounded-[2rem] border border-coffee-100 bg-white shadow-[0_14px_50px_rgba(48,32,26,0.06)] lg:block">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1120px] text-right">
                        <thead className="border-b border-coffee-100 bg-cream-50 text-[11px] text-coffee-400">
                            <tr>
                                <th className="px-5 py-4">کاربر</th>
                                <th className="px-4 py-4">نقش</th>
                                <th className="px-4 py-4">وضعیت</th>
                                <th className="px-4 py-4">ایمیل</th>
                                <th className="px-4 py-4">سفارش‌ها</th>
                                <th className="px-4 py-4">خرید موفق</th>
                                <th className="px-4 py-4">آخرین ورود</th>
                                <th className="px-4 py-4">عضویت</th>
                                <th className="px-5 py-4">عملیات</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <tr
                                    key={user._id}
                                    className="border-b border-coffee-100 last:border-0 hover:bg-cream-50/60"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar user={user} />

                                            <div className="min-w-0">
                                                <p className="max-w-48 truncate text-xs font-black text-coffee-950">
                                                    {user.name}
                                                </p>

                                                <p
                                                    dir="ltr"
                                                    className="mt-1 max-w-52 truncate text-right text-[10px] text-coffee-400"
                                                >
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-4 py-4">
                                        <RoleBadge role={user.role} />
                                    </td>

                                    <td className="px-4 py-4">
                                        <StatusBadge isActive={user.isActive} />
                                    </td>

                                    <td className="px-4 py-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold ${
                                                user.emailVerified
                                                    ? "bg-blue-50 text-blue-700"
                                                    : "bg-amber-50 text-amber-700"
                                            }`}
                                        >
                                            <FiMail />
                                            {user.emailVerified ? "تأییدشده" : "تأییدنشده"}
                                        </span>
                                    </td>

                                    <td className="px-4 py-4 text-xs font-black text-coffee-800">
                                        {Number(user.orderCount || 0).toLocaleString("fa-IR")}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-4 text-xs font-black text-coffee-900">
                                        {priceFormatter.format(Number(user.totalSpent || 0))}
                                        <span className="mr-1 text-[9px] font-medium text-coffee-400">
                                            تومان
                                        </span>
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-4 text-[10px] text-coffee-500">
                                        {user.lastLoginAt
                                            ? dateTimeFormatter.format(new Date(user.lastLoginAt))
                                            : "بدون ورود"}
                                    </td>

                                    <td className="whitespace-nowrap px-4 py-4 text-[10px] text-coffee-500">
                                        {dateFormatter.format(new Date(user.createdAt))}
                                    </td>

                                    <td className="px-5 py-4">
                                        <UserOperationButtons
                                            user={user}
                                            currentAdminId={currentAdminId}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid gap-4 lg:hidden">
                {users.map((user) => (
                    <article
                        key={user._id}
                        className="rounded-[1.75rem] border border-coffee-100 bg-white p-5 shadow-[0_12px_38px_rgba(48,32,26,0.05)]"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                                <Avatar user={user} />

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-black text-coffee-950">
                                        {user.name}
                                    </p>

                                    <p
                                        dir="ltr"
                                        className="mt-1 truncate text-right text-[10px] text-coffee-400"
                                    >
                                        {user.email}
                                    </p>
                                </div>
                            </div>

                            <UserOperationButtons
                                user={user}
                                currentAdminId={currentAdminId}
                            />
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                            <RoleBadge role={user.role} />
                            <StatusBadge isActive={user.isActive} />
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-cream-50 p-3">
                                <p className="text-[10px] text-coffee-400">تعداد سفارش</p>
                                <p className="mt-1 text-sm font-black text-coffee-950">
                                    {Number(user.orderCount || 0).toLocaleString("fa-IR")}
                                </p>
                            </div>

                            <div className="rounded-xl bg-cream-50 p-3">
                                <p className="text-[10px] text-coffee-400">خرید موفق</p>
                                <p className="mt-1 text-xs font-black text-coffee-950">
                                    {priceFormatter.format(Number(user.totalSpent || 0))} تومان
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2 border-t border-coffee-100 pt-4 text-[10px] text-coffee-500">
                            {user.phone && (
                                <p className="flex items-center gap-2">
                                    <FiPhone />
                                    <span dir="ltr">{user.phone}</span>
                                </p>
                            )}

                            <p className="flex items-center gap-2">
                                <FiUser />
                                عضویت: {dateFormatter.format(new Date(user.createdAt))}
                            </p>
                        </div>
                    </article>
                ))}
            </div>
        </>
    );
}
