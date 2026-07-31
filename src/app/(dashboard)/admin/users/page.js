import { redirect } from "next/navigation";
import {
    FiCheckCircle,
    FiShield,
    FiUserCheck,
    FiUserPlus,
    FiUsers,
    FiUserX,
} from "react-icons/fi";

import UserFilters from "@/components/admin/users/UserFilters";
import UsersPagination from "@/components/admin/users/UsersPagination";
import UsersTable from "@/components/admin/users/UsersTable";

import getAdminUsers from "@/lib/admin/users/getAdminUsers";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "مدیریت کاربران",
};

function StatCard({ title, value, icon: Icon, className }) {
    return (
        <article className="flex items-center gap-4 rounded-[1.5rem] border border-coffee-100 bg-white p-4 shadow-[0_10px_35px_rgba(48,32,26,0.05)]">
            <span
                className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${className}`}
            >
                <Icon size={20} />
            </span>

            <div>
                <p className="text-[11px] font-bold text-coffee-400">{title}</p>
                <p className="mt-1 text-xl font-black text-coffee-950">
                    {Number(value || 0).toLocaleString("fa-IR")}
                </p>
            </div>
        </article>
    );
}

export default async function AdminUsersPage({ searchParams }) {
    const resolvedSearchParams = await searchParams;
    const data = await getAdminUsers(resolvedSearchParams);

    if (!data) {
        redirect("/login?next=/admin/users");
    }

    return (
        <div className="space-y-7">
            <section>
                <p className="text-xs font-bold text-caramel-600">مدیریت حساب‌ها</p>

                <h1 className="mt-2 text-3xl font-black text-coffee-950">کاربران ممد کافی</h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-coffee-500">
                    کاربران، مدیران، وضعیت حساب، تأیید ایمیل و سابقه خرید را از این بخش مدیریت کن.
                </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                <StatCard
                    title="تمام حساب‌ها"
                    value={data.stats.totalAccounts}
                    icon={FiUsers}
                    className="bg-coffee-100 text-coffee-700"
                />

                <StatCard
                    title="کاربران عادی"
                    value={data.stats.customerCount}
                    icon={FiUserCheck}
                    className="bg-blue-50 text-blue-700"
                />

                <StatCard
                    title="مدیران"
                    value={data.stats.adminCount}
                    icon={FiShield}
                    className="bg-caramel-50 text-caramel-700"
                />

                <StatCard
                    title="حساب‌های فعال"
                    value={data.stats.activeCount}
                    icon={FiCheckCircle}
                    className="bg-emerald-50 text-emerald-700"
                />

                <StatCard
                    title="حساب‌های غیرفعال"
                    value={data.stats.inactiveCount}
                    icon={FiUserX}
                    className="bg-red-50 text-red-700"
                />

                <StatCard
                    title="عضویت این ماه"
                    value={data.stats.newThisMonth}
                    icon={FiUserPlus}
                    className="bg-violet-50 text-violet-700"
                />
            </section>

            <UserFilters />

            <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-black text-coffee-950">فهرست کاربران</p>

                <p className="text-xs font-bold text-coffee-400">
                    {data.pagination.total.toLocaleString("fa-IR")} نتیجه
                </p>
            </div>

            <UsersTable users={data.users} currentAdminId={data.currentUser.id} />

            <UsersPagination pagination={data.pagination} />
        </div>
    );
}
