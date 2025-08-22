"use client"

import * as React from "react"
import {
    File,
    Home,
    Settings,
    User,
    LogOut,
    Plus,
    FolderOpen,
    BarChart3,
    Calendar,
    MessageSquare
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    useSidebar,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

export function AppSidebar({ user, projects = [], ...props }: { user: { name: string; email: string; type: string }; projects?: { id: string; name: string }[] } & React.ComponentProps<typeof Sidebar>) {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";
    
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className={isCollapsed ? "flex justify-center items-center w-full mt-6" : "w-full mt-6 flex items-center pl-4"}>
                    {isCollapsed ? (
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500 text-white">
                            <span className="font-bold text-sm">PW</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500 text-white">
                                <span className="font-bold text-sm">PW</span>
                            </div>
                            <span className="text-xl font-bold text-orange-600">ProjectWorks</span>
                        </div>
                    )}
                </div>
            </SidebarHeader>
            <SidebarContent>
                {/* Quick Actions */}
                <SidebarGroup className="mt-4">
                    <SidebarGroupLabel className={isCollapsed ? "justify-center" : undefined}>
                        {!isCollapsed && "Quick Actions"}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a href="/dashboard" className="flex items-center gap-3">
                                        <Home size={20} />
                                        {!isCollapsed && <span>Dashboard</span>}
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a href="#" className="flex items-center gap-3">
                                        <Plus size={20} />
                                        {!isCollapsed && <span>New Project</span>}
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Navigation */}
                <SidebarGroup className="mt-6">
                    <SidebarGroupLabel className={isCollapsed ? "justify-center" : undefined}>
                        {!isCollapsed && "Navigation"}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a href="#" className="flex items-center gap-3">
                                        <BarChart3 size={20} />
                                        {!isCollapsed && <span>Analytics</span>}
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a href="#" className="flex items-center gap-3">
                                        <Calendar size={20} />
                                        {!isCollapsed && <span>Calendar</span>}
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a href="#" className="flex items-center gap-3">
                                        <MessageSquare size={20} />
                                        {!isCollapsed && <span>Messages</span>}
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Projects section */}
                {projects.length > 0 && (
                    <SidebarGroup className="mt-6">
                        <SidebarGroupLabel className={isCollapsed ? "justify-center" : undefined}>
                            {!isCollapsed && "Projects"}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {projects.map((project) => (
                                    <SidebarMenuItem key={project.id}>
                                        <SidebarMenuButton asChild>
                                            <a
                                                href={`/dashboard/project/${project.id}`}
                                                className="flex items-center gap-3"
                                            >
                                                <FolderOpen size={20} />
                                                {!isCollapsed && <span>{project.name}</span>}
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>
            <SidebarFooter>
                <div className={isCollapsed ? "flex justify-center items-center w-full pb-4" : "w-full pb-4"}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className={isCollapsed ? "w-10 h-10 rounded-full p-0" : "w-full justify-start gap-3"}
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/avatars/user.jpg" alt={user.name} />
                                    <AvatarFallback className="bg-orange-100 text-orange-600">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                {!isCollapsed && (
                                    <div className="flex flex-col items-start text-sm">
                                        <span className="font-medium flex items-center gap-1">
                                            {user.name}
                                            {user.type && (
                                                <Badge className="ml-1 text-[10px] font-semibold bg-orange-500 text-white">{user.type}</Badge>
                                            )}
                                        </span>
                                        <span className="text-muted-foreground">{user.email}</span>
                                    </div>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <div className="flex items-center gap-1">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        {user.type && (
                                            <Badge className="ml-1 text-[10px] font-semibold bg-orange-500 text-white">{user.type}</Badge>
                                        )}
                                    </div>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
