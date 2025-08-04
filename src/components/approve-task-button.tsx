"use client";

import { useState } from "react";
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
import { CheckCircle, MessageSquare } from "lucide-react";

interface ApproveTaskButtonProps {
    taskId: string;
    taskTitle: string;
    databaseId: string;
    feedbackUrl?: string;
    onApprove?: () => void;
}

export function ApproveTaskButton({ taskId, taskTitle, databaseId, feedbackUrl, onApprove }: ApproveTaskButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleApprove = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/approve-task", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    uniqueIdNumber: taskId,
                    databaseId: databaseId,
                }),
            });

            if (response.ok) {
                setIsOpen(false);
                onApprove?.();
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error("Failed to approve task:", errorData.error || "Unknown error");
                // You could add a toast notification here for better UX
            }
        } catch (error) {
            console.error("Error approving task:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {feedbackUrl && (
                <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                    onClick={() => window.open(feedbackUrl, '_blank')}
                >
                    <MessageSquare size={16} />
                    Feedback
                </Button>
            )}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                    >
                        <CheckCircle size={16} />
                        Approve
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Approve Task</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to approve this task? This will mark it as completed.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground">
                            <strong>Task:</strong> {taskTitle}
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApprove}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isLoading ? "Approving..." : "Approve Task"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 