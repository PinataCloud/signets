"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { LoginButton } from "./login-button";
import { usePrivy } from "@privy-io/react-auth";

export function Header() {
  const { authenticated } = usePrivy();
  return (
    <div className="flex items-center justify-between w-full mb-4">
      <Link className="font-mono text-4xl font-bold" href="/">
        SIGNETS
      </Link>

      {authenticated && <LoginButton />}
    </div>
  );
}
