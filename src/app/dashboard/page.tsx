import { cookies } from "next/headers";
import { getProjectsByClientName, getClientByEmail, getTaskCountsByClientId, getTasksByClientIdAndStatus, TaskRow } from "@/lib/notion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardTable } from "@/components/dashboard-table";

function DashboardBreadcrumb() {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
}
DashboardBreadcrumb.displayName = 'DashboardBreadcrumb';

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const auth = cookieStore.get("auth");
    if (!auth || !auth.value) {
        return null;
    }
    const email = auth.value;
    const clientDatabaseId = process.env.NOTION_DATABASE_CLIENTS_ID!;
    const client = await getClientByEmail(clientDatabaseId, email);
    // const clientName =
    //     client && 'properties' in client && client.properties?.Name?.type === "title"
    //         ? (client.properties.Name.title as { plain_text: string }[])[0]?.plain_text
    //         : "Client";
    const projectsDatabaseId = process.env.NOTION_DATABASE_PROJECTS_ID!;
    const projects = await getProjectsByClientName(projectsDatabaseId, email);
    const databaseId = process.env.NOTION_DATABASE_WORKS_ID!;
    let ongoingCount = 0;
    let completedCount = 0;
    let reviewTasks: TaskRow[] = [];
    if (client?.id) {
        const counts = await getTaskCountsByClientId(databaseId, client.id);
        ongoingCount = counts.ongoing;
        completedCount = counts.completed;
        reviewTasks = await getTasksByClientIdAndStatus(databaseId, client.id, "Client Review");
    }
    // Cards and table content
    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]:pl-2 border-b px-4 mb-4">
                <SidebarTrigger className="-ml-1" />
                <div className="ml-2">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardDescription>Ongoing Projects</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums">{projects.length.toString().padStart(2, "0")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-muted-foreground text-sm">
                            {projects.length === 0
                                ? "No ongoing projects at the moment"
                                : `${projects.length} ongoing project${projects.length > 1 ? "s" : ""}`}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Ongoing Tasks</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums">
                            {ongoingCount.toString().padStart(2, "0")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-muted-foreground text-sm">
                            {ongoingCount === 0
                                ? "No ongoing tasks at the moment"
                                : `${ongoingCount} ongoing task${ongoingCount > 1 ? "s" : ""}`}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Delivered Tasks</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums">{completedCount.toString().padStart(2, "0")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-muted-foreground text-sm">
                            {completedCount === 0
                                ? "No delivered tasks yet"
                                : `${completedCount} delivered task${completedCount > 1 ? "s" : ""}`}
                        </div>
                    </CardContent>
                </Card>
            </div>
            {/* Removed the task table and section header below */}
            {/* <div className="mt-8 w-full">
                <h2 className="text-xl font-semibold mb-4">Tasks</h2>
                <DashboardTable data={data} />
            </div> */}
            {reviewTasks.length > 0 && (
                <div className="mt-8 w-full">
                    <h2 className="text-xl font-semibold mb-4">Waiting for review</h2>
                    <DashboardTable data={reviewTasks} />
                </div>
            )}
        </>
    );
}
