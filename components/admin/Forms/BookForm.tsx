"use client"
import {zodResolver} from "@hookform/resolvers/zod"
import { useForm} from "react-hook-form"
import { z } from "zod"
import { Form, FormControl , FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import Link from "next/link";
import ImageUpload from "../../ImageUpload";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { bookSchema } from "@/lib/validations";
import { Book } from "@/types";
import { Textarea } from "@/components/ui/textarea"

interface Props extends Partial<Book> {
  type?: "create" | "update";
}

const BookForm = ({type,...book}: Props) => {

    const router = useRouter()
    
    
    const form  = useForm<z.infer<typeof bookSchema>> ({
     //  @ts-ignore
        resolver:zodResolver(bookSchema),
        defaultValues:{
         title: "",
         description:"",
         author: "",
         genre:"",
         rating:1,
         totalCopies:1,
         coverUrl:"",
         coverColor:"",
         videoUrl: "",
        summary:""

        }
    })

    const onSubmit =  async (values: z.infer<typeof bookSchema>) => {
      // const result = 
      // if (result.success) {
      //   toast({
      //     title:"Success",    
      //     description:isSignIn ? "you have SuccessFully SignIn" :"you have SuccessFully SignUp "
      //   })
      //   router.push("/")
      // }
      // else {
      //   toast({
      //     title:isSignIn ?"SignIn Failed":"SignUp Falaid",
      //     description:result.error ?? "An error Occured.",
      //     variant:"destructive"
      //   })
      // }
    }
  return (
    <div className="flex flex-col gap-4">
     <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-8"
        >
  
          <FormField

                control={form.control}
                name={"title"}
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel className="capitalize">
                       Book Title
                     </FormLabel>
                     <FormControl>
                        <Input
                          required
                          className="book-form"
                          placeholder="Book Title "
                          {...field}
                        />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />

          <FormField

                control={form.control}
                name={"author"}
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel className="capitalize">
                       Author
                     </FormLabel>
                     <FormControl>
                        <Input
                          required
                          className="book-form"
                          placeholder="Book Author "
                          {...field}
                        />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />

          <FormField

                control={form.control}
                name={"genre"}
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel className="capitalize">
                       Genre
                     </FormLabel>
                     <FormControl>
                        <Input
                          required
                          className="book-form"
                          placeholder="Book Genre "
                          {...field}
                        />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
          <FormField

                control={form.control}
                name={"rating"}
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel className="capitalize">
                       rating
                     </FormLabel>
                     <FormControl>
                        <Input
                        type="number"
                        min={1}
                        max={5}
                        placeholder="Book rating"
                          className="book-form"
                          {...field}
                        />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
          <FormField

                control={form.control}
                name={"totalCopies"}
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel className="capitalize">
                       Total Copies
                     </FormLabel>
                     <FormControl>
                        <Input
                        type="number"
                        min={1}
                        max={10000}
                        placeholder="Total Book copies"
                          className="book-form"
                          {...field}
                        />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
          <FormField

                control={form.control}
                name={"coverUrl"}
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel className="capitalize">
                       Book Image
                     </FormLabel>
                     <FormControl>
                      {/* file upload component  */}
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
          <FormField

                control={form.control}
                name={"coverColor"}
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel className="capitalize">
                       Primary color 
                     </FormLabel>
                     <FormControl>
                      {/* Color Picker  */}
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
          <FormField

                control={form.control}
                name={"description"}
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel className="capitalize">
                       Book description 
                     </FormLabel>
                     <FormControl>
                       <Textarea placeholder="Book description" {...field} rows={5} className="book-form_input" />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
          <FormField

                control={form.control}
                name={"videoUrl"}
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel className="capitalize">
                       Book Trailer
                     </FormLabel>
                     <FormControl>
                      {/* file upload component  */}
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
          <FormField

                control={form.control}
                name={"summary"}
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel className="capitalize">
                       Book summary 
                     </FormLabel>
                     <FormControl>
                       <Textarea placeholder="Book summary" {...field} rows={5} className="book-form_input" />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />                  

          <Button type="submit" className="book-form_btn text-white">
            Add New Book To The Library
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default BookForm