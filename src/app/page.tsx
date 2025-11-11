"use client"

import React, { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function ErrorMessage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="border-red-200 bg-red-50">
      <AlertDescription className="text-red-800">
        {decodeURIComponent(error)}
      </AlertDescription>
    </Alert>
  );
}

function SignInForm() {
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    
    if (email) {
      router.push(`/dashboard?email=${encodeURIComponent(email)}`);
    }
  }

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center text-gray-900">
          Welcome back
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          Enter your email to access your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Suspense fallback={null}>
          <ErrorMessage />
        </Suspense>
        <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                    className="pl-10 h-11 bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Access Dashboard
              </Button>
            </form>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Need help?{" "}
                <a href="#" className="text-orange-600 hover:text-orange-700 font-medium underline-offset-4 hover:underline">
                  Contact support
                </a>
              </p>
            </div>
      </CardContent>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Branding */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg">
              <span className="text-2xl font-bold">PW</span>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">PitchWork</h1>
            <p className="text-gray-600 mt-2">Client Dashboard</p>
          </div>
        </div>

        {/* Login Card */}
        <SignInForm />
        
        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 ProjectWorks. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
