"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiArchive, FiLoader } from "react-icons/fi";

export default function ArticleActions({ article }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const archive = async () => {
        if (!window.confirm("این مقاله بایگانی شود؟")) return;

        setIsLoading(true);

        try {
            const response = await fetch(`/api/admin/articles/${article._id}`, {
                method: "DELETE",
            });

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload.message || "بایگانی مقاله انجام نشد");
            }

            router.refresh();
        } catch (error) {
            window.alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={archive}
            disabled={isLoading || article.status === "archived"}
            className="flex size-10 items-center justify-center rounded-xl border border-coffee-100 bg-white text-red-600 transition hover:bg-red-50 disabled:opacity-30"
            aria-label="بایگانی مقاله"
        >
            {isLoading ? <FiLoader className="animate-spin" /> : <FiArchive />}
        </button>
    );
}
