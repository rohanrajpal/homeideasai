"use server";

import { cookies } from "next/headers";

import { authJwtLogin, oauthGoogleJwtCallback } from "@/app/clientService";
import { loginSchema } from "@/lib/definitions";
import { getErrorMessage } from "@/lib/utils";

export async function login(prevState: unknown, formData: FormData) {
  const validatedFields = loginSchema.safeParse({
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { username, password } = validatedFields.data;

  const input = {
    body: {
      username,
      password,
    },
  };

  try {
    const { data, error } = await authJwtLogin(input);
    if (error) {
      return { server_validation_error: getErrorMessage(error) };
    }
    (await cookies()).set("accessToken", data.access_token);
  } catch (err) {
    console.error("Login error:", err);
    return {
      server_error: "An unexpected error occurred. Please try again later.",
    };
  }
  return { success: true };
}

export async function googleCallback(code: string, state: string) {
  try {
    const response = await oauthGoogleJwtCallback({
      query: { code, state },
    });

    if (response.error) {
      console.log(response.error, response.data);
      throw new Error("Google login failed");
    }

    // The response type is unknown, but we know from the backend it returns a BearerResponse
    const data = response.data as { access_token: string };
    if (!data?.access_token) {
      throw new Error("No access token received");
    }

    (await cookies()).set("accessToken", data.access_token);
    return { success: true };
  } catch (err) {
    console.error("Google callback error:", err);
    return {
      server_error: "An unexpected error occurred during Google login.",
    };
  }
}
