'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
    Bell,
    Search
} from 'lucide-react';
import { AdminSidebar } from "@/app/admin/_components/admin-sidebar";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Don't show sidebar on login page
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full bg-neutral-50 dark:bg-[#0a0a0a]">
                <AdminSidebar />
                <SidebarInset className="flex flex-col h-full overflow-hidden">
                    {/* Header */}
                    <header className="flex h-16 shrink-0 items-center justify-between px-6 bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                            <div className="relative hidden sm:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search everything..."
                                    className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white w-64"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
                                <Bell className="w-4 h-4" />
                                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white dark:border-black"></span>
                            </button>
                            <div className="flex items-center gap-3 pl-4 border-l border-neutral-200 dark:border-neutral-800">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-semibold text-black dark:text-white leading-none">Admin User</p>
                                    <p className="text-[10px] text-neutral-500 mt-0.5 uppercase tracking-wider font-bold">Admin</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center font-bold text-xs text-black dark:text-white">
                                    AD
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-grow overflow-y-auto p-6 md:p-10">
                        <div className="max-w-7-xl mx-auto">
                            {children}
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
