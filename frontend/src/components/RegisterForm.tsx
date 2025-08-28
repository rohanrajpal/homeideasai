"use client";

import { verifyRequestToken } from "@/app/openapi-client";
import { register } from "@/components/actions/register-action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError, FormError } from "@/components/ui/FormError";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submitButton";
import { useToast } from "@/hooks/use-toast";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import * as pixel from "../lib/fpixel";
import GoogleLoginButton from "./google-login-button";
import { login } from "@/components/actions/login-action";

export default function RegisterForm({ email }: { email: string }) {
  const { toast } = useToast();
  const [state, dispatch] = useActionState(register, undefined);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const onSuccess = async () => {
      try {
        pixel.event("CompleteRegistration");

        if (state?.data?.email) {
          toast({
            title: "Account created successfully!",
            description: "Sending verification email...",
          });

          await verifyRequestToken({
            body: {
              email: state.data.email,
            },
          });

          toast({
            title: "Verification email sent",
            description: "Please check your inbox to verify your email.",
          });

          // Log the user in directly
          const formData = new FormData();
          formData.set("username", state.data.email);
          formData.set("password", state.data.password);
          const loginResult = await login(undefined, formData);

          if (loginResult.success) {
            window.location.href = "/workspace?newUser=true";
          } else {
            window.location.href = "/login?verified=pending";
          }
        }
      } catch (error) {
        console.error("Error in registration flow:", error);
        toast({
          title: "Error",
          description:
            "There was a problem completing your registration. Please try logging in.",
          variant: "destructive",
        });
        redirect("/login?verified=pending");
      }
    };

    if (state?.success) {
      onSuccess();
    }
  }, [state, toast]);

  return (
    <Card className="w-full max-w-sm rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardHeader className="pb-1 px-2 text-center">
        <CardTitle className="text-2xl  font-semibold text-gray-800 dark:text-white">
          <h1>Sign Up</h1>
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
          Enter your email and password below to create your account.
          <span className="mt-2 font-medium text-blue-600 dark:text-blue-400">
            {" "}
            Get free credits when you complete registration! 🎁
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 p-6">
        <GoogleLoginButton />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">
              Or continue with email
            </span>
          </div>
        </div>

        <form action={dispatch} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={email || "m@example.com"}
              defaultValue={email || ""}
              required
              className="border-gray-300 dark:border-gray-600"
            />
            <FieldError state={state} field="email" />
          </div>
          <div className="grid gap-2">
            <Label
              htmlFor="password"
              className="text-gray-700 dark:text-gray-300"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="border-gray-300 dark:border-gray-600 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            <FieldError state={state} field="password" />
          </div>
          <SubmitButton text="Sign Up" />
          <FormError state={state} />
        </form>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <Link
            href="/login"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
          >
            Back to login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
