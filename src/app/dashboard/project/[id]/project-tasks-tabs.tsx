"use client";
import { useState } from "react";
import { DashboardTable } from "@/components/dashboard-table";
import type { TaskRow } from "@/lib/notion";

export function ProjectTasksTabs({ tasks }: { tasks: TaskRow[] }) {
    const [tab, setTab] = useState("ongoing");
    const ongoingTasks = tasks.filter(
        (task) => task.status !== "Client Review" && task.status !== "Completed"
    );
    const reviewTasks = tasks.filter((task) => task.status === "Client Review");
    const completedTasks = tasks.filter((task) => task.status === "Completed");
    return (
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
            {tab === "ongoing" && <DashboardTable data={ongoingTasks} />}
            {tab === "review" && <DashboardTable data={reviewTasks} />}
            {tab === "completed" && <DashboardTable data={completedTasks} />}
        </div>
    );
} 