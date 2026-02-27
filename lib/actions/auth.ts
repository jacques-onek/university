"use server"

import { signIn } from "@/auth";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { AuthCredentials } from "@/types"
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
// import ratelimit from "../ratelimit";
import { redirect } from "next/navigation";
// import { workflowClient } from "../workflow";
import config from "../config";


export const SignInWithCredentials = async (params:Pick<AuthCredentials,"email"|"password">) => {
     const {email,password} = params
     
    // const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1"
    // const {success} = await ratelimit.limit(ip)
    // if (!success) return redirect("/too-fast") 

     try {
        
        const result = await signIn("credentials",{email,password,redirect:false})

        if (result?.error) {
            return {success:false,error:result.error}
        }
        return {success:true}
     } catch (error) {
        console.log(error,"SignIn error");
        return {success:false,error:"SignIn Failed "}
     }
}

export const SignUp = async (params:AuthCredentials) => {
    const {email,password,fullName,universityId,universityCard} =  params ; 

    // const ip = (await headers()).get("x-forwarded-for") || "127.0.0.1"
    // const {success} = await ratelimit.limit(ip)
    // if (!success) return redirect("/too-fast") 

    const UserExist = await db.select().from(users).where(eq(users.email,email))

    if (UserExist.length > 0) {
        return {success:false, error:"user already exist !"}
    }

    const hashedPassword = await hash(password,10)

    try {
        await db.insert(users).values({
            fullName,
            email,
            password:hashedPassword!,
            universityId,
            universityCard
        })

  await SignInWithCredentials({email,password})
  // await workflowClient.trigger({
  //       url: `${config.env.prodApiEndpoint}/api/workflow/onboarding`,
  //       body: { email, fullName },
  //    });
        return {success:true}
    } catch (error) {
        console.log(error,"SignUp error ");
        return {success:false,error:"SignUp error "}
    }


}
