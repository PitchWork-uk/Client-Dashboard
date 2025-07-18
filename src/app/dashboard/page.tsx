import { cookies } from "next/headers";
import { getProjectsByClientName, getClientByEmail, getTaskCountsByClientId } from "@/lib/notion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { File, Calendar } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { TaskRow } from "@/lib/notion";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

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
    const clientName =
        client && 'properties' in client && client.properties?.Name?.type === "title"
            ? (client.properties.Name.title as { plain_text: string }[])[0]?.plain_text
            : "Client";
    const projectsDatabaseId = process.env.NOTION_DATABASE_PROJECTS_ID!;
    const projects = await getProjectsByClientName(projectsDatabaseId, clientName);
    const databaseId = process.env.NOTION_DATABASE_WORKS_ID!;
    let ongoingCount = 0;
    let completedCount = 0;
    if (client?.id) {
        const counts = await getTaskCountsByClientId(databaseId, client.id);
        ongoingCount = counts.ongoing;
        completedCount = counts.completed;
    }
    const columns: ColumnDef<TaskRow>[] = [
        { accessorKey: "id", header: "ID" },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <div className="flex items-center gap-2 font-semibold text-black">
                    {row.getValue("title")}
                </div>
            ),
        },
        {
            accessorKey: "project",
            header: "Project",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <File size={16} />
                    {row.getValue("project")}
                </div>
            ),
        },
        {
            accessorKey: "date",
            header: () => (
                <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Date</span>
                </div>
            ),
            cell: ({ row }) => (
                <span>{row.getValue("date")}</span>
            ),
        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    {row.getValue("type")}
                </Badge>
            ),
        },
        {
            accessorKey: "priority",
            header: "Priority",
            cell: ({ row }) => {
                const value = row.getValue("priority") as string;
                let badgeClass = "bg-pink-100 text-pink-800 border-pink-200";
                if (value === "Critical") badgeClass = "bg-red-100 text-red-800 border-red-200";
                return (
                    <Badge variant="outline" className={badgeClass}>
                        {value}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const value = row.getValue("status") as string;
                let badgeClass = "bg-blue-100 text-blue-800 border-blue-200";
                if (value === "Waiting for approval") badgeClass = "bg-yellow-100 text-yellow-800 border-yellow-200";
                return (
                    <Badge variant="outline" className={badgeClass}>
                        {value}
                    </Badge>
                );
            },
        },
    ];
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
        </>
    );
}
