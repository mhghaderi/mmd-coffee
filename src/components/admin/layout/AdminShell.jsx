"use client";

import { usePathname } from "next/navigation";

import { useEffect, useState } from "react";

import AdminHeader from "@/components/admin/layout/AdminHeader";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";

export default function AdminShell({ user, children }) {
    const pathname = usePathname();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!isSidebarOpen) {
            return;
        }

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setIsSidebarOpen(false);
            }
        };

        document.body.style.overflow = "hidden";

        document.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = "";

            document.removeEventListener("keydown", handleEscape);
        };
    }, [isSidebarOpen]);

    return (
        <div className="min-h-screen bg-cream-50">
            <AdminSidebar
                user={user}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="min-h-screen lg:pr-[280px]">
                <AdminHeader user={user} onMenuOpen={() => setIsSidebarOpen(true)} />

                <main className="p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
