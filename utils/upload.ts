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

export async function uploadFile(
  selectedFile: any,
  keyToUse: string,
  name?: string,
) {
  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    if (name) {
      formData.append("pinataMetadata", JSON.stringify({ name: name }));
    }

    const options = JSON.stringify({
      cidVersion: 1,
    });
    formData.append("pinataOptions", options);

    const uploadRes = await fetch(
      `${process.env.NEXT_PUBLIC_PINATA_URL}/pinning/pinFileToIPFS`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${keyToUse}`,
        },
        body: formData,
      },
    );
    if (uploadRes.status !== 200) {
      throw Error;
    }
    const uploadResJson = await uploadRes.json();
    console.log(uploadResJson);
    return uploadResJson;
  } catch (error) {
    console.log("Error uploading file:", error);
  }
}
