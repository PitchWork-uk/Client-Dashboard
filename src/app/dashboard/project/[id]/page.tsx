import { getProjectsByClientName, getTasksByProjectId } from "@/lib/notion";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import * as React from "react";
import { ProjectTasksTabs } from "@/components/project-tasks-tabs";
import { FolderOpen, Calendar, Users, Target } from "lucide-react";

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
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center">Project Not Found</CardTitle>
                        <CardDescription className="text-center">
                            The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <a href="/dashboard" className="text-orange-600 hover:underline">
                            Return to Dashboard
                        </a>
                    </CardContent>
                </Card>
            </div>
        );
    }
    const worksDatabaseId = process.env.NOTION_DATABASE_WORKS_ID!;
    const tasks = await getTasksByProjectId(worksDatabaseId, id);

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
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

            {/* Project Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-100">
                        <FolderOpen className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                        <p className="text-muted-foreground">Project overview and task management</p>
                    </div>
                </div>

                {/* Project Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                            <Target className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{tasks.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {tasks.length === 0 ? "No tasks yet" : `${tasks.length} task${tasks.length > 1 ? "s" : ""} in this project`}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <Calendar className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {tasks.filter(task => task.status === "Completed").length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Tasks completed successfully
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            <Users className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {tasks.filter(task => task.status === "In Progress").length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Tasks currently being worked on
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Project Tasks Tabs */}
            <ProjectTasksTabs tasks={tasks} databaseId={worksDatabaseId} projectId={id} />
        </div>
    );
} 