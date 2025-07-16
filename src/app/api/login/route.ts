import { NextRequest, NextResponse } from "next/server";
import { fetchClientByIdAndPassword } from "@/lib/notion";

export async function POST(req: NextRequest) {
    try {
        const { clientId, password } = await req.json();
        if (!clientId || !password) {
            return NextResponse.json({ message: "Missing client ID or password" }, { status: 400 });
        }
        const databaseId = process.env.NOTION_DATABASE_CLIENTS_ID;
        if (!databaseId) {
            return NextResponse.json({ message: "Server misconfiguration" }, { status: 500 });
        }
        const client = await fetchClientByIdAndPassword(databaseId, clientId, password);
        if (client) {
            return NextResponse.json({ message: "Login successful" });
        } else {
            return NextResponse.json({ message: "Invalid client ID or password" }, { status: 401 });
        }
    } catch (err) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
} 