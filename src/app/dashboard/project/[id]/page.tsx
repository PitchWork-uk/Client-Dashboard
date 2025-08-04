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
import { ProjectTasksTabs } from "@/components/project-tasks-tabs";

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

type ProjectPageProps = {
    params: Promise<{ id: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { id } = await params;
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
            <h1 className="text-2xl font-bold ">{project.name}</h1>
            {/* Tabs below title */}
            <ProjectTasksTabs tasks={tasks} databaseId={worksDatabaseId} projectId={id} />
        </>
    );
} 