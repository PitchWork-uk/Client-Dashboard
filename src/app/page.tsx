import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function SignInPage() {
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
            Enter your email below to login to your account
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                autoComplete="email"
                required
                className="bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-400"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder=""
                autoComplete="current-password"
                required
                className="bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-400"
              />
            </div>
            <Button type="submit" className="w-full bg-gray-900 cursor-pointer text-white hover:bg-gray-800 font-semibold">Login</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
