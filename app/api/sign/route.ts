import { type NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/utils/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, res: NextResponse) {
  const body = await req.json();
  const authToken =
    req?.headers?.get("authorization")?.replace("Bearer ", "") || "";

  const verified = await verifySession(authToken);
  if (!verified) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    // API call to add signature to CID
    const postSignature = await fetch(
      `${process.env.NEXT_PUBLIC_PINATA_URL}/v3/ipfs/signature/${body.IpfsHash}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
        body: JSON.stringify({ signature: body.signature }),
      },
    );
    if (!postSignature.ok) {
      return NextResponse.json(
        { data: "Content already signed" },
        { status: 401 },
      );
    }
    const postSignatureRes = await postSignature.json();
    return NextResponse.json(postSignatureRes, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { text: "Error creating API Key:" },
      { status: 500 },
    );
  }
}
