import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POODLES.DOG — Find. Connect. Love.",
  description:
    "The global marketplace for Poodle puppies and dogs from responsible breeders.",
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
