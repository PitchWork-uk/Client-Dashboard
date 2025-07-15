import React from "react";

export default function DashboardPage() {
    return (
        <div className="min-h-screen p-8 bg-white">
            <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
            <p className="text-lg text-gray-600 mb-8">Welcome to your dashboard!</p>
            <div className="border rounded-lg p-6 bg-gray-50 shadow">
                {/* Dashboard widgets or content can go here */}
                <p className="text-gray-500">This is a placeholder for your dashboard content.</p>
            </div>
        </div>
    );
} 