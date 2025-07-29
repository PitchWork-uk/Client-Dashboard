"use client";

import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type DateRange } from "react-day-picker";
import Calendar30 from "@/components/calendar-30";

interface CreateTaskSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    projectId?: string;
}

export function CreateTaskSheet({ isOpen, onOpenChange, projectId }: CreateTaskSheetProps) {
    const [formData, setFormData] = useState({
        submittedBy: "",
        taskTitle: "",
        dateRange: undefined as DateRange | undefined,
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setFormData(prev => ({
            ...prev,
            dateRange: range
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // TODO: Implement task creation logic
        console.log("Creating task:", formData);

        // Reset form
        setFormData({
            submittedBy: "",
            taskTitle: "",
            dateRange: undefined,
        });

        // Close sheet
        onOpenChange(false);
    };

    const handleCancel = () => {
        // Reset form
        setFormData({
            submittedBy: "",
            taskTitle: "",
            dateRange: undefined,
        });

        // Close sheet
        onOpenChange(false);
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
                <div className="flex flex-col h-full">
                    <SheetHeader className="px-6 py-6 border-b">
                        <SheetTitle>Create New Task</SheetTitle>
                        <SheetDescription>
                            Add a new task to track progress and deliverables.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-6">
                                {/* Submitted By Field */}
                                <div className="space-y-3">
                                    <Label htmlFor="submittedBy">Submitted By</Label>
                                    <Input
                                        id="submittedBy"
                                        placeholder="Enter your name"
                                        value={formData.submittedBy}
                                        onChange={(e) => handleInputChange("submittedBy", e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Task Title Field */}
                                <div className="space-y-3">
                                    <Label htmlFor="taskTitle">Task Title</Label>
                                    <Input
                                        id="taskTitle"
                                        placeholder="Enter task title"
                                        value={formData.taskTitle}
                                        onChange={(e) => handleInputChange("taskTitle", e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Date Range Field */}
                                <div className="space-y-3">
                                    <Calendar30
                                        selected={formData.dateRange}
                                        onSelect={handleDateRangeChange}
                                        label="Task Duration"
                                        placeholder="Select date range"
                                        disabled={(date) => {
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            const selectedDate = new Date(date);
                                            selectedDate.setHours(0, 0, 0, 0);
                                            return selectedDate < today;
                                        }}
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    <SheetFooter className="px-6 py-6 border-t bg-muted/50">
                        <div className="flex gap-3 w-full">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                onClick={handleSubmit}
                            >
                                Create Task
                            </Button>
                        </div>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>
    );
}