"use client";

import { useState } from "react";
import { DashboardTable } from "./dashboard-table";
import { TaskRow } from "@/lib/notion";

interface DashboardClientProps {
    reviewTasks: TaskRow[];
    databaseId: string;
}

export function DashboardClient({ reviewTasks: initialReviewTasks, databaseId }: DashboardClientProps) {
    const [reviewTasks] = useState(initialReviewTasks);

    const handleTaskApproved = () => {
        // Remove the approved task from the list
        // In a real implementation, you might want to refetch the data
        // For now, we'll just remove the task from the local state
        // This is a simplified approach - ideally you'd refetch from the server
        window.location.reload(); // Simple refresh for now
    };

    if (reviewTasks.length === 0) {
        return null;
    }

    return (
        <div className="mt-8 w-full">
            <h2 className="text-xl font-semibold mb-4">Waiting for review</h2>
            <DashboardTable
                data={reviewTasks}
                showApproveColumn={true}
                databaseId={databaseId}
                onTaskApproved={handleTaskApproved}
            />
        </div>
    );
} 