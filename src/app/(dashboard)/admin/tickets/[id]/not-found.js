import Link from "next/link";
import { FiArrowRight, FiMessageSquare } from "react-icons/fi";

export default function TicketNotFound() {
    return (
        <section className="flex min-h-[calc(100vh-160px)] items-center justify-center">
            <div className="w-full max-w-xl rounded-[2rem] border border-coffee-100 bg-white p-10 text-center">
                <FiMessageSquare className="mx-auto text-5xl text-coffee-300" />
                <h1 className="mt-6 text-3xl font-black text-coffee-950">تیکت پیدا نشد</h1>
                <Link href="/admin/tickets" className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-coffee-900 px-6 text-sm font-black text-white">
                    <FiArrowRight />
                    بازگشت
                </Link>
            </div>
        </section>
    );
}
