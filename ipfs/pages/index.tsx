import { ConnectWallet } from "@thirdweb-dev/react";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";

import { useStorageUpload } from "@thirdweb-dev/react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

const Home: NextPage = () => {
  const { mutateAsync: upload } = useStorageUpload();
  const [hashKey, setHashKey] = useState<string>("");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const uris = await upload({data: acceptedFiles });
      console.log(uris);
      setHashKey(uris[0]); // assuming there's only one file uploaded
    },
    [upload]
  );
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div>
      <div className={styles.title}>
        <h3>Publish Your Article Here</h3>
        <p>Upload your article in a (*.pdf) Format</p>
      </div>
      <div  className={styles.dropzoneContainer} {...getRootProps()}>
        <input {...getInputProps()} />
        <button className ={styles.btn}>Click here to drop files to upload them to IPFS</button>
      </div>
      <div className={styles.uploadedFile} > 
        {hashKey}
      </div>
      <div className={styles.footer}>Copy the above Url and paste it in the Url of the previous page</div>
      
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.connect}>
            <ConnectWallet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;

