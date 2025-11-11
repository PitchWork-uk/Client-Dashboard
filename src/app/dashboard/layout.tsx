import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getClientByEmail, getProjectsByClientName } from "@/lib/notion";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React, { ReactNode } from "react";

function hasProperties(obj: unknown): obj is { properties: { [key: string]: unknown } } {
    return typeof obj === "object" && obj !== null && "properties" in obj;
}

export default async function DashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    const headersList = await headers();
    // Get email from middleware-set header (most reliable)
    let email = headersList.get("x-email");
    
    // Fallback: Try to get email from referer header (works when navigating from homepage)
    if (!email) {
        const referer = headersList.get("referer");
        if (referer) {
            try {
                const url = new URL(referer);
                email = url.searchParams.get("email");
            } catch {
                // Invalid URL in referer
            }
        }
    }
    
    if (!email) {
        redirect("/");
    }
    const clientDatabaseId = process.env.NOTION_DATABASE_CLIENTS_ID!;
    const client = await getClientByEmail(clientDatabaseId, email);
    
    // Check if client exists
    if (!client) {
        redirect("/?error=Client+not+found");
    }
    
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
    const projects = await getProjectsByClientName(projectsDatabaseId, email);
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