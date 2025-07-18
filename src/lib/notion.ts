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

    return (response.results as Array<any>)
        .map((page) => {
            return {
                id:
                    page.properties["ID"]?.unique_id
                        ? `${page.properties["ID"].unique_id.prefix}-${page.properties["ID"].unique_id.number}`
                        : "",
                title: page.properties["Title"]?.title?.[0]?.plain_text || "",
                project: page.properties["Project Name"]?.rollup?.array?.[0]?.title?.[0]?.plain_text || "",
                type: page.properties["Type"]?.select?.name || "",
                typeColor: colorPresets[page.properties["Type"]?.select?.color || "default"],
                priority: page.properties["Priority"]?.select?.name || "",
                priorityColor: colorPresets[page.properties["Priority"]?.select?.color || "default"],
                status: page.properties["Status"]?.status?.name || "",
                statusColor: colorPresets[page.properties["Status"]?.status?.color || "default"],
                date: page.properties["Date"]?.date
                    ? `${page.properties["Date"].date.start} → ${page.properties["Date"].date.end || ""}`
                    : "",
                url: page.url,
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

    return response.results.map((page: any) => ({
        id: page.id,
        name: page.properties?.Title?.title?.[0]?.plain_text || "",
        // Add more fields as needed
    }));
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