import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";

const columns = [
  {
    title: "COMPANY",
    links: ["About Us", "How It Works", "Breeder Guidelines", "Contact Us", "Blog"],
  },
  {
    title: "USEFUL LINKS",
    links: ["Search Poodles", "Browse Breeders", "Post a Listing", "Help Center", "Terms of Service", "Privacy Policy"],
  },
  {
    title: "FOR BREEDERS",
    links: ["Create Account", "Breeder Dashboard", "Breeder Verification", "Resources", "Transport Guide"],
  },
];

export default function Footer() {
  return (
    <footer className="bg-pd-black text-white pt-14 p
