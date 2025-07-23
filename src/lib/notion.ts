import { Client } from "@notionhq/client";
import type { QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";

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
    url?: string;
};

export async function getTasksByProjectId(databaseId: string, projectId?: string): Promise<TaskRow[]> {
    const query: QueryDatabaseParameters = { database_id: databaseId };
    if (projectId) {
        query.filter = {
            property: "Project",
            relation: {
                contains: projectId,
            },
        };
    }
    const response = await notion.databases.query(query);

    return (response.results as Array<Record<string, unknown>>)
        .map((page) => {
            const p = page as {
                id: string;
                url?: string;
                properties: Record<string, unknown>;
            };
            return {
                id:
                    (p.properties["ID"] as { unique_id?: { prefix?: string; number?: number } })?.unique_id
                        ? `${(p.properties["ID"] as { unique_id?: { prefix?: string; number?: number } }).unique_id?.prefix}-${(p.properties["ID"] as { unique_id?: { prefix?: string; number?: number } }).unique_id?.number}`
                        : "",
                title: ((p.properties["Title"] as { title?: Array<{ plain_text?: string }> })?.title?.[0]?.plain_text) || "",
                project: ((p.properties["Project Name"] as { rollup?: { array?: Array<{ title?: Array<{ plain_text?: string }> }> } })?.rollup?.array?.[0]?.title?.[0]?.plain_text) || "",
                type: ((p.properties["Type"] as { select?: { name?: string; color?: string } })?.select?.name) || "",
                typeColor: colorPresets[((p.properties["Type"] as { select?: { color?: string } })?.select?.color) || "default"],
                priority: ((p.properties["Priority"] as { select?: { name?: string; color?: string } })?.select?.name) || "",
                priorityColor: colorPresets[((p.properties["Priority"] as { select?: { color?: string } })?.select?.color) || "default"],
                status: ((p.properties["Status"] as { status?: { name?: string; color?: string } })?.status?.name) || "",
                statusColor: colorPresets[((p.properties["Status"] as { status?: { color?: string } })?.status?.color) || "default"],
                date: ((p.properties["Date"] as { date?: { start?: string; end?: string } })?.date?.start)
                    ? `${((p.properties["Date"] as { date?: { start?: string; end?: string } })?.date?.start)} → ${((p.properties["Date"] as { date?: { start?: string; end?: string } })?.date?.end || "")}`
                    : "",
                url: p.url,
            };
        })
        .filter((task) => task.title && task.title.trim() !== "");
}


export async function getClientByEmailAndPassword(databaseId: string, email: string, password: string) {
    const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
            and: [
                {
                    property: "Email",
                    rich_text: {
                        equals: email,
                    },
                },
                {
                    property: "Password",
                    number: {
                        equals: Number(password),
                    },
                },
            ],
        },
    });
    return response.results[0] || null;
}

export async function getClientByEmail(databaseId: string, email: string) {
    const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
            property: "Email",
            rich_text: {
                equals: email,
            },
        },
    });
    return response.results[0] || null;
}

export async function getProjectsByClientName(databaseId: string, clientEmail: string) {
    const response = await notion.databases.query({
        database_id: databaseId,

        filter: {
            property: "Email",
            rollup: {

                any: {
                    rich_text: {
                        contains: clientEmail,
                    },
                },
            },
        },
    });


    return (response.results as Array<Record<string, unknown>>).map((page) => {
        const p = page as {
            id: string;
            properties: Record<string, unknown>;
        };
        return {
            id: p.id,
            name: (p.properties?.Title as { title?: Array<{ plain_text?: string }> })?.title?.[0]?.plain_text || "",
            // Add more fields as needed
        };
    });
}

export async function getTaskCountsByClientId(databaseId: string, clientId: string) {
    // Ongoing tasks: status is not 'Completed' or 'Delivered'
    const ongoingRes = await notion.databases.query({
        database_id: databaseId,
        filter: {
            and: [
                {
                    property: "Client",
                    rollup: {
                        any: {
                            relation: {
                                contains: clientId,
                            },
                        },
                    },
                },
                {
                    property: "Status",
                    status: {
                        does_not_equal: "Completed"
                    },
                },
                {
                    property: "Status",
                    status: {
                        does_not_equal: "Cancelled"
                    },
                },
                {
                    property: "Status",
                    status: {
                        does_not_equal: "Rejected"
                    },
                },
                {
                    property: "Status",
                    status: {
                        does_not_equal: "Archived"
                    },
                },
            ],
        },
    });
    // Completed tasks: status is 'Completed' or 'Delivered'
    const completedRes = await notion.databases.query({
        database_id: databaseId,
        filter: {
            and: [
                {
                    property: "Client",
                    rollup: {
                        any: {
                            relation: {
                                contains: clientId,
                            },
                        },
                    },
                },
                { property: "Status", status: { equals: "Completed" } },

            ],
        },
    });
    return {
        ongoing: ongoingRes.results.length,
        completed: completedRes.results.length,
    };
}

export async function getTasksByClientIdAndStatus(databaseId: string, clientId: string, status: string): Promise<TaskRow[]> {
    const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
            and: [
                {
                    property: "Client",
                    rollup: {
                        any: {
                            relation: {
                                contains: clientId,
                            },
                        },
                    },
                },
                {
                    property: "Status",
                    status: {
                        equals: status,
                    },
                },
            ],
        },
    });
    return (response.results as Array<Record<string, unknown>>)
        .map((page) => {
            const p = page as {
                id: string;
                url?: string;
                properties: Record<string, unknown>;
            };
            return {
                id:
                    (p.properties["ID"] as { unique_id?: { prefix?: string; number?: number } })?.unique_id
                        ? `${(p.properties["ID"] as { unique_id?: { prefix?: string; number?: number } }).unique_id?.prefix}-${(p.properties["ID"] as { unique_id?: { prefix?: string; number?: number } }).unique_id?.number}`
                        : "",
                title: ((p.properties["Title"] as { title?: Array<{ plain_text?: string }> })?.title?.[0]?.plain_text) || "",
                project: ((p.properties["Project Name"] as { rollup?: { array?: Array<{ title?: Array<{ plain_text?: string }> }> } })?.rollup?.array?.[0]?.title?.[0]?.plain_text) || "",
                type: ((p.properties["Type"] as { select?: { name?: string; color?: string } })?.select?.name) || "",
                typeColor: colorPresets[((p.properties["Type"] as { select?: { color?: string } })?.select?.color) || "default"],
                priority: ((p.properties["Priority"] as { select?: { name?: string; color?: string } })?.select?.name) || "",
                priorityColor: colorPresets[((p.properties["Priority"] as { select?: { color?: string } })?.select?.color) || "default"],
                status: ((p.properties["Status"] as { status?: { name?: string; color?: string } })?.status?.name) || "",
                statusColor: colorPresets[((p.properties["Status"] as { status?: { color?: string } })?.status?.color) || "default"],
                date: ((p.properties["Date"] as { date?: { start?: string; end?: string } })?.date?.start)
                    ? `${((p.properties["Date"] as { date?: { start?: string; end?: string } })?.date?.start)} → ${((p.properties["Date"] as { date?: { start?: string; end?: string } })?.date?.end || "")}`
                    : "",
                url: p.url,
            };
        })
        .filter((task) => task.title && task.title.trim() !== "");
} 