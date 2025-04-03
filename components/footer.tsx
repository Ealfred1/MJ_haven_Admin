import { Logo } from "./logo"
import Link from "next/link"
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-white border-t py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Logo />
          </div>

          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-6 md:mb-0">
            <Link href="/about" className="text-sm text-gray-600 hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-sm text-gray-600 hover:text-primary transition-colors">
              Contact
            </Link>
            <Link href="/terms" className="text-sm text-gray-600 hover:text-primary transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-primary transition-colors">
              Privacy Policy
            </Link>
          </nav>

          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors">
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-gray-500">&copy;2025   MJ's Haven. All rights reserved</p>
        </div>
      </div>
    </footer>
  )
}

