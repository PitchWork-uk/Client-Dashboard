"use client";
import { useState } from "react";
import { DashboardTable } from "@/components/dashboard-table";
import type { TaskRow } from "@/lib/notion";
import { ApproveTaskButton } from "./approve-task-button";
import { Button } from "@/components/ui/button";
import { Plus, RotateCcw } from "lucide-react";
import { CreateTaskSheet } from "./create-task-sheet";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function ProjectTasksTabs({ tasks, onRefetch, databaseId, projectId }: { tasks: TaskRow[], onRefetch?: () => void, databaseId: string, projectId?: string }) {
    const [tab, setTab] = useState("ongoing");
    const [localTasks] = useState(tasks);
    const [isCreateTaskSheetOpen, setIsCreateTaskSheetOpen] = useState(false);
    const [isReviseDialogOpen, setIsReviseDialogOpen] = useState(false);
    const [reviseTask, setReviseTask] = useState<TaskRow | null>(null);
    const [isReviseLoading, setIsReviseLoading] = useState(false);

    const ongoingTasks = localTasks.filter(
        (task) => task.status !== "Client Review" && task.status !== "Completed"
    );
    const reviewTasks = localTasks.filter((task) => task.status === "Client Review");
    const completedTasks = localTasks.filter((task) => task.status === "Completed");

    const handleTaskApproved = () => {
        // Refetch all data if callback provided
        if (onRefetch) {
            onRefetch();
        } else {
            // Simple refresh for now
            window.location.reload();
        }
    };

    const handleCreateTask = () => {
        setIsCreateTaskSheetOpen(true);
    };

    const handleRevise = async () => {
        if (!reviseTask) return;
        
        setIsReviseLoading(true);
        try {
            const response = await fetch("/api/update-task-status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    uniqueIdNumber: reviseTask.uniqueIdNumber?.toString() || reviseTask.id,
                    databaseId: databaseId,
                    status: "Revision",
                }),
            });

            if (response.ok) {
                setIsReviseDialogOpen(false);
                setReviseTask(null);
                // Refetch data
                if (onRefetch) {
                    onRefetch();
                } else {
                    window.location.reload();
                }
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

    // Approve column for review tab
    const approveColumn = {
        id: "approve",
        header: "Actions",
        cell: ({ row }: { row: { original: TaskRow } }) => {
            const task = row.original;
            return (
                <div className="flex items-center gap-2">
                    <ApproveTaskButton
                        taskId={task.uniqueIdNumber?.toString() || task.id}
                        taskTitle={task.title}
                        databaseId={databaseId}
                        feedbackUrl={task.feedbackUrl}
                        onApprove={handleTaskApproved}
                    />
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
                                    Are you sure you want to request a revision for this task? This will change the status to "Revision".
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
    };

    return (
        <>
            <div className="mt-6">
                <div className="flex items-center justify-between border-b mb-4">
                    <div className="flex gap-2">
                        <button
                            className={`px-4 py-2 font-medium border-b-2 transition-colors ${tab === "ongoing" ? "border-orange-600 text-orange-600" : "border-transparent text-gray-500 hover:text-black"}`}
                            onClick={() => setTab("ongoing")}
                            type="button"
                        >
                            Ongoing
                        </button>
                        <button
                            className={`px-4 py-2 font-medium border-b-2 transition-colors ${tab === "review" ? "border-orange-600 text-orange-600" : "border-transparent text-gray-500 hover:text-black"}`}
                            onClick={() => setTab("review")}
                            type="button"
                        >
                            Waiting for Review
                        </button>
                        <button
                            className={`px-4 py-2 font-medium border-b-2 transition-colors ${tab === "completed" ? "border-orange-600 text-orange-600" : "border-transparent text-gray-500 hover:text-black"}`}
                            onClick={() => setTab("completed")}
                            type="button"
                        >
                            Completed
                        </button>
                    </div>
                    <Button onClick={handleCreateTask} size="sm" className="flex items-center gap-2 cursor-pointer">
                        <Plus className="w-4 h-4" />
                        Create Task
                    </Button>
                </div>
                {tab === "ongoing" && <DashboardTable data={ongoingTasks} hideFilesColumn />}
                {tab === "review" && <DashboardTable data={reviewTasks} extraColumns={[approveColumn]} hideFilesColumn />}
                {tab === "completed" && <DashboardTable data={completedTasks} />}
            </div>

            <CreateTaskSheet
                isOpen={isCreateTaskSheetOpen}
                onOpenChange={setIsCreateTaskSheetOpen}
                projectId={projectId}
                databaseId={databaseId}
                onTaskCreated={handleTaskApproved}
            />
        </>
    );
} 