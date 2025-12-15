import { Phone, MessageCircle } from 'lucide-react';

const whatsappContacts = [
  { name: 'Admin #1', number: '+880 1995-112279', link: 'https://wa.me/8801995112279' },
  { name: 'Admin #2', number: '+880 1776-653466', link: 'https://wa.me/8801776653466' },
  { name: 'Admin #3', number: '+880 1627-894853', link: 'https://wa.me/8801627894853' },
];

const socialLinks = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/share/1H1BV5j9Kd/',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/mazzestudio.fsl?igsh=MWFqNnpmeW4wZjdlMg==',
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="container mx-auto px-4 py-8">
        {/* WhatsApp Support Section */}
        <div className="mb-8">
          <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-accent" />
            WhatsApp Support
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {whatsappContacts.map((contact) => (
              <a
                key={contact.name}
                href={contact.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#25D366] hover:bg-[#20BD5A] text-white px-4 py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                <MessageCircle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium opacity-90">{contact.name}</div>
                  <div className="font-semibold">{contact.number}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Social Media Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Follow us:</span>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Mazzé Studio. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}