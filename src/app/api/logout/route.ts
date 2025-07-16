import { NextResponse } from "next/server";

export async function POST() {
    const res = NextResponse.json({ message: "Logged out" });
    res.cookies.set("auth", "", { httpOnly: true, path: "/", expires: new Date(0), sameSite: "lax", secure: process.env.NODE_ENV === "production" });
    return res;
} 