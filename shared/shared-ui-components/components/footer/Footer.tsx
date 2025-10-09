"use client";

import { base_url } from "@omenai/url-config/src/config";
import { motion } from "framer-motion";
import { Instagram, Twitter, Facebook, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-neutral-50 text-neutral-700 border-t border-neutral-200 py-12 px-6 md:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo + About */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-semibold text-neutral-900">Omenai</h2>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Discover, collect, and celebrate fine art from talented artists
            around the world.
          </p>

          {/* Socials */}
          <div className="flex space-x-4 mt-4">
            {[
              { Icon: Instagram, href: "https://instagram.com" },
              { Icon: Twitter, href: "https://x.com" },
              { Icon: Facebook, href: "https://facebook.com" },
              { Icon: Linkedin, href: "https://linkedin.com" },
            ].map(({ Icon, href }, i) => (
              <motion.a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <Icon size={20} />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Explore */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="space-y-4"
        >
          <h3 className="text-neutral-900 text-lg font-semibold">Explore</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href={`${base_url()}/catalog`} className="footer-link">
                Collect
              </Link>
            </li>
            <li>
              <Link href={`${base_url()}/articles`} className="footer-link">
                Editorials
              </Link>
            </li>
          </ul>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          <h3 className="text-neutral-900 text-lg font-semibold">Support</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="#" className="footer-link">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="mailto:info@omenai.app" className="footer-link">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href={`${base_url()}/privacy`} className="footer-link">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link
                href={`${base_url()}/legal?ent=collector`}
                className="footer-link"
              >
                Terms of use
              </Link>
            </li>
          </ul>
        </motion.div>

        {/* App Downloads */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-4"
        >
          <h3 className="text-neutral-900 text-lg font-semibold">
            Get the App
          </h3>
          <div className="flex items-center gap-6">
            {/* App Downloads */}
            <div className="flex gap-2">
              <a
                href="https://apps.apple.com/app/omenai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-2 bg-gray-900 hover:bg-dark/90 text-white rounded transition-colors"
                aria-label="Download on App Store"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <span className="text-xs font-semibold">App Store</span>
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=com.omenai.omenaiapp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-2 bg-gray-900 hover:bg-dark/90 text-white rounded transition-colors"
                aria-label="Get it on Google Play"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <span className="text-xs font-semibold">Google Play</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="border-t border-neutral-200 mt-10 pt-6 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} Omenai. All rights reserved.
      </div>

      {/* Custom hover underline styles */}
      <style jsx>{`
        .footer-link {
          position: relative;
          display: inline-block;
          color: #525252;
          transition: color 0.3s ease;
        }
        .footer-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -2px;
          width: 0%;
          height: 1.5px;
          background-color: #111;
          transition: width 0.3s ease;
        }
        .footer-link:hover {
          color: #111;
        }
        .footer-link:hover::after {
          width: 100%;
        }
      `}</style>
    </footer>
  );
}
