import { AuthJwtLoginError } from "@/app/openapi-client/types.gen";
import { RegisterRegisterError } from "@/app/openapi-client/types.gen";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
};

export function getErrorMessage(
  error: RegisterRegisterError | AuthJwtLoginError
): string {
  let errorMessage = "An unknown error occurred";

  if (typeof error.detail === "string") {
    // If detail is a string, use it directly
    if (error.detail === "LOGIN_BAD_CREDENTIALS") {
      errorMessage = "Invalid email or password. Have you registered yet?";
    } else {
      errorMessage = error.detail;
    }
  } else if (typeof error.detail === "object" && "reason" in error.detail) {
    // If detail is an object with a 'reason' key, use that
    errorMessage = error.detail["reason"];
  }

  return errorMessage;
}
