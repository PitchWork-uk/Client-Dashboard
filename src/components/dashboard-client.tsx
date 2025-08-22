"use client";

import { useState } from "react";
import { DashboardTable } from "./dashboard-table";
import { TaskRow } from "@/lib/notion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2 } from "lucide-react";

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
                    databaseId={databaseId}
                    onTaskApproved={handleTaskApproved}
                />
            </CardContent>
        </Card>
    );
} 