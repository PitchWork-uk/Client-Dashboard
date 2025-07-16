import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchTasksFromNotion, TaskRow } from "@/lib/notion";
import { DashboardTable } from "@/components/dashboard-table";

import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Plus, File, User, Calendar } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

export default async function Page() {
    const cookieStore = await cookies();
    const auth = cookieStore.get("auth");
    if (!auth || auth.value !== "1") {
        redirect("/");
    }
    const databaseId = process.env.NOTION_DATABASE_WORKS_ID!;
    const data = await fetchTasksFromNotion(databaseId);
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
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]:pl-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <span className="text-lg font-semibold ml-2">Dashboard</span>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-8">
                    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardDescription>Ongoing Projects</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums">00</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-muted-foreground text-sm">No ongoing projects at the moment</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardDescription>Ongoing Tasks</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums">
                                    {data.length.toString().padStart(2, "0")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-muted-foreground text-sm">
                                    {data.length === 0
                                        ? "No ongoing tasks at the moment"
                                        : `${data.length} ongoing task${data.length > 1 ? "s" : ""}`}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardDescription>Delivered Tasks</CardDescription>
                                <CardTitle className="text-2xl font-semibold tabular-nums">00</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-muted-foreground text-sm">No delivered tasks yet</div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="mt-8 w-full">
                        <h2 className="text-xl font-semibold mb-4">Tasks</h2>
                        <DashboardTable data={data} />
                    </div>
                    <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
