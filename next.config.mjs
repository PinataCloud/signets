/** @type {import('next').NextConfig} */
const cspHeader = `
 default-src 'self';
    script-src 'self' localhost 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://www.signets.cloud/faicon.ico https://dweb.mypinata.cloud/;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    child-src https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org;
    frame-src https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com;
    connect-src https://gray-envious-minnow-323.dev-mypinata.cloud/ipfs/* https://dweb.mypinata.cloud/ipfs/* http://localhost:3000/api/verify http://localhost:3000/api/sign http://localhost:3000/api/key https://auth.privy.io/* https://*.rpc.privy.systems wss://relay.walletconnect.com wss://relay.walletconnect.org wss://www.walletlink.org https://www.signets.cloud/api/verify https://www.signets.cloud/api/sign https://www.signets.cloud/api/key https://api.pinata.cloud/pinning/pinFileToIPFS https://www.signets.cloud/*;
    upgrade-insecure-requests;
`;

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\n/g, ""),
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
