export const token = process.env.SANITY_API_READ_TOKEN;

if (!token) {
  throw new Error("SANITY_API_READ_TOKEN is not set");
}
