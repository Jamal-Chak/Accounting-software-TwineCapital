'use client'

import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/lib/auth";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <AppLayout>{children}</AppLayout>
        </AuthProvider>
    );
}
