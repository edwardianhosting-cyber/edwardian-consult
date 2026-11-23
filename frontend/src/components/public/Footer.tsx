import Link from 'next/link';
import { GraduationCap, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-secondary-800 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-primary-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white font-heading">EDWARDIAN</span>
                <span className="block text-[10px] text-accent-400 -mt-1">EDUCATIONAL CONSULT LTD</span>
              </div>
            </div>
            <p className="text-secondary-300 text-sm leading-relaxed">
              Empowering students to achieve academic excellence through quality education and personalized guidance since 2014.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-600 hover:text-white text-secondary-300 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-600 hover:text-white text-secondary-300 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-600 hover:text-white text-secondary-300 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary-600 hover:text-white text-secondary-300 transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-accent-400">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-secondary-300 hover:text-accent-400 transition-colors">About Us</Link></li>
              <li><Link href="/programs" className="text-secondary-300 hover:text-accent-400 transition-colors">Programs</Link></li>
              <li><Link href="/news" className="text-secondary-300 hover:text-accent-400 transition-colors">Admission News</Link></li>
              <li><Link href="/verification" className="text-secondary-300 hover:text-accent-400 transition-colors">Verification</Link></li>
              <li><Link href="/parent" className="text-secondary-300 hover:text-accent-400 transition-colors">Parent Portal</Link></li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-accent-400">Programs</h3>
            <ul className="space-y-3">
              <li><Link href="/programs#jamb" className="text-secondary-300 hover:text-accent-400 transition-colors">JAMB/UTME Prep</Link></li>
              <li><Link href="/programs#post-utme" className="text-secondary-300 hover:text-accent-400 transition-colors">Post-UTME Training</Link></li>
              <li><Link href="/programs#waec" className="text-secondary-300 hover:text-accent-400 transition-colors">WAEC/NECO Prep</Link></li>
              <li><Link href="/programs#jupeb" className="text-secondary-300 hover:text-accent-400 transition-colors">JUPEB/IJMB</Link></li>
              <li><Link href="/programs#counseling" className="text-secondary-300 hover:text-accent-400 transition-colors">Admission Counseling</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-accent-400">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <span className="text-secondary-300">123 Education Street, Ikeja, Lagos, Nigeria</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <span className="text-secondary-300">+234 800 000 0000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <span className="text-secondary-300">info@edwardianeducationalconsult.com.ng</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-secondary-700 bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-secondary-400 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} Edwardian Educational Consult. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-secondary-400 hover:text-accent-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-secondary-400 hover:text-accent-400 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
