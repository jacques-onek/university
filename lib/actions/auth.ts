"use server"

import { signIn } from "@/auth";
import { db } from "@/database/drizzle";
import { users } from "@/database/schema";
import { AuthCredentials } from "@/types"
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";


export const SignInWithCredentials = async (params:Pick<AuthCredentials,"email"|"password">) => {
     const {email,password} = params

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
        return {success:true}
    } catch (error) {
        console.log(error,"SignUp error ");
        return {success:false,error:"SignUp error "}
    }


}
