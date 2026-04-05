"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
        isActive
          ? "text-accent bg-accent-subtle/50"
          : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
      }`}
    >
      {children}
    </Link>
  );
}

export function Header() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const isAuthReady = isLoaded && !isLoading;
  const showSignedInUi = Boolean(isSignedIn);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-sm group-hover:shadow-md transition-shadow duration-150">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-text-primary tracking-tight">
                Polls
              </p>
              <p className="text-xs text-text-tertiary">Create & share polls</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            <NavLink href="/">Browse</NavLink>
            <NavLink href="/new">Create</NavLink>
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {!isAuthReady ? (
              <div className="h-9 w-24 rounded-lg border border-border bg-surface-subtle" />
            ) : showSignedInUi ? (
              <div className="flex items-center gap-2">
                {isAuthenticated ? null : (
                  <span className="hidden rounded-md bg-surface-subtle px-2 py-1 text-xs font-medium text-text-tertiary sm:inline-flex">
                    Syncing
                  </span>
                )}
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-9 w-9 rounded-lg",
                      userButtonTrigger: "focus:shadow-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-lg",
                    },
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/sign-in"
                  className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-150"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent-hover active:bg-accent-hover transition-colors duration-150 shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
