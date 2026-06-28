import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://app.elevatemindstudio.net"),
  title: {
    default: "ElevateMindStudio",
    template: "%s | ElevateMindStudio"
  },
  description: "AI-native social media operating system for planning, reviewing, and publishing brand content.",
  openGraph: {
    title: "ElevateMindStudio",
    description: "AI-native social media operating system for brand content teams.",
    url: "https://app.elevatemindstudio.net",
    siteName: "ElevateMindStudio",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
