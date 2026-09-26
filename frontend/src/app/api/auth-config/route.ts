import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const env = process.env;
  const config = {
    apiKey: env.FIREBASE_API_KEY || env["NEXT_PUBLIC_FIREBASE_API_KEY"] || "",
    authDomain: env.FIREBASE_AUTH_DOMAIN || env["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"] || "",
    projectId: env.FIREBASE_PROJECT_ID || env["NEXT_PUBLIC_FIREBASE_PROJECT_ID"] || "",
    storageBucket: env.FIREBASE_STORAGE_BUCKET || env["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"] || "",
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID || env["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"] || "",
    appId: env.FIREBASE_APP_ID || env["NEXT_PUBLIC_FIREBASE_APP_ID"] || ""
  };

  return NextResponse.json(config, {
    headers: {
      "Cache-Control": "no-store, max-age=0"
    }
  });
}
