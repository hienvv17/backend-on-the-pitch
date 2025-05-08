// src/upload/upload.controller.ts
import { Controller, Get } from '@nestjs/common';
import ImageKit from 'imagekit';

@Controller('upload-auth')
export class UploadController {
  private imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
  });

  @Get()
  getUploadAuth() {
    const result = this.imagekit.getAuthenticationParameters();
    return {
      ...result,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    };
  }
}
