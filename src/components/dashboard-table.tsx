"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { File, Calendar } from "lucide-react";
import {
    ColumnDef,
    SortingState,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    flexRender,
} from "@tanstack/react-table";
import { TaskRow } from "@/lib/notion";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface DashboardTableProps {
    data: TaskRow[];
}

export function DashboardTable({ data }: DashboardTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    const columns: ColumnDef<TaskRow>[] = [
        {
            accessorKey: "id",
            header: ({ column }) => (
                <button
                    className="flex items-center gap-1"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    ID
                    {column.getIsSorted() === "asc" ? "↑" : column.getIsSorted() === "desc" ? "↓" : ""}
                </button>
            ),
            enableSorting: true,
        },
        {
            accessorKey: "title",
            header: ({ column }) => (
                <button
                    className="flex items-center gap-1"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Title
                    {column.getIsSorted() === "asc" ? "↑" : column.getIsSorted() === "desc" ? "↓" : ""}
                </button>
            ),
            enableSorting: true,
            cell: ({ row }) => (
                <div className="flex items-center gap-2 font-semibold text-black">
                    {row.getValue("title")}
                </div>
            ),
        },
        {
            accessorKey: "project",
            header: ({ column }) => (
                <button
                    className="flex items-center gap-1"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Project
                    {column.getIsSorted() === "asc" ? "↑" : column.getIsSorted() === "desc" ? "↓" : ""}
                </button>
            ),
            enableSorting: true,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <File size={16} />
                    {row.getValue("project")}
                </div>
            ),
        },
        {
            accessorKey: "date",
            header: ({ column }) => (
                <button
                    className="flex items-center gap-1"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <Calendar size={16} />
                    <span>Date</span>
                    {column.getIsSorted() === "asc" ? "↑" : column.getIsSorted() === "desc" ? "↓" : ""}
                </button>
            ),
            enableSorting: true,
            sortingFn: (rowA, rowB, columnId) => {
                // Custom sort for date range strings
                const getStartDate = (val: string) => {
                    const dateStr = val.split("→")[0].trim();
                    return new Date(dateStr).getTime();
                };
                return getStartDate(rowA.getValue(columnId)) - getStartDate(rowB.getValue(columnId));
            },
            cell: ({ row }) => <span>{row.getValue("date")}</span>,
        },
        {
            accessorKey: "type",
            header: "Type",
            enableSorting: false,
            cell: ({ row }) => (
                <Badge variant="outline" className={row.original.typeColor}>
                    {row.getValue("type")}
                </Badge>
            ),
        },
        {
            accessorKey: "priority",
            header: "Priority",
            enableSorting: false,
            cell: ({ row }) => (
                <Badge variant="outline" className={row.original.priorityColor}>
                    {row.getValue("priority")}
                </Badge>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            enableSorting: false,
            cell: ({ row }) => (
                <Badge variant="outline" className={row.original.statusColor}>
                    {row.getValue("status")}
                </Badge>
            ),
        },
        // Add a column for the View button
        {
            id: "view",
            header: "",
            cell: ({ row }) => (
                <div className="flex justify-end">
                    {row.original.url && (
                        <a
                            href={row.original.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 text-sm text-black rounded bg-gray-100 hover:bg-green-600 hover:text-white  transition-colors"
                        >
                            View
                        </a>
                    )}
                </div>
            ),
            enableSorting: false,
        },
    ];

    const table = useReactTable({
        data,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
} 