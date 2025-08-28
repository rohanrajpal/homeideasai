import { AuthProvider } from "@/components/auth-context";
import { DisableDraftMode } from "@/components/disable-draft-mode";
import { Footer } from "@/components/footer";
import { FreeCreditsModal } from "@/components/free-credits-modal";
import { Navigation } from "@/components/navigation";
import { SanityLive } from "@/sanity/lib/live";
import { VisualEditing } from "next-sanity";
import dynamic from "next/dynamic";

import { cookies, draftMode } from "next/headers";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const CrispWithNoSSR = dynamic(() => import("@/components/crisp"));

  return (
    <>
      <CrispWithNoSSR />
      <AuthProvider token={token}>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main
            className="flex-grow"
            style={{ paddingTop: "var(--nav-height, 4rem)" }}
          >
            {children}
          </main>
          <Footer />
        </div>
        <FreeCreditsModal />
      </AuthProvider>
      <SanityLive />
      {(await draftMode()).isEnabled && (
        <>
          <DisableDraftMode />
          <VisualEditing />
        </>
      )}
    </>
  ); // No additional layout, just render the children
}
