import { CidView } from "@/components/cid-view";

// Fetch data about the file from pinList, things like the timestamp and name of the file
async function getData(cid: string) {
  try {
    const fileReq = await fetch(
      `${process.env.NEXT_PUBLIC_PINATA_URL}/data/pinList?cid=${cid}&status=pinned`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
      },
    );
    const fileRes = await fileReq.json();
    return fileRes.rows;
  } catch (error) {
    return error;
  }
}

export default async function Page({ params }: { params: { cid: string } }) {
  // Dynamic path
  const cid = params.cid;
  // Getting data for CID
  const data = await getData(cid);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-24 gap-24">
      {/* Passing file into the CidView component */}
      <CidView cid={cid} data={data} />
    </main>
  );
}
