import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { config as envConfig } from 'dotenv';

envConfig();
@Injectable()
export class AuthService {
  constructor() {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  async login(access_token: string) {
    // Verify the access token from gg
    try {
      const decodedToken = await admin.auth().verifyIdToken(access_token);

      return 'Login';
    } catch (error) {}
  }
}
