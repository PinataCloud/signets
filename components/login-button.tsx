"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { GearIcon } from "@radix-ui/react-icons";
import { wait } from "@/utils/wait";

export function LoginButton() {
  const [copied, setCopied] = useState(false);
  const { ready, authenticated, login, user, logout } = usePrivy();
  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || (ready && authenticated);

  function truncate(str: string | undefined) {
    if (str === undefined) {
      return "";
    }
    return `${str.slice(0, 4)}...${str.slice(-4)}`;
  }

  async function copyToClipboard(text: any) {
    navigator.clipboard
      .writeText(text)
      .then(async () => {
        setCopied(true);

        await wait(1000);

        setCopied(false);
      })
      .catch((err) => {
        console.error("Failed to copy text to clipboard: ", err);
      });
  }

  if (ready && authenticated) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button size="icon" variant="outline">
            <GearIcon className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <Button
            variant="ghost"
            className="flex w-full mx-auto"
            onClick={() => copyToClipboard(user?.wallet?.address)}
          >
            {copied ? "Copied!" : truncate(user?.wallet?.address)}
          </Button>
          <Button
            variant="ghost"
            className="flex w-full mx=auto"
            onClick={logout}
          >
            Logout
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button disabled={disableLogin} onClick={login}>
      {authenticated ? "Logged In" : "Login"}
    </Button>
  );
}
