"use client";

import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { File, Calendar } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { TaskRow } from "@/lib/notion";

interface DashboardTableProps {
    data: TaskRow[];
}

export function DashboardTable({ data }: DashboardTableProps) {
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
            cell: ({ row }) => <span>{row.getValue("date")}</span>,
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

    return <DataTable columns={columns} data={data} />;
} 