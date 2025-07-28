"use client";
import { useState } from "react";
import { DashboardTable } from "@/components/dashboard-table";
import type { TaskRow } from "@/lib/notion";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ProjectTasksTabs({ tasks, onRefetch, databaseId }: { tasks: TaskRow[], onRefetch?: () => void, databaseId: string }) {
    const [tab, setTab] = useState("ongoing");
    const [localTasks, setLocalTasks] = useState(tasks);
    const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [taskToApprove, setTaskToApprove] = useState<TaskRow | null>(null);

    const ongoingTasks = localTasks.filter(
        (task) => task.status !== "Client Review" && task.status !== "Completed"
    );
    const reviewTasks = localTasks.filter((task) => task.status === "Client Review");
    const completedTasks = localTasks.filter((task) => task.status === "Completed");

    const handleApproveClick = (task: TaskRow) => {
        setTaskToApprove(task);
        setShowConfirmDialog(true);
    };

    const handleConfirmApprove = async () => {
        if (!taskToApprove) return;

        setShowConfirmDialog(false);
        setLoadingTaskId(taskToApprove.id);

        try {
            const response = await fetch('/api/approve-task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uniqueIdNumber: taskToApprove.uniqueIdNumber,
                    databaseId
                }),
            });

            if (response.ok) {
                // Update local state
                setLocalTasks(prevTasks =>
                    prevTasks.map(task =>
                        task.id === taskToApprove.id
                            ? { ...task, status: "Completed" }
                            : task
                    )
                );

                // Refetch all data if callback provided
                if (onRefetch) {
                    onRefetch();
                }
            }
        } catch (error) {
            console.error('Error approving task:', error);
        } finally {
            setLoadingTaskId(null);
            setTaskToApprove(null);
        }
    };

    const handleCancelApprove = () => {
        setShowConfirmDialog(false);
        setTaskToApprove(null);
    };

    // Approve column for review tab
    const approveColumn = {
        id: "approve",
        header: "Approve",
        cell: ({ row }: { row: any }) => {
            const task = row.original;
            const isLoading = loadingTaskId === task.id;

            return (
                <button
                    type="button"
                    disabled={isLoading}
                    className="px-3 py-1 text-sm text-white rounded bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleApproveClick(task)}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        "Approve"
                    )}
                </button>
            );
        },
        enableSorting: false,
    };

    return (
        <>
            <div className="mt-6">
                <div className="flex gap-2 border-b mb-4">
                    <button
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${tab === "ongoing" ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-black"}`}
                        onClick={() => setTab("ongoing")}
                        type="button"
                    >
                        Ongoing
                    </button>
                    <button
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${tab === "review" ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-black"}`}
                        onClick={() => setTab("review")}
                        type="button"
                    >
                        Waiting for Review
                    </button>
                    <button
                        className={`px-4 py-2 font-medium border-b-2 transition-colors ${tab === "completed" ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-black"}`}
                        onClick={() => setTab("completed")}
                        type="button"
                    >
                        Completed
                    </button>
                </div>
                {tab === "ongoing" && <DashboardTable data={ongoingTasks} hideFilesColumn />}
                {tab === "review" && <DashboardTable data={reviewTasks} extraColumns={[approveColumn]} />}
                {tab === "completed" && <DashboardTable data={completedTasks} />}
            </div>

            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Approval</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve task "{taskToApprove?.title}"?
                            This will mark the task as completed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancelApprove}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmApprove}>
                            Approve
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
} 