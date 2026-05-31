import admin from "firebase-admin";

if (!admin.apps.length) {
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");

  if (!sa.project_id || !sa.client_email || !sa.private_key) {
    throw new Error("Missing Firebase Service Account env variable or invalid format");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: sa.project_id,
      clientEmail: sa.client_email,
      privateKey: sa.private_key.replace(/\\n/g, "\n"),
    }),
  });
}

export const db = admin.firestore();
export const messaging = admin.messaging();
