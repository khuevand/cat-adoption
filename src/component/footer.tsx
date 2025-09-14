import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaTiktok } from "react-icons/fa";
import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <section className="flex items-center justify-between bg-[#fab24e] py-10">
      <div className="flex flex-col ml-10 gap-2">
        <Image
          src="/ava.png"
          className="rounded-full"
          alt="Clementine Cat Logo"
          width={80}
          height={80}
        />
        <span className="text-[20px] text-brown-800 font-medium"> Clementine Cat</span>
      </div>

      <div className="flex flex-items gap-6 mr-10">
        <div className="flex flex-col text-brown-800 gap-2 mr-4">
          <p className="font-medium">Help</p>
          <p>Terms & Conditions</p>
          <p>Privacy Policy</p>
        </div>

        <div className="flex flex-col text-brown-800 gap-2 mr-4">
          <p className="font-medium">Contact us</p>
          <div className="flex items-center">
            <Mail className="inline w-4 h-4 mr-2"/>
            <p>info@clementinecats.com</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="https://www.instagram.com/yourhandle"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 grid place-items-center rounded-full ring-1 ring-gray-200 hover:ring-gray-300 hover:bg-gray-50 transition-colors"
              title="Instagram"
            >
              <FaInstagram size={18} className="text-gray-700" />
              <span className="sr-only">Instagram</span>
            </Link>

            <Link
              href="https://www.tiktok.com/@yourhandle"
              aria-label="TikTok"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 grid place-items-center rounded-full ring-1 ring-gray-200 hover:ring-gray-300 hover:bg-gray-50 transition-colors"
              title="TikTok"
            >
              <FaTiktok size={18} className="text-gray-700" />
              <span className="sr-only">TikTok</span>
            </Link>
          </div>
        </div>
      </div>

    </section>
  )
}