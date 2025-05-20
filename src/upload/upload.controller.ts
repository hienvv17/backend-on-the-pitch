import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import ImageKit from 'imagekit';

@Controller('upload-auth')
export class UploadController {
  private imagekit: ImageKit;

  constructor() {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
      console.error('Missing ImageKit configuration in environment variables');
    }

    this.imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });
  }

  @Get()
  getUploadAuth() {
    try {
      const result = this.imagekit.getAuthenticationParameters();
      return {
        ...result,
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      };
    } catch (err) {
      throw new InternalServerErrorException('Failed to generate upload authentication parameters');
    }
  }
}
