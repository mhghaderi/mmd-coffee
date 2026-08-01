import Link from "next/link";
import { FiArrowRight, FiCoffee } from "react-icons/fi";

export default function ArticleNotFound() {
    return (
        <main className="page-container flex min-h-[70vh] items-center justify-center py-16">
            <section className="w-full max-w-xl rounded-[2rem] border border-coffee-100 bg-white p-10 text-center">
                <FiCoffee className="mx-auto text-5xl text-coffee-300" />
                <h1 className="mt-6 text-3xl font-black text-coffee-950">مقاله پیدا نشد</h1>
                <p className="mt-3 text-sm leading-7 text-coffee-500">
                    مقاله حذف شده، بایگانی شده یا آدرس آن تغییر کرده است.
                </p>
                <Link href="/blog" className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-coffee-900 px-6 text-sm font-black text-white">
                    <FiArrowRight />
                    بازگشت به مجله
                </Link>
            </section>
        </main>
    );
}
