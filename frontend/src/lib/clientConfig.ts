import { client } from "@/app/openapi-client/sdk.gen";

export const configureClient = (token?: string) => {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  client.setConfig({
    baseURL: baseURL,
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

configureClient();
