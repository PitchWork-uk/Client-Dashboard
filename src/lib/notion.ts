import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const colorPresets: Record<string, string> = {
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    brown: "bg-amber-100 text-amber-800 border-amber-200",
    default: "bg-gray-100 text-gray-800 border-gray-200",
    gray: "bg-gray-100 text-gray-800 border-gray-200",
    green: "bg-green-100 text-green-800 border-green-200",
    orange: "bg-orange-100 text-orange-800 border-orange-200",
    pink: "bg-pink-100 text-pink-800 border-pink-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    red: "bg-red-100 text-red-800 border-red-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

export type TaskRow = {
    id: string;
    title: string;
    project: string;
    type: string;
    typeColor: string;
    priority: string;
    priorityColor: string;
    status: string;
    statusColor: string;
    date: string;
};

export async function fetchTasksFromNotion(databaseId: string): Promise<TaskRow[]> {
    const response = await notion.databases.query({ database_id: databaseId });

    return response.results.map((page: any) => {
        return {
            id:
                page.properties["ID"]?.unique_id
                    ? `${page.properties["ID"].unique_id.prefix}-${page.properties["ID"].unique_id.number}`
                    : "",
            title: page.properties["Title"]?.title?.[0]?.plain_text || "",
            project: page.properties["Project"]?.rich_text?.[0]?.plain_text || "",
            type: page.properties["Type"]?.select?.name || "",
            typeColor: colorPresets[page.properties["Type"]?.select?.color || "default"],
            priority: page.properties["Priority"]?.select?.name || "",
            priorityColor: colorPresets[page.properties["Priority"]?.select?.color || "default"],
            status: page.properties["Status"]?.status?.name || "",
            statusColor: colorPresets[page.properties["Status"]?.status?.color || "default"],
            date: page.properties["date"]?.date
                ? `${page.properties["date"].date.start} → ${page.properties["date"].date.end || ""}`
                : "",
        };
    });
} 