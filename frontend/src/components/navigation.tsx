"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SITE_LINKS } from "@/lib/constants";
import { Menu, User, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./auth-context";
import { Logo } from "./icons/logo";
import { usersCurrentUser } from "@/app/openapi-client";

export function Navigation() {
  const { isAuthenticated, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchUserData() {
      if (isAuthenticated) {
        try {
          const userData = await usersCurrentUser();
          if (userData.data) {
            setIsEmailVerified(userData.data.is_verified ?? false);
            if (pathname !== "/profile") {
              setShowVerifyBanner(!userData.data.is_verified);
            }
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
    }

    fetchUserData();
  }, [isAuthenticated, pathname]);

  const links = SITE_LINKS.filter((link) => link.href !== "/");

  useEffect(() => {
    // Update CSS custom property for navigation height
    const navHeight =
      showVerifyBanner && isAuthenticated && !isEmailVerified
        ? "6.25rem"
        : "4rem"; // 100px or 64px
    document.documentElement.style.setProperty("--nav-height", navHeight);
  }, [showVerifyBanner, isAuthenticated, isEmailVerified]);

  return (
    <>
      {showVerifyBanner && isAuthenticated && !isEmailVerified && (
        <div className="fixed top-0 w-full bg-yellow-100 text-yellow-800 px-4 py-2 text-sm z-50">
          <div className="container mx-auto flex justify-between items-center">
            <p>
              Verify your email to receive 3 free credits!{" "}
              <Link href="/profile" className="underline font-medium">
                Go to Profile
              </Link>
            </p>
            <button
              onClick={() => setShowVerifyBanner(false)}
              className="text-yellow-800 hover:text-yellow-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <header
        className={`fixed ${showVerifyBanner && isAuthenticated && !isEmailVerified ? "top-9" : "top-0"} w-full border-b bg-background/80 backdrop-blur-sm z-40`}
      >
        <div className="mx-auto container flex h-16 justify-between items-center px-4 md:px-6">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="text-xl">HomeIdeasAI</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 ">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium hover:underline hover:text-primary ${
                  pathname === link.href ? "text-primary" : ""
                }`}
              >
                {link.text}
              </Link>
            ))}
            {!loading && isAuthenticated && (
              <Link
                href="/profile"
                className={`text-sm font-medium hover:underline hover:text-primary ${
                  pathname === "/profile" ? "text-primary" : ""
                }`}
              >
                <User className="h-5 w-5" />
              </Link>
            )}
            {!isAuthenticated && (
              <Link
                href={`/login?redirect=${pathname}`}
                className={`text-sm font-medium hover:text-primary hover:underline ${
                  pathname === "/login" ? "text-primary" : ""
                }`}
              >
                Login
              </Link>
            )}
          </nav>
          <div className="flex md:hidden items-center justify-end w-full">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button className="variant-outline">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-lg font-medium hover:underline hover:text-primary ${
                        pathname === link.href ? "text-primary" : ""
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.text}
                    </Link>
                  ))}
                  {!loading && isAuthenticated && (
                    <Link
                      href="/profile"
                      className={`text-lg font-medium hover:underline hover:text-primary ${
                        pathname === "/profile" ? "text-primary" : ""
                      }`}
                    >
                      <User className="h-6 w-6" />
                    </Link>
                  )}
                  {!loading && !isAuthenticated && (
                    <Button onClick={() => setIsOpen(false)} asChild>
                      <Link href="/login">Login</Link>
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
