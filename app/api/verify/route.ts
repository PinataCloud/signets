import { type NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/utils/session";
import { verifyTypedData } from "viem";
import { domain, types } from "@/utils/712";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, res: NextResponse) {
  const body = await req.json();

  // const authToken =
  //   req?.headers?.get("authorization")?.replace("Bearer ", "") || "";

  // const verified = await verifySession(authToken);
  // if (!verified) {
  //   return new Response("Unauthorized", { status: 401 });
  // }
  try {
    const signatureReq = await fetch(
      `https://${process.env.GATEWAY_URL}/ipfs/${body.cid}`,
      {
        method: "HEAD",
      },
    );
    const signature = signatureReq.headers.get("pinata-signature");
    console.log("signature: ", signature);

    const fileReq = await fetch(
      `${process.env.NEXT_PUBLIC_PINATA_URL}/data/pinList?status=pinned&includesCount=false&cid=${body.cid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
      },
    );
    const fileData = await fileReq.json();
    const fileDate = fileData.rows[0].date_pinned;
    console.log("file date: ", fileDate);
    console.log("address: ", body.address);
    console.log("cid: ", body.cid);

    const message = {
      address: body.address,
      cid: body.cid,
      date: fileDate,
    };
    console.log(message);

    const verify = await verifyTypedData({
      address: body.address as "0x",
      domain: domain as any,
      types: types,
      primaryType: "Sign",
      message,
      signature: signature as "0x",
    });
    console.log(verify);

    return NextResponse.json(verify, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ text: "Error verifying file" }, { status: 500 });
  }
}
