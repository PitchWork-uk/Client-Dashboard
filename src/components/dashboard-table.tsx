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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
                <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    ID
                    {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
                </Button>
            ),
            enableSorting: true,
            cell: ({ row }) => (
                <span className="font-mono text-sm text-muted-foreground">
                    #{row.getValue("id")}
                </span>
            ),
        },
        {
            accessorKey: "title",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Title
                    {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
                </Button>
            ),
            enableSorting: true,
            cell: ({ row }: { row: Row<TaskRow> }) => (
                <div className="font-medium">
                    {row.getValue("title")}
                </div>
            ),
        },
        {
            accessorKey: "project",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Project
                    {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
                </Button>
            ),
            enableSorting: true,
            cell: ({ row }: { row: Row<TaskRow> }) => (
                <div className="flex items-center gap-2">
                    <File size={16} className="text-muted-foreground" />
                    <span className="text-sm">{row.getValue("project")}</span>
                </div>
            ),
        },
        {
            accessorKey: "date",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <Calendar size={16} className="mr-1" />
                    Date
                    {column.getIsSorted() === "asc" ? " ↑" : column.getIsSorted() === "desc" ? " ↓" : ""}
                </Button>
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
            cell: ({ row }: { row: Row<TaskRow> }) => (
                <span className="text-sm text-muted-foreground">{row.getValue("date")}</span>
            ),
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
                        <div className="flex gap-1">
                            {deliverables.map((url, idx) => {
                                let Icon = FileIcon;
                                if (/figma\.com/.test(url)) {
                                    Icon = Figma;
                                } else if (/drive\.google\.com/.test(url)) {
                                    Icon = FolderOpen;
                                }
                                return (
                                    <Button
                                        key={url + idx}
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        asChild
                                    >
                                        <a
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Open file"
                                        >
                                            <Icon size={16} />
                                        </a>
                                    </Button>
                                );
                            })}
                        </div>
                    );
                }
                return <span className="text-muted-foreground text-sm">-</span>;
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
                        feedbackUrl={row.original.feedbackUrl}
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
        <Card className="py-0 shadow-none border-0">
            <CardContent className="p-0">
                <div className="rounded-md">
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
                                        className="hover:bg-muted/50"
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
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <FileIcon className="h-8 w-8" />
                                            <p>No tasks found.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
} 