"use client"

import { ChevronsUpDown, LogOut } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation";

export function NavUser({
    user,
}: {
    user: {
        name: string
        email: string
        type: string
    }
}) {
    const { isMobile, state } = useSidebar();
    const isCollapsed = state === "collapsed";
    const router = useRouter();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className={
                                `data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ` +
                                (isCollapsed ? "justify-center p-0 w-12 h-12" : "")
                            }
                        >
                            <div className={isCollapsed ? "h-8 w-8 rounded-lg bg-black flex items-center justify-center text-white font-bold text-lg" : "h-8 w-8 rounded-lg bg-black flex items-center justify-center text-white font-bold text-lg"}>
                                {user.name?.[0] || "U"}
                            </div>
                            {!isCollapsed && (
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium flex items-center gap-1">
                                        {user.name}
                                        {user.type && (
                                            <Badge className="ml-1 text-[10px] font-semibold bg-purple-600 text-white">{user.type}</Badge>
                                        )}
                                    </span>
                                </div>
                            )}
                            <ChevronsUpDown className={isCollapsed ? "hidden" : "ml-auto size-4"} />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center text-white font-bold text-lg">{user.name?.[0] || "U"}</div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{user.name}</span>
                                    {user.type && (
                                        <Badge className="mt-0.5 text-[10px] font-semibold bg-purple-600 text-white">{user.type}</Badge>
                                    )}
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={async () => {
                                await fetch("/api/logout", { method: "POST" });
                                router.push("/");
                            }}
                        >
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
