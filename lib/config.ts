


const config = {
    env :{
        apiEndpoint:process.env.NEXT_PUBLIC_API_ENDPOINT!,
        prodApiEndpoint:process.env.NEXT_PUBLIC_PROD_API_ENDPOINT!,
        imagekit :{
            publicKey:process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
            urlEndpoint:process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
            privateKey:process.env.IMAGEKIT_PRIVATE_KEY
        },
        databaseUrl:process.env.DATABASE_URL!,
        upstash:{
            redisUrl:process.env.UPSTASH_REDIS_URL,
            redisToken:process.env.UPSTASH_REDIS_TOKEN,
            qstashUrl: process.env.QSTASH_URL,
            qstashToken: process.env.QSTASH_TOKEN
        },
        emaijs:{
            emailId:process.env.EMAILJS_SERVICE_ID,
            emailTemplateId:process.env.EMAILJS_TEMPLATE_ID,
            emailPublicKey:process.env.EMAILJS_PUBLIC_KEY,
            emailPrivateKey:process.env.EMAILJS_PRIVATE_KEY
        }
    }
}


 

export default config