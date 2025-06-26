"use client"

import AuthForm from '@/components/AuthForm'
import { signUpSchema } from '@/lib/validations'
import {SignUp} from "@/lib/actions/auth"
import React from 'react'


const Page = () => {
 return (
<AuthForm
     type="SIGN_UP"
     schema={signUpSchema}
     defaultValues={{
        email:"",
        password:"",
        fullName:"",
        universityId:0,
        universityCard:"",
     }}
     onSubmit = {SignUp}
    />
)

}
export default Page