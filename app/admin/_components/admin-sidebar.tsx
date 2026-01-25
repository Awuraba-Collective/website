"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Settings,
  LogOut,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

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
} from "@/components/ui/sidebar";
import { useUser } from "@/hooks/use-user";

const sidebarLinks = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const user = useUser();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/admin/login");
  };

  return (
    <Sidebar
      collapsible="icon"
      className="bg-black text-white border-neutral-800"
      {...props}
    >
      <SidebarHeader className="h-16 flex items-center justify-center bg-black border-b border-neutral-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-transparent active:bg-transparent px-0"
            >
              <Link
                href="/admin"
                className="flex items-center justify-center py-2"
              >
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
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <SidebarMenuItem key={link.name}>
                <SidebarMenuButton
                  asChild
                  tooltip={link.name}
                  isActive={isActive}
                  className={`py-6 transition-colors ${
                    isActive
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
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="bg-black border-t border-neutral-800">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="hover:bg-neutral-900 text-white"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-neutral-800 border border-neutral-700">
                    <span className="text-xs font-bold">
                      {user?.name?.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none overflow-hidden">
                    <span className="font-medium text-sm truncate">
                      {user?.name}
                    </span>
                    <span className="text-xs text-neutral-500 truncate">
                      Super Admin
                    </span>
                  </div>
                  <MoreVertical className="ml-auto size-4 text-neutral-400" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-56 bg-neutral-900 border-neutral-800"
              >
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-400 focus:text-red-400 focus:bg-neutral-800 cursor-pointer"
                >
                  <LogOut className="mr-2 size-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
