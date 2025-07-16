import { NextRequest, NextResponse } from "next/server";
import { fetchClientByEmailAndPassword } from "@/lib/notion";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        if (!email || !password) {
            return NextResponse.json({ message: "Missing email or password" }, { status: 400 });
        }
        const databaseId = process.env.NOTION_DATABASE_CLIENTS_ID;
        if (!databaseId) {
            return NextResponse.json({ message: "Server misconfiguration" }, { status: 500 });
        }
        const client = await fetchClientByEmailAndPassword(databaseId, email, password);
        if (client) {
            const res = NextResponse.json({ message: "Login successful" });
            res.cookies.set("auth", email, { httpOnly: true, path: "/", sameSite: "lax", secure: process.env.NODE_ENV === "production" });
            return res;
        } else {
            return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
        }
    } catch (err) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
} 