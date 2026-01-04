import { Module, Global } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { existsSync } from 'fs';

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT; // optional: raw JSON string

if (serviceAccountPath && existsSync(serviceAccountPath)) {
  // load service account JSON file
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const sa = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(sa),
  });
} else if (serviceAccountJson) {
  // parse JSON from env var (useful for CI or containers)
  try {
    const sa = JSON.parse(serviceAccountJson);
    admin.initializeApp({
      credential: admin.credential.cert(sa),
    });
  } catch (e) {
    // fallback to default if parsing fails
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', e);
    admin.initializeApp();
  }
} else {
  // fallback to default application credentials (ADC) if available
  admin.initializeApp();
}

@Global()
@Module({
  providers: [
    {
      provide: 'FIRESTORE',
      useValue: admin.firestore(),
    },
  ],
  exports: ['FIRESTORE'],
})
export class FirebaseModule {}