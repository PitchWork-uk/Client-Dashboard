import { NextRequest, NextResponse } from 'next/server';
import { updateTaskStatusByUniqueId } from '@/lib/notion';

export async function POST(request: NextRequest) {
    try {
        const { uniqueIdNumber, databaseId, status } = await request.json();

        if (!uniqueIdNumber || !databaseId || !status) {
            return NextResponse.json({ error: 'Unique ID number, database ID, and status are required' }, { status: 400 });
        }

        // Convert to number if it's a string
        const numericId = typeof uniqueIdNumber === 'string' ? parseInt(uniqueIdNumber, 10) : uniqueIdNumber;
        
        if (isNaN(numericId)) {
            return NextResponse.json({ error: 'Invalid unique ID number format' }, { status: 400 });
        }

        const success = await updateTaskStatusByUniqueId(databaseId, numericId, status);

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Failed to update task status' }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in update-task-status API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
