import config from '@/lib/config'
import { ImageKitProvider, Video } from '@imagekit/next'
import React from 'react'

const BookVideo = ({vidUrl}:{vidUrl:string}) => {
  return (
     <ImageKitProvider urlEndpoint={config.env.imagekit.urlEndpoint} >
        <Video
          src={vidUrl}
          controls
          height={500}
          width={500}
        />
     </ImageKitProvider>
  )
}

export default BookVideo