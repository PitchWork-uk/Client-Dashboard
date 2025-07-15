import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export type TaskRow = {
    id: string;
    title: string;
    project: string;
    type: string;
    priority: string;
    status: string;
    date: string;
};

export async function fetchTasksFromNotion(databaseId: string): Promise<TaskRow[]> {
    const response = await notion.databases.query({ database_id: databaseId });
    console.log(response.results[0].properties["Status"])
    return response.results.map((page: any) => {
        return {
            id:
                page.properties["ID"]?.unique_id
                    ? `${page.properties["ID"].unique_id.prefix}-${page.properties["ID"].unique_id.number}`
                    : "",
            title: page.properties["Title"]?.title?.[0]?.plain_text || "",
            project: page.properties["Project"]?.rich_text?.[0]?.plain_text || "",
            type: page.properties["Type"]?.select?.name || "",
            priority: page.properties["Priority"]?.select?.name || "",
            status: page.properties["Status"]?.status?.name || "",
            date: page.properties["date"]?.date
                ? `${page.properties["date"].date.start} → ${page.properties["date"].date.end || ""}`
                : "",
        };
    });
} 