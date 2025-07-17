import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchClientByEmail, fetchProjectsForClient } from "@/lib/notion";
import { AppSidebar } from "@/components/app-sidebar";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import React, { ReactNode } from "react";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function hasProperties(obj: any): obj is { properties: any } {
    return obj && typeof obj === "object" && "properties" in obj;
}

export default async function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    const cookieStore = await cookies();
    const auth = cookieStore.get("auth");
    if (!auth || !auth.value) {
        redirect("/");
    }
    const email = auth.value;
    const clientDatabaseId = process.env.NOTION_DATABASE_CLIENTS_ID!;
    const client = await fetchClientByEmail(clientDatabaseId, email);
    const clientName =
        hasProperties(client) && client.properties?.Name?.type === "title"
            ? (client.properties.Name.title as { plain_text: string }[])[0]?.plain_text
            : "Client";
    const clientType =
        hasProperties(client) &&
            client.properties?.Type?.type === "status" &&
            client.properties.Type.status &&
            typeof client.properties.Type.status === "object" &&
            "name" in client.properties.Type.status
            ? (client.properties.Type.status as { name: string }).name
            : "";
    const projectsDatabaseId = process.env.NOTION_DATABASE_PROJECTS_ID!;
    const projects = await fetchProjectsForClient(projectsDatabaseId, clientName);
    // Convert children to array for safe access
    const childrenArray = React.Children.toArray(children);
    const hasBreadcrumb = childrenArray.length > 0 && (childrenArray[0] as any)?.type?.displayName === 'DashboardBreadcrumb';
    return (
        <SidebarProvider>
            <AppSidebar user={{ name: clientName, email, type: clientType }} projects={projects} />
            <SidebarInset>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-8">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
} 