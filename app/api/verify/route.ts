import { type NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/utils/session";
import { verifyTypedData } from "viem";
import { domain, types } from "@/utils/712";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, res: NextResponse) {
  const body = await req.json();
  try {
    // Get signature via the gateway
    const signatureReq = await fetch(
      `https://${process.env.GATEWAY_URL}/ipfs/${body.cid}`,
      {
        method: "HEAD",
      },
    );
    const signature = signatureReq.headers.get("pinata-signature");
    console.log("signature: ", signature);
    // All the other information provided by our component
    console.log("file date: ", body.date);
    console.log("address: ", body.address);
    console.log("cid: ", body.cid);

    // Recreate the message used in the signature
    const message = {
      address: body.address,
      cid: body.cid,
      date: body.date,
    };
    console.log(message);

    // Verify the signature
    const verify = await verifyTypedData({
      address: body.address as "0x",
      domain: domain as any,
      types: types,
      primaryType: "Sign",
      message,
      signature: signature as "0x",
    });
    console.log(verify);

    // Returns true or false
    return NextResponse.json(verify, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ text: "Error verifying file" }, { status: 500 });
  }
}
