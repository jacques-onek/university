"use client"
import {Image,ImageKitProvider,upload, Video} from "@imagekit/next"
import  config  from "../lib/config"
import { useRef, useState } from "react"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const {env:{imagekit:{publicKey,urlEndpoint}}} = config

interface Props {
  type:"image"|"video"
  accept:string
  placeholder:string
  folder:string 
  variant:"dark"|"light"
  onFileChange:(filePath:string|undefined) => void
  value:string
}

const FileUpload = ({type,accept,placeholder,folder,variant,onFileChange,value}:Props) => {
  
  const UploadRef= useRef<HTMLInputElement>(null)
  const [file,setFile] = useState<File|string|null>(value || null)
  const [PreviewUrl,setPreviewUrl] = useState<string|null>()
  const [progress,setProgress] = useState(0)
  
  const styles = {
    button:variant ==="dark" ? "bg-dark-300" : "bg-light-600 border-gray-100 border",
    placeholder:variant ==="dark" ? "text-light-100" :"text-slate-500",
    text:variant ==="dark" ? "text-light-100" : "text-dark-500"
  }
  const authenticator = async () => {
  try {
      const response = await fetch(`${config.env.apiEndpoint}/api/auth/imageKit`,{cache:"reload"})
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

  const onValidate = (file:File) => {
    if (type === "image") {
      if(file.size > 20 * 1024 * 1024) {
        toast({
          title:"File size too large",
          description:"please upload a file that less than 20MB in size",
          variant:"destructive"
        })
      }
      return false
    }
    else if (type == "video") {
      if (file.size > 50 *1024 * 1024) {
        toast({
          title:"File size too large ",
          description:"Please upload a file that is less than 50mb in size ",
          variant:"destructive"
        })
        return false
      }

      return true
    }

  }
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    const checkSize=onValidate(selectedFile!)
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
                useUniqueFileName:true,
                onProgress:(event) => {setProgress(Math.round(event.loaded/event.total))},
                folder:folder,
                


        
        })

        response && (

          toast({
            title: `${type} uploaded successfully`,
            description:`${type} uploaded successfully`
          })
        )

        setPreviewUrl(response.filePath)
        console.log(response.filePath)
        onFileChange(response.filePath)

    } catch (error) {
      console.log(error)
      toast({
        title:`${type} upload failed`,
        description:`youe ${type} was not successfully uploaded !`,
        variant:"destructive"
      })
    }
  }
  return <>
         <input type="file" className="hidden" ref={UploadRef} onChange={handleFileChange} accept={accept} />
         <button className={cn( "upload-btn",styles.button)} onClick={(e) => {
          e.preventDefault()
          UploadRef.current?.click()}}>
            <img src="/icons/upload.svg" alt="upload" width={20} height={20} className="object-contain" />
            <p className={cn("text-base",styles.placeholder)}>{placeholder}</p>

            {file && <p className="upload_filename">{typeof file === "string" ? file : file.name}</p> }

         </button>

         {progress  > 0 && progress !== 100 && (
          <div className="w-full rounded-full bg-green-200">
             <div className="progress" style={{width:`${progress}%`}}>{progress}%</div>
          </div>
         )}
         {PreviewUrl && (
           (type === "image" ? (
        <ImageKitProvider  urlEndpoint={urlEndpoint}>
           <Image
           src={PreviewUrl}
            alt={PreviewUrl}
            width={500}
            height={500}
            className="object-cover"
           />
        </ImageKitProvider>
            ):(
        <ImageKitProvider  urlEndpoint={urlEndpoint}>
              <Video
               src={PreviewUrl}
               controls
               width={500}
               height={500}
               className="h-96 w-full rounded-xl" />
        </ImageKitProvider>))
          
         )}
    </>
        
}

export default FileUpload