import dummyBooks from "../dummybooks.json"
import { books } from "@/database/schema"
import {config} from "dotenv"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import ImageKit from "imagekit";

config({path:".env.local"})

const sql=neon(process.env.DATABASE_URL!)
const db = drizzle({client:sql})

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
});

const uploadToImagekit = async (url:string,fileName:string,folder:string) => {
  try {
    const response = await imagekit.upload({file:url,fileName,folder})
    return response.filePath
  } catch (error) {
    console.error("failed to upload the asset",error)
  }

}

const seed = async () => {
    console.log("seeding data ...")


    try {
      for(const book of dummyBooks){
         const coverUrl = await uploadToImagekit(book.coverUrl,`${book.title}.jpg`,"books/covers") as string
         const videoUrl = await uploadToImagekit(book.videoUrl,`${book.title}.mp4`,"books/videos") as string
         
         await db.insert(books).values({...book,coverUrl,videoUrl})
      }

      console.log("data seeded successfully")

    } catch (error) {
      console.error("Erro seeding data :",error)
    }
}


seed()
