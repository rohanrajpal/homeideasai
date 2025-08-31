import FacebookPixel from "@/components/facebook-pixel";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { BASE_URL } from "@/lib/constants";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HomeIdeasAI",
  description:
    "Transform your home with AI-powered interior and exterior design",
  metadataBase: new URL(BASE_URL),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <GoogleAnalytics gaId="G-S1SZ0BCNHF" />

      <head>
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="SHKb5fFuqY5J61MuuUgNdA"
          defer={true}
        />
        <script>
          {`!function(key) {if (window.reb2b) return;window.reb2b = {loaded: true};var s = document.createElement("script");s.async = true;s.src = "https://ddwl4m2hdecbv.cloudfront.net/b/" + key + "/" + key + ".js.gz";document.getElementsByTagName("script")[0].parentNode.insertBefore(s, document.getElementsByTagName("script")[0]);}("0NW1GHLP4LO4");`}
        </script>
        <meta
          name="p:domain_verify"
          content="aa2c9e32c946483db70fa4937b699f89"
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Toaster />
        <FacebookPixel />
      </body>
    </html>
  );
}
