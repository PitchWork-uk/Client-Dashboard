import { getProjectsByClientName, getTasksByProjectId } from "@/lib/notion";
import { DashboardTable } from "@/components/dashboard-table";
import { cookies } from "next/headers";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import * as React from "react";

function ProjectBreadcrumb({ projectName }: { projectName: string }) {
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>{projectName}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    );
}
ProjectBreadcrumb.displayName = 'DashboardBreadcrumb';

type ParamsType = { id: string } | Promise<{ id: string }>;
function isPromise<T>(value: unknown): value is Promise<T> {
    return typeof value === 'object' && value !== null && 'then' in value && typeof (value as { then: unknown }).then === 'function';
}
export default async function ProjectPage({ params }: { params: ParamsType }) {
    let id: string;
    if (isPromise<{ id: string }>(params)) {
        const resolved = await params;
        id = resolved.id;
    } else {
        id = params.id;
    }
    const cookieStore = await cookies();
    const auth = cookieStore.get("auth");
    if (!auth || !auth.value) {
        return null;
    }
    const email = auth.value;
    const projectsDatabaseId = process.env.NOTION_DATABASE_PROJECTS_ID!;
    const projects = await getProjectsByClientName(projectsDatabaseId, email);
    const project = projects.find((p) => p.id === id);
    if (!project) {
        return <div>Project not found</div>;
    }
    const worksDatabaseId = process.env.NOTION_DATABASE_WORKS_ID!;
    const tasks = await getTasksByProjectId(worksDatabaseId, id);
    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]:pl-2 border-b px-4 mb-4">
                <SidebarTrigger className="-ml-1" />
                <div className="ml-2">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{project.name}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>
            <h1 className="text-2xl font-bold mb-4">{project.name}</h1>
            <DashboardTable data={tasks} />
        </>
    );
} 