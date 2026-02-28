import config from '@/lib/config'
import { ImageKitProvider, Video } from '@imagekit/next'
import React from 'react'

const BookVideo = ({vidUrl}:{vidUrl:string}) => {
  return (
     <ImageKitProvider urlEndpoint={config.env.imagekit.urlEndpoint} >
        <Video
          src={vidUrl}
          controls
          className='h-full w-full object-cover'
        />
     </ImageKitProvider>
  )
}

export default BookVideo
