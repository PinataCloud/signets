"use client";

import { generatePinataKey, uploadFile } from "@/utils/upload";
import { Button } from "./ui/button";
import { getAccessToken, usePrivy, useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import {
  ReloadIcon,
  CheckCircledIcon,
  CopyIcon,
  CheckIcon,
} from "@radix-ui/react-icons";
import { Input } from "./ui/input";
import { domain, types } from "@/utils/712";
import { LoginButton } from "./login-button";
import { Label } from "./ui/label";
import { useToast } from "@/components/ui/use-toast";
import { recoverPublicKey } from "viem";
import { encrypt } from "@metamask/eth-sig-util";

export function UploadForm() {
  const [selectedFile, setSelectedFile] = useState();
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [cid, setCid] = useState("");
  const [copied, setCopied] = useState(false);
  const { ready, wallets } = useWallets();
  const { authenticated } = usePrivy();
  const { toast } = useToast();

  function reset() {
    setSelectedFile(undefined);
    setComplete(false);
    setCid("");
  }

  const wait = (milliseconds: number) => {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  };

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
      const uploadData = await uploadFile(selectedFile, keys.JWT);
      const wallet = wallets[0];
      const message = {
        address: wallet.address,
        cid: uploadData.IpfsHash,
        date: uploadData.Timestamp,
      };
      const typedData = {
        primaryType: "Sign",
        domain: domain,
        types: types,
        message: message,
      };
      await wallet.switchChain(1);
      const provider = await wallet.getEthereumProvider();
      const signature = await provider.request({
        method: "eth_signTypedData_v4",
        params: [wallet.address, JSON.stringify(typedData)],
      });
      console.log(signature);

      const publicKey = await recoverPublicKey({
        hash: JSON.stringify(typedData) as "0x",
        signature: signature,
      });
      console.log(publicKey);

      const encrypted = encrypt({
        data: JSON.stringify(selectedFile),
        publicKey: publicKey.slice(2),
        version: "x25519-xsalsa20-poly1305",
      });
      console.log(encrypted);

      const sign = await fetch("/api/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          signature: signature,
          IpfsHash: uploadData.IpfsHash,
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
      setCid(uploadData.IpfsHash);
      setLoading(false);
      setComplete(true);
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  }

  async function encryption() {
    try {
      const wallet = wallets[0];
      await wallet.switchChain(1);
      const provider = await wallet.getEthereumProvider();
      const encryptionPublicKey = await window.ethereum.request({
        method: "eth_getEncryptionPublicKey",
        params: [wallet.address],
      });
      console.log(encryptionPublicKey);
    } catch (error) {
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
    <div className="flex flex-col gap-2 justify-center items-center">
      {!complete && (
        <>
          <p className="my-6">
            Upload a file and sign it with your wallet to verify it.
          </p>
          <Input id="file-upload" onChange={fileHandler} type="file" />
          {loading ? (
            ButtonLoading()
          ) : (
            <Button className="w-full" onClick={submitHandler}>
              Upload
            </Button>
          )}
          <Button onClick={encryption}>Encrypt</Button>
        </>
      )}
      {complete && (
        <div className="flex flex-col gap-1 justify-center items-center my-4">
          <CheckCircledIcon className="w-12 h-12 font-bold" />
          <h2 className="text-2xl font-bold">Upload Complete!</h2>
          <p>Share with the link below</p>
          <div className="flex items-center space-x-2 mt-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                defaultValue={`https://signets.cloud/content/${cid}`}
                readOnly
              />
            </div>
            <Button
              onClick={() =>
                copyToClipboard(`https://signets.cloud/content/${cid}`)
              }
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
          <Button onClick={reset} className="mt-4">
            Upload Another File
          </Button>
        </div>
      )}
    </div>
  );
}
