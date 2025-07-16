import { NextRequest, NextResponse } from "next/server";
import { fetchClientByUsernameAndPassword } from "@/lib/notion";

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();
        if (!username || !password) {
            return NextResponse.json({ message: "Missing username or password" }, { status: 400 });
        }
        const databaseId = process.env.NOTION_DATABASE_CLIENTS_ID;
        if (!databaseId) {
            return NextResponse.json({ message: "Server misconfiguration" }, { status: 500 });
        }
        const client = await fetchClientByUsernameAndPassword(databaseId, username, password);
        if (client) {
            const res = NextResponse.json({ message: "Login successful" });
            res.cookies.set("auth", username, { httpOnly: true, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
            return res;
        } else {
            return NextResponse.json({ message: "Invalid username or password" }, { status: 401 });
        }
    } catch (err) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
} 