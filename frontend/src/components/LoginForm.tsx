"use client";

import { login } from "@/components/actions/login-action";
import { useAuth } from "@/components/auth-context";
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
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import GoogleLoginButton from "./google-login-button";

export default function LoginForm() {
  const [state, dispatch] = useActionState(login, undefined);
  const { loginSuccess } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.success) {
      loginSuccess();
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push("/generator");
      }
    } else if (state?.server_error) {
      console.error("Login failed:", state.server_error);
    }
  }, [loginSuccess, state]);

  return (
    <Card className="w-full max-w-sm rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">
          <h1>Login</h1>
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
          Enter your email below to log in to your account.
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

        <form action={dispatch}>
          <div className="grid gap-3">
            <Label
              htmlFor="username"
              className="text-gray-700 dark:text-gray-300"
            >
              Username
            </Label>
            <Input
              id="username"
              name="username"
              type="email"
              placeholder="m@example.com"
              required
              className="border-gray-300 dark:border-gray-600"
            />
            <FieldError state={state} field="username" />
          </div>
          <div className="grid gap-3 mb-2 mt-2">
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
            <Link
              href="/password-recovery"
              className="ml-auto inline-block text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
            >
              Forgot your password?
            </Link>
          </div>
          <SubmitButton text="Sign In" />
          <FormError state={state} className="mt-2" />
        </form>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500"
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
