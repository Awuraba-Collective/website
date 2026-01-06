"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users,
    Settings,
    MoreVertical,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"

const sidebarLinks = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"
    console.log(state)

    return (
        <Sidebar
            collapsible="icon"
            className="bg-black text-white border-neutral-800"
            {...props}
        >
            <SidebarHeader className="h-16 flex items-center justify-center bg-black border-b border-neutral-800">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent active:bg-transparent px-0">
                            <Link href="/admin" className="flex items-center justify-center py-2">
                                {isCollapsed ? (
                                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden">
                                        <Image
                                            src="/logos/icon.png"
                                            alt="Awuraba Icon"
                                            width={32}
                                            height={32}
                                            className="object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex w-full px-4">
                                        <Image
                                            src="/logos/white.svg"
                                            alt="Awuraba Logo"
                                            width={150}
                                            height={40}
                                            className="object-contain"
                                        />
                                    </div>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="bg-black">
                <SidebarMenu className="px-2 pt-4">
                    {sidebarLinks.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href
                        return (
                            <SidebarMenuItem key={link.name}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={link.name}
                                    isActive={isActive}
                                    className={`py-6 transition-colors ${isActive
                                        ? "bg-white text-black hover:bg-white/90"
                                        : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                                        }`}
                                >
                                    <Link href={link.href}>
                                        <Icon className="size-5" />
                                        <span className="font-medium">{link.name}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="bg-black border-t border-neutral-800">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" className="hover:bg-neutral-900 text-white">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-neutral-800 border border-neutral-700">
                                <span className="text-xs font-bold">AD</span>
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none overflow-hidden">
                                <span className="font-medium text-sm truncate">Admin User</span>
                                <span className="text-xs text-neutral-500 truncate">Super Admin</span>
                            </div>
                            <MoreVertical className="ml-auto size-4 text-neutral-400" />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
