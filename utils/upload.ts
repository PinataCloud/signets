import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: `${process.env.PINATA_JWT}`,
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL,
});

export const generatePinataKey = async (accessToken: string | null) => {
  try {
    const tempKey = await fetch("/api/key", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
    const keyData = await tempKey.json();
    return keyData;
  } catch (error) {
    console.log("error making API key:", error);
    throw error;
  }
};

export async function uploadFile(selectedFile: any, keyToUse: string, name?: string) {
  try {
    const uploadRes = await pinata.upload
      .file(selectedFile)
      .addMetadata({
        name: name || selectedFile.name,
      })
      .key(keyToUse);
    if (!uploadRes) {
      throw Error;
    }
    return uploadRes;
  } catch (error) {
    console.log("Error uploading file:", error);
  }
}
