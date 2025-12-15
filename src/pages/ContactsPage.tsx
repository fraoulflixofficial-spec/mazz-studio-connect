import { Header } from '@/components/user/Header';
import { MessageCircle, Facebook, Instagram, Phone } from 'lucide-react';

const WHATSAPP_CONTACTS = [
  { name: 'Admin #1', number: '+880 1995-112279', whatsappNumber: '8801995112279' },
  { name: 'Admin #2', number: '+880 1776-653466', whatsappNumber: '8801776653466' },
  { name: 'Admin #3', number: '+880 1627-894853', whatsappNumber: '8801627894853' },
];

const SOCIAL_LINKS = [
  { 
    name: 'Facebook', 
    url: 'https://www.facebook.com/share/1H1BV5j9Kd/', 
    icon: Facebook,
    color: 'bg-[#1877F2] hover:bg-[#1877F2]/90'
  },
  { 
    name: 'Instagram', 
    url: 'https://www.instagram.com/mazzestudio.fsl?igsh=MWFqNnpmeW4wZjdlMg==', 
    icon: Instagram,
    color: 'bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90'
  },
];

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-display font-bold text-center mb-2">
          Contact Us
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          We're here to help! Reach out to us anytime.
        </p>

        {/* WhatsApp Support Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-[#25D366]" />
            <h2 className="text-lg font-medium">WhatsApp Support</h2>
          </div>
          
          <div className="space-y-3">
            {WHATSAPP_CONTACTS.map((contact, index) => (
              <a
                key={index}
                href={`https://wa.me/${contact.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-[#25D366] text-white rounded-xl hover:bg-[#25D366]/90 transition-all active:scale-[0.98]"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-white/90 text-sm">{contact.number}</p>
                </div>
                <MessageCircle className="w-6 h-6" />
              </a>
            ))}
          </div>
        </div>

        {/* Social Media Section */}
        <div>
          <h2 className="text-lg font-medium mb-4">Follow Us</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {SOCIAL_LINKS.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-3 p-4 text-white rounded-xl transition-all active:scale-[0.98] ${social.color}`}
              >
                <social.icon className="w-6 h-6" />
                <span className="font-medium">{social.name}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-6 bg-card rounded-xl border border-border text-center">
          <h3 className="font-medium mb-2">Business Hours</h3>
          <p className="text-muted-foreground text-sm">
            We typically respond within 24 hours.<br />
            Available 10:00 AM - 10:00 PM (BST)
          </p>
        </div>
      </div>
    </div>
  );
}
