import { NextRequest, NextResponse } from 'next/server';
import { createTask } from '@/lib/notion';

export async function POST(request: NextRequest) {
    try {
        const { submittedBy, title, dateRange, databaseId, projectId, priority } = await request.json();

        if (!submittedBy || !title || !dateRange || !databaseId) {
            return NextResponse.json({
                error: 'Submitted by, title, date range, and database ID are required'
            }, { status: 400 });
        }

        if (!dateRange.from || !dateRange.to) {
            return NextResponse.json({
                error: 'Both start and end dates are required'
            }, { status: 400 });
        }

        const result = await createTask(databaseId, {
            submittedBy,
            title,
            dateRange: {
                from: new Date(dateRange.from),
                to: new Date(dateRange.to),
            },
            projectId,
            priority,
        });

        if (result.success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({
                error: result.error || 'Failed to create task'
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in create-task API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 