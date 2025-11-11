"use client";

import * as React from "react";
import { Home, FolderOpen, Share2 } from "lucide-react";

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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function AppSidebar({
  user,
  projects = [],
  ...props
}: {
  user: { name: string; email: string; type: string };
  projects?: { id: string; name: string }[];
} & React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/dashboard?email=${encodeURIComponent(
      user.email
    )}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div
          className={
            isCollapsed
              ? "flex justify-center items-center w-full mt-6"
              : "w-full mt-6 flex items-center pl-4"
          }
        >
          {isCollapsed ? (
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500 text-white">
              <span className="font-bold text-sm">PW</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-500 text-white">
                <span className="font-bold text-sm">PW</span>
              </div>
              <span className="text-xl font-bold text-orange-600">
                PitchWork
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Quick Actions */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel
            className={isCollapsed ? "justify-center" : undefined}
          >
            {!isCollapsed && "Quick Actions"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a
                    href={`/dashboard?email=${encodeURIComponent(user.email)}`}
                    className="flex items-center gap-3"
                  >
                    <Home size={20} />
                    {!isCollapsed && <span>Dashboard</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects section */}
        {projects.length > 0 && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel
              className={isCollapsed ? "justify-center" : undefined}
            >
              {!isCollapsed && "Projects"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {projects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton asChild>
                      <a
                        href={`/dashboard/project/${
                          project.id
                        }?email=${encodeURIComponent(user.email)}`}
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
        <div
          className={
            isCollapsed
              ? "flex flex-col justify-center items-center w-full pb-4"
              : "w-full pb-4"
          }
        >
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/user.jpg" alt={user.name} />
                  <AvatarFallback className="bg-orange-100 text-orange-600">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-sm flex-1 min-w-0">
                  <span className="font-medium flex items-center gap-1">
                    {user.name}
                    {user.type && (
                      <Badge className="ml-1 text-[10px] font-semibold bg-orange-500 text-white">
                        {user.type}
                      </Badge>
                    )}
                  </span>
                  <span className="text-muted-foreground truncate w-full">
                    {user.email}
                  </span>
                </div>
              </div>
              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                size="sm"
              >
                <Share2 className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Share"}
              </Button>
            </>
          ) : (
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/user.jpg" alt={user.name} />
              <AvatarFallback className="bg-orange-100 text-orange-600">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
