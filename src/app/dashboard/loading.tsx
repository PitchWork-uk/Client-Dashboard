import React from "react";

export default function Loading() {
    return (
        <div className="flex flex-1 items-center justify-center min-h-[60vh] w-full">
            <div className="flex flex-row items-center gap-4">
                <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span className="text-sm text-gray-600 font-medium">Loading..</span>
            </div>
        </div>
    );
} 