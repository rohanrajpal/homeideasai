import RegisterForm from "@/components/RegisterForm";
import { PageProps } from "../../../../.next/types/app/(marketing)/register/page";

export default async function Page(props: PageProps) {
  const email = (await props.searchParams)?.email as string | undefined;

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <RegisterForm email={email || ""} />
    </div>
  );
}
