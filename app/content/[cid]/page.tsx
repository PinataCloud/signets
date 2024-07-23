import { CidView } from "@/components/cid-view";

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
  const cid = params.cid;
  const data = await getData(cid);
  console.log(data);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24 gap-24">
      <CidView cid={cid} data={data} />
    </main>
  );
}
