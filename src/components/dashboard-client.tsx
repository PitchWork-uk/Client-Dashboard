"use client";

import { useState } from "react";
import { DashboardTable } from "./dashboard-table";
import { TaskRow } from "@/lib/notion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { RotateCcw, Clock, CheckCircle2 } from "lucide-react";
import { ApproveTaskButton } from "./approve-task-button";

interface DashboardClientProps {
    reviewTasks: TaskRow[];
    databaseId: string;
}

export function DashboardClient({ reviewTasks: initialReviewTasks, databaseId }: DashboardClientProps) {
    const [reviewTasks] = useState(initialReviewTasks);
    const [isReviseDialogOpen, setIsReviseDialogOpen] = useState(false);
    const [reviseTask, setReviseTask] = useState<TaskRow | null>(null);
    const [isReviseLoading, setIsReviseLoading] = useState(false);

    const handleTaskApproved = () => {
        // Remove the approved task from the list
        // In a real implementation, you might want to refetch the data
        // For now, we'll just remove the task from the local state
        // This is a simplified approach - ideally you'd refetch from the server
        window.location.reload(); // Simple refresh for now
    };

    const handleRevise = async () => {
        if (!reviseTask) return;

        setIsReviseLoading(true);
        try {
            const response = await fetch("/api/update-task-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uniqueIdNumber: reviseTask.uniqueIdNumber?.toString() || reviseTask.id,
                    databaseId,
                    status: "Revision",
                }),
            });

            if (response.ok) {
                setIsReviseDialogOpen(false);
                setReviseTask(null);
                window.location.reload();
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error("Failed to request revision:", errorData.error || "Unknown error");
            }
        } catch (error) {
            console.error("Error requesting revision:", error);
        } finally {
            setIsReviseLoading(false);
        }
    };

    if (reviewTasks.length === 0) {
        return (
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        All Tasks Reviewed
                    </CardTitle>
                    <CardDescription>
                        No tasks are currently waiting for review. Great job!
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    Waiting for Review
                    <Badge variant="secondary" className="ml-2">
                        {reviewTasks.length}
                    </Badge>
                </CardTitle>
                <CardDescription>
                    Tasks that have been completed and are ready for your approval
                </CardDescription>
            </CardHeader>
            <CardContent >
                <DashboardTable
                    data={reviewTasks}
                    showApproveColumn={true}
                    hideFilesColumn
                    databaseId={databaseId}
                    onTaskApproved={handleTaskApproved}
                    extraColumns={[
                        {
                            id: "revise",
                            header: "",
                            cell: ({ row }: { row: { original: TaskRow } }) => {
                                const task = row.original;
                                return (
                                    <div className="flex items-center gap-4">
                                        <Dialog open={isReviseDialogOpen && reviseTask?.id === task.id} onOpenChange={(open) => {
                                            if (!open) {
                                                setIsReviseDialogOpen(false);
                                                setReviseTask(null);
                                            }
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white"
                                                    onClick={() => {
                                                        setReviseTask(task);
                                                        setIsReviseDialogOpen(true);
                                                    }}
                                                >
                                                    <RotateCcw size={16} />
                                                    Revise
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Request Revision</DialogTitle>
                                                    <DialogDescription>
                                                        Are you sure you want to request a revision for this task? This will change the status to &ldquo;Revision&ldquo;.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="py-4">
                                                    <p className="text-sm text-muted-foreground">
                                                        <strong>Task:</strong> {task.title}
                                                    </p>
                                                </div>
                                                <DialogFooter>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            setIsReviseDialogOpen(false);
                                                            setReviseTask(null);
                                                        }}
                                                        disabled={isReviseLoading}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={handleRevise}
                                                        disabled={isReviseLoading}
                                                        className="bg-orange-600 hover:bg-orange-700"
                                                    >
                                                        {isReviseLoading ? "Requesting..." : "Request Revision"}
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                );
                            },
                            enableSorting: false,
                        },
                    ]}
                />
            </CardContent>
        </Card>
    );
} 