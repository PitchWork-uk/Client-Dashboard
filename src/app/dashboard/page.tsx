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
import { DashboardClient } from "@/components/dashboard-client";
import { 
    FolderOpen, 
    Clock, 
    CheckCircle2,
} from "lucide-react";

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

    const totalTasks = ongoingCount + completedCount;
    const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
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

            {/* Welcome Section */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
                <p className="text-muted-foreground">
                    Here&apos;s an overview of your projects and tasks.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ongoing Projects</CardTitle>
                        <FolderOpen className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{projects.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {projects.length === 0
                                ? "No ongoing projects"
                                : `${projects.length} active project${projects.length > 1 ? "s" : ""}`}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ongoing Tasks</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ongoingCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {ongoingCount === 0
                                ? "No ongoing tasks"
                                : `${ongoingCount} task${ongoingCount > 1 ? "s" : ""} in progress`}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedCount}</div>
                        <p className="text-xs text-muted-foreground">
                            {completedCount === 0
                                ? "No completed tasks"
                                : `${completedCount} task${completedCount > 1 ? "s" : ""} delivered`}
                        </p>
                    </CardContent>
                </Card>
            </div>



            {/* Review Tasks Section */}
            <DashboardClient reviewTasks={reviewTasks} databaseId={databaseId} />
        </div>
    );
}
