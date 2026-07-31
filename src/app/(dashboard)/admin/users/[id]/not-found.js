import Link from "next/link";
import { FiArrowRight, FiUserX } from "react-icons/fi";

export default function AdminUserNotFound() {
    return (
        <section className="flex min-h-[calc(100vh-160px)] items-center justify-center">
            <div className="w-full max-w-xl rounded-[2rem] border border-coffee-100 bg-white p-8 text-center shadow-[0_20px_65px_rgba(48,32,26,0.08)] sm:p-12">
                <span className="mx-auto flex size-20 items-center justify-center rounded-[1.75rem] bg-red-50 text-red-600">
                    <FiUserX size={30} />
                </span>

                <h1 className="mt-6 text-3xl font-black text-coffee-950">
                    کاربر پیدا نشد
                </h1>

                <p className="mt-4 text-sm leading-8 text-coffee-500">
                    حساب موردنظر وجود ندارد یا شناسه واردشده معتبر نیست.
                </p>

                <Link
                    href="/admin/users"
                    className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-coffee-900 px-6 text-sm font-black text-white transition hover:bg-coffee-800"
                >
                    <FiArrowRight className="text-current" />
                    <span className="text-current">بازگشت به کاربران</span>
                </Link>
            </div>
        </section>
    );
}
