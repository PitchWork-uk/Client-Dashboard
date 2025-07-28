"use client";
import { useState } from "react";
import { DashboardTable } from "@/components/dashboard-table";
import type { TaskRow } from "@/lib/notion";
import { ApproveTaskButton } from "./approve-task-button";

export function ProjectTasksTabs({ tasks, onRefetch, databaseId }: { tasks: TaskRow[], onRefetch?: () => void, databaseId: string }) {
    const [tab, setTab] = useState("ongoing");
    const [localTasks, setLocalTasks] = useState(tasks);

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

    // Approve column for review tab
    const approveColumn = {
        id: "approve",
        header: "Actions",
        cell: ({ row }: { row: any }) => {
            const task = row.original;
            return (
                <ApproveTaskButton
                    taskId={task.uniqueIdNumber?.toString() || task.id}
                    taskTitle={task.title}
                    databaseId={databaseId}
                    onApprove={handleTaskApproved}
                />
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
        </>
    );
} 