"use client"
import {Image,ImageKitProvider,upload} from "@imagekit/next"
import  config  from "../lib/config"
import { useRef, useState } from "react"
import { toast } from "@/hooks/use-toast"

const {env:{imagekit:{publicKey,urlEndpoint}}} = config


const ImageUpload = ({onFileChange}:{onFileChange:(filePath:string | undefined) => void}) => {
  
  const UploadRef= useRef<HTMLInputElement>(null)
  const [file,setFile] = useState<File|string|null>(null)
  const [PreviewUrl,setPreviewUrl] = useState<string|null>()
  
  const authenticator = async () => {
  try {
      const response = await fetch(`${config.env.apiEndpoint}/api/auth/imageKit`)
      if (!response.ok) {
        const errorText = await response.text();
  
        throw new Error(
          `Request failed with status ${response.status} : ${errorText}`
        )
      }
  
      const data = await response.json();
      const {signature,expire,token} = data
      return {token,expire,signature}
    } catch (error:any) {
      throw new Error(`authentification failed ${error.message}`)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);


  let authParams;

    try {
            authParams = await authenticator();

        } catch (authError) {
            console.error("Failed to authenticate for upload:", authError);
            return;
        }
        const { signature, expire, token } = authParams;

    try {
      
        const response = await upload({
                expire,
                token,
                signature,
                publicKey:publicKey!,
                file:selectedFile,
                fileName:selectedFile.name,

        
        })

        response && (

          toast({
            title:"Image uploaded successfully",
            description:`${PreviewUrl} uploaded successfully`
          })
        )

        setPreviewUrl(response.filePath)
        console.log(response.filePath)
        onFileChange(response.filePath)

    } catch (error) {
      console.log(error)
      toast({
        title:"failed to upload !",
        description:"the file was not successfully uploaded !",
        variant:"destructive"
      })
    }
  }
  return <>
         <input type="file" className="hidden" ref={UploadRef} onChange={handleFileChange} />
         <button className="upload-btn" onClick={(e) => {
          e.preventDefault()
          UploadRef.current?.click()}}>
            <img src="/icons/upload.svg" alt="upload" width={20} height={20} className="object-contain" />
            <p className="text-base text-light-100">Upload File</p>

            {file && <p className="upload_filename">{typeof file === "string" ? file : file.name}</p> }

         </button>
         {PreviewUrl && (
          <ImageKitProvider  urlEndpoint={urlEndpoint}>
           <Image
           src={PreviewUrl}
            alt={PreviewUrl}
            width={500}
            height={500}
            className="object-cover"
           />
       </ImageKitProvider>
          
         )}
    </>
        
}

export default ImageUpload