import config from "@/lib/config"
import { NextResponse } from "next/server"
import {getUploadAuthParams} from "@imagekit/next/server"


const {env:{imagekit:{publicKey,privateKey}}} = config

export async function  GET() {
    const token = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const expire = now + 20; 

    const {signature } = getUploadAuthParams({
      privateKey:privateKey!,
      publicKey:publicKey!,
      token,
      expire
    })
    return NextResponse.json({token,expire,signature})
}
