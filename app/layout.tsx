import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://poodles.dog"),
  title: "Poodles for Sale | Toy, Miniature, Medium & Standard Poodles — POODLES.DOG",
  description:
    "Find Poodle puppies and dogs for sale from responsible breeders worldwide. Toy, Miniature, Medium and Standard Poodles in every colour. Connecting Poodle lovers with breeders you can trust.",
  keywords: [
    "poodle",
    "poodles",
    "poodles for sale",
    "dogs for sale",
    "dog",
    "puppy",
    "puppies",
    "toy poodle",
    "miniature poodle",
    "medium poodle",
    "standard poodle",
    "poodle breeders",
    "poodle colours",
    "apricot poodle",
    "red poodle",
    "black poodle",
    "white poodle",
    "brown poodle",
    "silver poodle",
  ],
  openGraph: {
    title: "POODLES.DOG — Find. Connect. Love.",
    description:
      "The global home for Poodle puppies and dogs from responsible breeders. Toy, Miniature, Medium and Standard, in every colour.",
    url: "https://poodles.dog",
    siteName: "poodles.dog",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-pd-cream text-pd-black">{children}</body>
    </html>
  );
}
