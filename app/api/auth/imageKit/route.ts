import config from "@/lib/config"
import { NextResponse } from "next/server"
import {getUploadAuthParams} from "@imagekit/next/server"


const {env:{imagekit:{publicKey,privateKey}}} = config
  
  const token = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  const expire = now + 20; 

const {signature } = getUploadAuthParams({
    privateKey:privateKey!,
    publicKey:publicKey!,
    token,
    expire
})

export async function  GET() {
    return NextResponse.json({token,expire,signature})
}