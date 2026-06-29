import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://app.elevatemindstudio.net"),
  title: {
    default: "ElevateMindStudio",
    template: "%s | ElevateMindStudio"
  },
  description: "AI-native social media operating system for planning, reviewing, and publishing brand content.",
  icons: {
    icon: [
      {
        url: "/brand/elevatemind-final/elevatemind-icon-64x64-transparent.png",
        sizes: "64x64",
        type: "image/png"
      },
      {
        url: "/brand/elevatemind-final/elevatemind-icon-512x512-transparent.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    apple: "/brand/elevatemind-final/elevatemind-icon-512x512-bone.png"
  },
  openGraph: {
    title: "ElevateMindStudio",
    description: "AI-native social media operating system for brand content teams.",
    url: "https://app.elevatemindstudio.net",
    siteName: "ElevateMindStudio",
    type: "website",
    images: [
      {
        url: "/brand/elevatemind-final/elevatemind-logo-asset-pack-preview.png",
        width: 1800,
        height: 450,
        alt: "ElevateMindStudio logo system"
      }
    ]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
