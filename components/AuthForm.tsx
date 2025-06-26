"use client"
import {zodResolver} from "@hookform/resolvers/zod"
import {DefaultValues, FieldValues, Path, SubmitHandler, useForm, UseFormReturn} from "react-hook-form"
import { ZodType } from "zod"
import { Form, FormControl , FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Link from "next/link";
import { FIELD_NAMES, FIELD_TYPES } from "@/constant";
import ImageUpload from "./ImageUpload";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Props<T extends FieldValues> {
    schema:ZodType<T>;
    defaultValues:T;
    onSubmit:(data:T) => Promise<{success:boolean,error?:string}>
    type:"SIGN_IN" | "SIGN_UP"
}

const AuthForm = <T extends FieldValues> ({type,schema,defaultValues,onSubmit}: Props<T>) => {

    const router = useRouter()
    const isSignIn = type === "SIGN_IN" ;
    
    const form : UseFormReturn<T> = useForm ({
        resolver:zodResolver(schema),
        defaultValues: defaultValues as DefaultValues<T>
    })

    const handleSubmit : SubmitHandler<T> = async (data) => {
      const result = await onSubmit(data) 
      console.log(data)
      if (result.success) {
        toast({
          title:"Success",    
          description:isSignIn ? "you have SuccessFully SignIn" :"you have SuccessFully SignUp "
        })
        router.push("/")
      }
      else {
        toast({
          title:isSignIn ?"SignIn Failed":"SignUp Falaid",
          description:result.error ?? "An error Occured.",
          variant:"destructive"
        })
      }
    }
  return (
    <div className="flex flex-col gap-4">

    <h1 className="text-2xl font-semibold text-white">{
        isSignIn ? "Welcome back to BookWise " : "create your library account"
        }</h1>

    <p className="text-light-100">
       {isSignIn 
       ? "Access the vast collection of resources, and stay updated" 
       : "Please complete all fields and upload a valid university ID to gain "}
    </p>
     <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="w-full space-y-6"
        >
           {Object.keys(defaultValues).map((field) => (
               <FormField
               key={field}
                control={form.control}
                name={field as Path<T>}
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel className="capitalize">
                       {FIELD_NAMES[field.name as keyof typeof FIELD_NAMES] }
                     </FormLabel>
                     <FormControl>
                        {field.name === "universityCard" ? (
                            <ImageUpload onFileChange={field.onChange} />
                        ) :
                        <Input
                          required
                          type={FIELD_TYPES[field.name as keyof typeof FIELD_TYPES]}
                          className="form-input"
                          {...field}
                        />
                         }
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />

           ))}

          <Button type="submit" className="form-btn">
           {isSignIn ? "Sign In " : "Sign Up"} 
          </Button>
        </form>
      </Form>
      <p className="text-center text-base font-medium">
        {isSignIn ? "New to BookWise " : "Already have an account ?"}
        <Link 
         href={isSignIn ? "/sign-up" : "/sign-in"}
         className="font-bold text-primary ml-3 "
        >
         {isSignIn ? " Create an account" : "Sign-in"}
        </Link>
      </p>
    </div>
  )
}

export default AuthForm