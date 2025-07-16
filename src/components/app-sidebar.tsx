"use client"

import * as React from "react"
import {
    AudioWaveform,
    BookOpen,
    Bot,
    Command,
    Frame,
    GalleryVerticalEnd,
    Map,
    PieChart,
    Settings2,
    SquareTerminal,
    File,
    Home,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
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
} from "@/components/ui/sidebar"
import Image from "next/image"

// This is sample data.
const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    teams: [
        {
            name: "Acme Inc",
            logo: GalleryVerticalEnd,
            plan: "Enterprise",
        },
        {
            name: "Acme Corp.",
            logo: AudioWaveform,
            plan: "Startup",
        },
        {
            name: "Evil Corp.",
            logo: Command,
            plan: "Free",
        },
    ],
    navMain: [
        {
            title: "Playground",
            url: "#",
            icon: SquareTerminal,
            isActive: true,
            items: [
                {
                    title: "History",
                    url: "#",
                },
                {
                    title: "Starred",
                    url: "#",
                },
                {
                    title: "Settings",
                    url: "#",
                },
            ],
        },
        {
            title: "Models",
            url: "#",
            icon: Bot,
            items: [
                {
                    title: "Genesis",
                    url: "#",
                },
                {
                    title: "Explorer",
                    url: "#",
                },
                {
                    title: "Quantum",
                    url: "#",
                },
            ],
        },
        {
            title: "Documentation",
            url: "#",
            icon: BookOpen,
            items: [
                {
                    title: "Introduction",
                    url: "#",
                },
                {
                    title: "Get Started",
                    url: "#",
                },
                {
                    title: "Tutorials",
                    url: "#",
                },
                {
                    title: "Changelog",
                    url: "#",
                },
            ],
        },
        {
            title: "Settings",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "General",
                    url: "#",
                },
                {
                    title: "Team",
                    url: "#",
                },
                {
                    title: "Billing",
                    url: "#",
                },
                {
                    title: "Limits",
                    url: "#",
                },
            ],
        },
    ],
    projects: [
        {
            name: "Design Engineering",
            url: "#",
            icon: Frame,
        },
        {
            name: "Sales & Marketing",
            url: "#",
            icon: PieChart,
        },
        {
            name: "Travel",
            url: "#",
            icon: Map,
        },
    ],
}

export function AppSidebar({ user, projects = [], ...props }: { user: { name: string; email: string; type: string }; projects?: { id: string; name: string }[] } & React.ComponentProps<typeof Sidebar>) {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className={isCollapsed ? "flex justify-center items-center w-full mt-6" : "w-full mt-6 flex items-center pl-4"}>
                    {isCollapsed ? (
                        <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500">
                            <span className="text-white font-bold text-sm">PW</span>
                        </div>
                    ) : (
                        <Image src="/logo.svg" alt="Logo" width={150} height={48} />
                    )}
                </div>
            </SidebarHeader>
            <SidebarContent>
                {/* General section */}
                <SidebarGroup className="mt-4">
                    <SidebarGroupLabel className={isCollapsed ? "justify-center" : undefined}>
                        {!isCollapsed && "General"}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <a
                            href="/dashboard"
                            className={isCollapsed ? "flex  items-center justify-center  rounded-md hover:bg-muted transition-colors font-medium p-1" : "flex items-center  gap-3 px-4 py-2 rounded-md hover:bg-muted transition-colors font-medium"}
                        >
                            <Home size={20} />
                            {!isCollapsed && <span>Home</span>}
                        </a>
                    </SidebarGroupContent>
                </SidebarGroup>
                {/* Projects section */}
                <SidebarGroup className="mt-6">
                    <SidebarGroupLabel className={isCollapsed ? "justify-center" : undefined}>
                        {!isCollapsed && "Projects"}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        {projects.map((project) => (
                            <a
                                key={project.id}
                                href="#"
                                className={isCollapsed ? "flex items-center justify-center  rounded-md hover:bg-muted transition-colors font-medium p-1" : "flex items-center gap-3 px-4 py-2 rounded-md hover:bg-muted transition-colors font-medium"}
                            >
                                <File size={20} />
                                {!isCollapsed && <span>{project.name}</span>}
                            </a>
                        ))}
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className={isCollapsed ? "flex justify-center items-center w-full pb-4" : undefined}>
                    <NavUser user={user} />
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
