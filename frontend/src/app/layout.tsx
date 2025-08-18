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
          data-key="zNrcHMF3ehNPEO4jg/J/zw"
          defer={true}
        />
        <script>
          {`!function () {var reb2b = window.reb2b = window.reb2b || [];
    if (reb2b.invoked) return;reb2b.invoked = true;reb2b.methods = ["identify", "collect"];
    reb2b.factory = function (method) {return function () {var args = Array.prototype.slice.call(arguments);
    args.unshift(method);reb2b.push(args);return reb2b;};};
    for (var i = 0; i < reb2b.methods.length; i++) {var key = reb2b.methods[i];reb2b[key] = reb2b.factory(key);}
    reb2b.load = function (key) {var script = document.createElement("script");script.type = "text/javascript";script.async = true;
    script.src = "https://s3-us-west-2.amazonaws.com/b2bjsstore/b/" + key + "/7N850HPW0EN1.js.gz";
    var first = document.getElementsByTagName("script")[0];
    first.parentNode.insertBefore(script, first);};
    reb2b.SNIPPET_VERSION = "1.0.1";reb2b.load("7N850HPW0EN1");}();`}
        </script>
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Toaster />
        <FacebookPixel />
      </body>
    </html>
  );
}
