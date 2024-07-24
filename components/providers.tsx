"use client";

import { PrivyProvider } from "@privy-io/react-auth";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={`${process.env.NEXT_PUBLIC_PRIVY_APP_ID}`}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#000000",
          logo: "https://dweb.mypinata.cloud/ipfs/bafkreigurw5b63x3yg3mjpqn3nmhaekiqowduck4h2uo2nn6iaobsytvkm/",
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
