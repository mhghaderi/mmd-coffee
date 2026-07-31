"use client";

import { StoreProvider } from "@/context/StoreContext";

export default function AppProviders({ children }) {
    return <StoreProvider>{children}</StoreProvider>;
}
