"use client"
import {zodResolver} from "@hookform/resolvers/zod"
import { useForm} from "react-hook-form"
import { z } from "zod"
import { Form, FormControl , FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { bookSchema } from "@/lib/validations";
import { Book } from "@/types";
import { Textarea } from "@/components/ui/textarea"
import FileUpload from "../../FileUpload";
import ColorPicker from "../ColorPicker";
import createBook, { updateBook } from "@/lib/admin/actions/book";


interface Props extends Partial<Book> {
  type?: "create" | "update";
}


const BookForm = ({type = "create",...book}: Props) => {

    
const router = useRouter()
    
    const form  = useForm<z.infer<typeof bookSchema>> ({
        resolver:zodResolver(bookSchema),
        defaultValues:{
         title: book.title ?? "",
         description:book.description ?? "",
         author: book.author ?? "",
         genre:book.genre ?? "",
         rating:book.rating ?? 1,
         totalCopies:book.totalCopies ?? 1,
         coverUrl:book.coverUrl ?? "",
         coverColor:book.coverColor ?? "#171717",
         videoUrl: book.videoUrl ?? "",
        summary:book.summary ?? ""

        }
    })

    const onSubmit =  async (values: z.infer<typeof bookSchema>) => {
      const result =
        type === "create"
          ? await createBook(values)
          : await updateBook(book.id!, values);
      if (result.success) {
        toast({
          title:"Success",    
          description:
            type === "create"
              ? "you have SuccessFully add the book"
              : "you have SuccessFully updated the book",
        })
        router.push(`/admin/books`)
      }
      else {
        toast({
          title:type === "create" ? "can not create book" : "can not update book",
          description:
            result.message ??
            (type === "create"
              ? "An error Occured while creating book"
              : "An error Occured while updating book"),
          variant:"destructive"
        })
      }
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
                          className="book-form_input"
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
                          className="book-form_input"
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
                          className="book-form_input"
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
                          className="book-form_input"
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
                          className="book-form_input"
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
                       <FileUpload type="image" accept="image/*" 
                       placeholder="Upload a book cover" 
                       folder="books/covers" 
                       variant="light"
                       onFileChange={field.onChange}
                       value={field.value}
                       />
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
                       <ColorPicker onPickerChange={field.onChange}
                        value={field.value}
                       />
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
                       <FileUpload type="video" accept="video/*" 
                       placeholder="Upload a book cover" 
                       folder="books/videos" 
                       variant="light"
                       onFileChange={field.onChange}
                       value={field.value}
                       />                    
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
            {type === "create" ? "Add New Book To The Library" : "Save Book Changes"}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default BookForm
