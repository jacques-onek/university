export  interface Book {
    id:string;
    title:string;
    author:string;
    genre:string;
    rating:number;
    totalCopies:number;
    availableCopies:number;
    description:string;
    coverColor:string;
    coverUrl:string;
    videoUrl:string;
    summary:string;
}


export type AuthCredentials = {
  email: string
  password: string
  fullName: string
  universityId: number
  universityCard: string
}

export interface BookParams {
  title:string
  author:string
  genre:string
  rating:number 
  coverUrl:string 
  coverColor: string
  description:string
  totalCopies:number 
  videoUrl:string
  summary:string 
}
