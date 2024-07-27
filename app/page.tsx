"use client";

import { Header } from "@/components/header";
import { LoginButton } from "@/components/login-button";
import { UploadForm } from "@/components/upload-form";
import { usePrivy } from "@privy-io/react-auth";
import { Card } from "@/components/ui/card";

export default function Home() {
  const { ready, authenticated } = usePrivy();

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-24 gap-24">
      {ready && !authenticated && (
        <>
          <div className="flex flex-col items-center gap-2">
            <h1 className="font-mono text-5xl font-bold">SIGNETS</h1>
            <h2 className="text-xl">Upload and share verified content</h2>
          </div>
          <LoginButton />
        </>
      )}
      {authenticated && (
        <Card className="w-[350px] sm:w-[400px] p-4 flex flex-col gap-4 justify-between">
          <Header />
          <UploadForm />
        </Card>
      )}
    </main>
  );
}
