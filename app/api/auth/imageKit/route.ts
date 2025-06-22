import config from "@/lib/config"
import { NextResponse } from "next/server"
import {getUploadAuthParams} from "@imagekit/next/server"


const {env:{imagekit:{publicKey,privateKey}}} = config

const { token, expire, signature } = getUploadAuthParams({
    privateKey:privateKey!,
    publicKey:publicKey!
})

export async function  GET() {
    return NextResponse.json({token,expire,signature})
}