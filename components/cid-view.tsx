"use client";

import {
  CheckCircledIcon,
  FileIcon,
  ReloadIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import { Header } from "./header";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { isAddress } from "viem";
import { useToast } from "./ui/use-toast";

export function CidView({ data, cid }: any) {
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [verified, setVerified] = useState(false);
  const [address, setAddress] = useState("");
  const { toast } = useToast();

  function handleAddress(event: any) {
    setAddress(event.target.value);
  }

  async function verifyContent() {
    try {
      setLoading(true);
      const validAddress = isAddress(address);
      if (!validAddress) {
        toast({
          title: "Invalid address",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      const verifyReq = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cid: cid,
          address: address,
        }),
      });
      if (!verifyReq.ok) {
        setVerified(false);
        setLoading(false);
        setComplete(true);
        return;
      }
      const verifyData = await verifyReq.json();
      console.log(verifyData);
      setVerified(verifyData);
      setLoading(false);
      setComplete(true);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  async function downloadFile() {
    try {
      const response = await fetch(
        `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${cid}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = data[0].metadata.name;

      // Append to the document body for Firefox
      document.body.appendChild(link);

      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  }

  function ButtonLoading() {
    return (
      <Button className="w-full" disabled>
        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
        Verifying...
      </Button>
    );
  }

  function truncateString(str: string) {
    if (str.length > 30) {
      return `${str.slice(0, 25)}...${str.slice(-5)}`;
    } else {
      return str;
    }
  }

  return (
    <Dialog>
      <Card className="w-[400px] p-4 flex flex-col gap-6 justify-between items-center">
        <Header />
        <div className="flex flex-col gap-1 items-center justify-center">
          <FileIcon className="w-16 h-16" />
          <p className="text-wrap">{truncateString(data[0].metadata.name)}</p>
        </div>
        <div className="flex gap-2 w-full mt-4">
          <Button className="flex-1" onClick={downloadFile}>
            Download
          </Button>
          <DialogTrigger asChild>
            <Button className="flex-1">Verify</Button>
          </DialogTrigger>
        </div>
        <DialogContent className="w-[400px] flex flex-col justify-center items-center">
          {complete ? (
            <>
              {verified ? (
                <>
                  <CheckCircledIcon className="h-16 w-16" />
                  <h2 className="text-2xl font-bold">Verified!</h2>
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="h-16 w-16" />
                  <h2 className="text-2xl font-bold">Not Verified</h2>
                  <Button onClick={() => setComplete(false)}>Try Again</Button>
                </>
              )}
            </>
          ) : (
            <div className="w-full">
              <DialogHeader className="self-start">
                <h2 className="text-2xl font-bold">Verify Content Signature</h2>
                <p>Provide the address of the author below</p>
              </DialogHeader>
              <Input
                className="my-4"
                type="text"
                placeholder="Wallet Address"
                onChange={handleAddress}
              />
              {loading ? (
                ButtonLoading()
              ) : (
                <Button className="w-full" onClick={verifyContent}>
                  Verify
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Card>
    </Dialog>
  );
}
