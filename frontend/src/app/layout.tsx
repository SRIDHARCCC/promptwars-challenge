import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Satta Thozhan (சட்டத் தோழன்) — Indian Citizen Pre-Advocate Legal Navigator",
  description: "AI-Powered Pre-Advocate Legal Triage, Evidence Preparation, and Notice Audit Platform for India. Powered by Google ADK 2.0 & Gemini Flash.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
