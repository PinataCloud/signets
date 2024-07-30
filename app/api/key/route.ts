import { type NextRequest, NextResponse } from "next/server";
const { v4: uuidv4 } = require("uuid");
import { verifySession } from "@/utils/session";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: `${process.env.PINATA_JWT}`,
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY,
});

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, res: NextResponse) {
  const authToken = req?.headers?.get("authorization")?.replace("Bearer ", "") || "";

  const verified = await verifySession(authToken);
  if (!verified) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const uuid = uuidv4();
    const keyRes = await pinata.keys.create({
      keyName: uuid.toString(),
      permissions: {
        endpoints: {
          pinning: {
            pinFileToIPFS: true,
          },
        },
      },
      maxUses: 1,
    });
    const keyData = {
      pinata_api_key: keyRes.pinata_api_key,
      JWT: keyRes.JWT,
    };
    return NextResponse.json(keyData, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ text: "Error creating API Key:" }, { status: 500 });
  }
}
