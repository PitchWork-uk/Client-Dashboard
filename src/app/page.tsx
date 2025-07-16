"use client"

import React, { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    startTransition(async () => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        let data = { message: "Login failed" };
        try {
          data = await res.json();
        } catch (e) { }
        setError(data.message || "Login failed");
      }
    });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <Image
        src="/logo.svg"
        alt="Logo"
        width={200}
        height={48}
        className="mb-2"
        priority
      />
      <h1 className="mb-10 text-neutral-500 font-semibold ">Client dashboard</h1>
      <Card className="w-full max-w-md shadow-lg border border-gray-200 bg-white text-gray-900">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login to your account</CardTitle>
          <p className="text-gray-500 text-sm text-center">
            Enter your client ID below to login to your account
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-2 text-red-600 text-center text-sm">{error}</div>
          )}
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                autoComplete="username"
                required
                className="bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder=""
                autoComplete="current-password"
                required
                className="bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-400"
              />
            </div>
            <Button type="submit" className="w-full bg-gray-900 cursor-pointer text-white hover:bg-gray-800 font-semibold" disabled={isPending}>
              {isPending ? (
                <svg className="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
