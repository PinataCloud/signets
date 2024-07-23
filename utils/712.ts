export const domain = {
  name: "Sign Content",
  version: "1.0.0",
  chainId: 1,
} as const;

// The named list of all type definitions
export const types = {
  Sign: [
    { name: "address", type: "address" },
    { name: "cid", type: "string" },
    { name: "date", type: "string" },
  ],
  // Necessary to define salt param type
  EIP712Domain: [
    {
      name: "name",
      type: "string",
    },
    {
      name: "version",
      type: "string",
    },
    {
      name: "chainId",
      type: "uint256",
    },
  ],
};
