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
    uniqueIdNumber?: number; // Add this field
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
    deliverables?: string[];
};

export type Comment = {
    id: string;
    text: string;
    author: string;
    timestamp: string;
    created_time: string;
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
                uniqueIdNumber: (p.properties["ID"] as { unique_id?: { number?: number } })?.unique_id?.number,
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
                deliverables: ((p.properties["Deliverables"] as { files?: Array<{ file?: { url?: string }; external?: { url?: string } }> })?.files?.map(file => file.file?.url || file.external?.url).filter(url => url !== undefined) as string[]) || [],
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
                uniqueIdNumber: (p.properties["ID"] as { unique_id?: { number?: number } })?.unique_id?.number,
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
                deliverables: ((p.properties["Deliverables"] as { files?: Array<{ file?: { url?: string }; external?: { url?: string } }> })?.files?.map(file => file.file?.url || file.external?.url).filter(url => url !== undefined) as string[]) || [],
            };
        })
        .filter((task) => task.title && task.title.trim() !== "");
}

export async function updateTaskStatus(taskId: string, newStatus: string) {
    try {
        await notion.pages.update({
            page_id: taskId,
            properties: {
                "Status": {
                    status: {
                        name: newStatus
                    }
                }
            }
        });
        return true;
    } catch (error) {
        console.error("Error updating task status:", error);
        return false;
    }
}

export async function updateTaskStatusByUniqueId(databaseId: string, uniqueIdNumber: number, newStatus: string) {
    try {
        // First, find the task by unique ID number
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                property: "ID",
                unique_id: {
                    equals: uniqueIdNumber
                }
            }
        });

        if (response.results.length === 0) {
            console.error("Task not found with unique ID:", uniqueIdNumber);
            return false;
        }

        const taskPageId = response.results[0].id;

        // Update the task status using the found page ID
        await notion.pages.update({
            page_id: taskPageId,
            properties: {
                "Status": {
                    status: {
                        name: newStatus
                    }
                }
            }
        });

        return true;
    } catch (error) {
        console.error("Error updating task status by unique ID:", error);
        return false;
    }
}

export async function getCommentsByTaskId(databaseId: string, uniqueIdNumber: number): Promise<Comment[]> {
    try {
        // First, find the task by unique ID number
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                property: "ID",
                unique_id: {
                    equals: uniqueIdNumber
                }
            }
        });

        if (response.results.length === 0) {
            console.error("Task not found with unique ID:", uniqueIdNumber);
            return [];
        }

        const taskPageId = response.results[0].id;

        // Get comments using the found page ID
        const commentsResponse = await notion.comments.list({
            block_id: taskPageId,
        });

        return commentsResponse.results.map((comment) => {
            const richText = comment.rich_text?.[0]?.plain_text || "";
            const author = (comment.created_by as any)?.name || "Unknown User";
            const createdTime = comment.created_time;

            return {
                id: comment.id,
                text: richText,
                author: author,
                timestamp: new Date(createdTime).toLocaleString(),
                created_time: createdTime,
            };
        });
    } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
}

export async function createComment(databaseId: string, uniqueIdNumber: number, commentText: string): Promise<Comment | null> {
    try {
        // First, find the task by unique ID number
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                property: "ID",
                unique_id: {
                    equals: uniqueIdNumber
                }
            }
        });

        if (response.results.length === 0) {
            console.error("Task not found with unique ID:", uniqueIdNumber);
            return null;
        }

        const taskPageId = response.results[0].id;

        // Create comment using the found page ID
        const commentResponse = await notion.comments.create({
            parent: {
                page_id: taskPageId,
            },
            rich_text: [
                {
                    text: {
                        content: commentText,
                    },
                },
            ],
        });

        // Since we can't retrieve the comment directly, we'll construct the response
        // based on the creation response and the input data
        const richText = commentText;
        const author = "You"; // In a real app, this would come from user context
        const createdTime = new Date().toISOString();

        return {
            id: commentResponse.id,
            text: richText,
            author: author,
            timestamp: new Date(createdTime).toLocaleString(),
            created_time: createdTime,
        };
    } catch (error) {
        console.error("Error creating comment:", error);
        return null;
    }
} 