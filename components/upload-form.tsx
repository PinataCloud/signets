"use client";

import { generatePinataKey, uploadFile } from "@/utils/upload";
import { Button } from "./ui/button";
import { getAccessToken, usePrivy, useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { ReloadIcon, CheckCircledIcon, CopyIcon, CheckIcon } from "@radix-ui/react-icons";
import { Input } from "./ui/input";
import { domain, types } from "@/utils/712";
import { LoginButton } from "./login-button";
import { Label } from "./ui/label";
import { useToast } from "@/components/ui/use-toast";
import { wait } from "@/utils/wait";

export function UploadForm() {
  const [selectedFile, setSelectedFile] = useState();
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [cid, setCid] = useState("");
  const [copied, setCopied] = useState(false);
  const { ready, wallets } = useWallets();
  const { authenticated, signTypedData, user } = usePrivy();
  const { toast } = useToast();

  function reset() {
    setSelectedFile(undefined);
    setComplete(false);
    setCid("");
  }

  async function copyToClipboard(text: any) {
    navigator.clipboard
      .writeText(text)
      .then(async () => {
        setCopied(true);

        await wait(1000);

        setCopied(false);
      })
      .catch((err) => {
        console.error("Failed to copy text to clipboard: ", err);
      });
  }

  function fileHandler(event: any) {
    const file = event?.target?.files[0];
    setSelectedFile(file);
  }

  async function submitHandler() {
    try {
      setLoading(true);
      const accessToken: string | null = await getAccessToken();
      const keys = await generatePinataKey(accessToken);
      // Upload the selected file
      const uploadData = await uploadFile(selectedFile, keys.JWT);
      const wallet = wallets[0];
      // Prepare the message to be signed
      const message = {
        address: user?.wallet?.address,
        cid: uploadData?.IpfsHash,
        date: uploadData?.Timestamp,
      };
      // Prepare the sign data payload
      const typedData = {
        primaryType: "Sign",
        domain: domain,
        types: types,
        message: message,
      };
      let signature: string;
      if (wallets[0] === undefined) {
        // sign with privy's embedded wallets
        signature = await signTypedData(typedData);
      } else {
        // sign with user's connected wallet
        await wallet.switchChain(1);
        const provider = await wallet.getEthereumProvider();
        signature = await provider.request({
          method: "eth_signTypedData_v4",
          params: [wallet.address, JSON.stringify(typedData)],
        });
        console.log(signature);
      }

      // Make API call to register signature with CID with Pinata
      const sign = await fetch("/api/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          signature: signature,
          IpfsHash: uploadData?.IpfsHash,
        }),
      });
      if (sign.status === 401) {
        toast({
          title: "Content already signed",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      const signConfirm = await sign.json();
      console.log(signConfirm);
      setCid(uploadData?.IpfsHash!);
      setLoading(false);
      setComplete(true);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  function ButtonLoading() {
    return (
      <Button className="w-full" disabled>
        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
        Uploading...
      </Button>
    );
  }

  if (!authenticated) {
    return <LoginButton />;
  }

  return (
    <div className="flex flex-col gap-2 justify-center items-center w-full">
      {!complete && (
        <>
          <p className="my-6">Upload a file and sign it with your wallet to verify it.</p>
          <Input id="file-upload" onChange={fileHandler} type="file" />
          {loading ? (
            ButtonLoading()
          ) : (
            <Button className="w-full" onClick={submitHandler}>
              Upload
            </Button>
          )}
        </>
      )}
      {complete && (
        <div className="flex flex-col gap-1 justify-center items-center my-4 w-full">
          <CheckCircledIcon className="w-12 h-12 font-bold" />
          <h2 className="text-2xl font-bold">Upload Complete!</h2>
          <p>Share with the link below</p>
          <div className="flex items-center space-x-2 mt-4 w-full">
            <div className="grid gap-2 w-full">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                className="w-full"
                id="link"
                defaultValue={`https://signets.cloud/content/${cid}`}
                readOnly
              />
            </div>
            <Button
              onClick={() => copyToClipboard(`https://signets.cloud/content/${cid}`)}
              type="submit"
              size="sm"
              className="px-3"
            >
              <span className="sr-only">Copy</span>
              {copied ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button onClick={reset} className="mt-4 w-full">
            Upload Another File
          </Button>
        </div>
      )}
    </div>
  );
}
