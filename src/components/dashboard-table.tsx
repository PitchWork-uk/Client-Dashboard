"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { File, Calendar } from "lucide-react";
import { Figma, File as FileIcon, FolderOpen } from "lucide-react";
import {
    ColumnDef,
    SortingState,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    flexRender,
    Row,
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
import { ApproveTaskButton } from "./approve-task-button";

interface DashboardTableProps {
    data: TaskRow[];
    hideFilesColumn?: boolean;
    extraColumns?: ColumnDef<TaskRow>[];
    showApproveColumn?: boolean;
    databaseId?: string;
    onTaskApproved?: () => void;
}

export function DashboardTable({ data, hideFilesColumn, extraColumns, showApproveColumn, databaseId, onTaskApproved }: DashboardTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);

    let columns: ColumnDef<TaskRow>[] = [
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
            cell: ({ row }: { row: Row<TaskRow> }) => (
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
            cell: ({ row }: { row: Row<TaskRow> }) => (
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
            cell: ({ row }: { row: Row<TaskRow> }) => <span>{row.getValue("date")}</span>,
        },
        {
            accessorKey: "type",
            header: "Type",
            enableSorting: false,
            cell: ({ row }: { row: Row<TaskRow> }) => (
                <Badge variant="outline" className={row.original.typeColor}>
                    {row.getValue("type")}
                </Badge>
            ),
        },
        {
            accessorKey: "priority",
            header: "Priority",
            enableSorting: false,
            cell: ({ row }: { row: Row<TaskRow> }) => (
                <Badge variant="outline" className={row.original.priorityColor}>
                    {row.getValue("priority")}
                </Badge>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            enableSorting: false,
            cell: ({ row }: { row: Row<TaskRow> }) => (
                <Badge variant="outline" className={row.original.statusColor}>
                    {row.getValue("status")}
                </Badge>
            ),
        },
        // Files column (conditionally included)
        ...(!hideFilesColumn ? [{
            id: "view",
            header: "Files",
            cell: ({ row }: { row: Row<TaskRow> }) => {
                const status = row.original.status;
                const deliverables = row.original.deliverables;
                if ((status === "Completed" || status === "Client Review") && deliverables && deliverables.length > 0) {
                    return (
                        <div className="flex gap-2 justify-start">
                            {deliverables.map((url, idx) => {
                                let Icon = FileIcon;
                                if (/figma\.com/.test(url)) {
                                    Icon = Figma;
                                } else if (/drive\.google\.com/.test(url)) {
                                    Icon = FolderOpen;
                                }
                                return (
                                    <a
                                        key={url + idx}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 cursor-pointer px-2 py-1 text-sm text-black rounded bg-gray-100 hover:bg-green-600 hover:text-white transition-colors"
                                        title="Open file"
                                    >
                                        <Icon size={20} />
                                    </a>
                                );
                            })}
                        </div>
                    );
                }
                return null;
            },
            enableSorting: false,
        }] : []),
        // Approve column (conditionally included)
        ...(showApproveColumn ? [{
            id: "approve",
            header: "Actions",
            cell: ({ row }: { row: Row<TaskRow> }) => {
                if (!databaseId) return null;
                return (
                    <ApproveTaskButton
                        taskId={row.original.uniqueIdNumber?.toString() || row.original.id}
                        taskTitle={row.original.title}
                        databaseId={databaseId}
                        onApprove={onTaskApproved}
                    />
                );
            },
            enableSorting: false,
        }] : []),
    ];
    if (extraColumns && extraColumns.length > 0) {
        columns = [...columns, ...extraColumns];
    }

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