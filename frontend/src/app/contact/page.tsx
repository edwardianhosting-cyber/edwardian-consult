'use client';

import { useState, useEffect } from 'react';
import { Phone, MessageCircle, Mail, ExternalLink, Loader2 } from 'lucide-react';

interface ContactCard {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  link: string;
  linkType: string;
  order: number;
  isActive: boolean;
}

interface ContactSection {
  id: string;
  title: string;
  slug: string;
  order: number;
  isActive: boolean;
  cards: ContactCard[];
}

import { contactApi } from '@/lib/api';

const defaultSections: ContactSection[] = [
  {
    id: '1',
    title: 'Mobile Calls',
    slug: 'mobile-calls',
    order: 1,
    isActive: true,
    cards: [
      { id: '1', title: 'Call Us', description: 'Speak directly with our support team', icon: 'Phone', link: 'tel:+2348000000000', linkType: 'phone', order: 1, isActive: true },
      { id: '2', title: 'Hotline', description: '24/7 customer service line', icon: 'Phone', link: 'tel:+2348000000001', linkType: 'phone', order: 2, isActive: true },
    ],
  },
  {
    id: '2',
    title: 'WhatsApp',
    slug: 'whatsapp',
    order: 2,
    isActive: true,
    cards: [
      { id: '3', title: 'WhatsApp Chat', description: 'Chat with us on WhatsApp', icon: 'MessageCircle', link: 'https://wa.me/2348000000000', linkType: 'whatsapp', order: 1, isActive: true },
      { id: '4', title: 'WhatsApp Support', description: 'Get instant support', icon: 'MessageCircle', link: 'https://wa.me/2348000000001', linkType: 'whatsapp', order: 2, isActive: true },
    ],
  },
  {
    id: '3',
    title: 'Email',
    slug: 'email',
    order: 3,
    isActive: true,
    cards: [
      { id: '5', title: 'General Inquiry', description: 'info@edwardianconsult.com.ng', icon: 'Mail', link: 'mailto:info@edwardianconsult.com.ng', linkType: 'email', order: 1, isActive: true },
      { id: '6', title: 'Support', description: 'support@edwardianconsult.com.ng', icon: 'Mail', link: 'mailto:support@edwardianconsult.com.ng', linkType: 'email', order: 2, isActive: true },
    ],
  },
];

const iconMap: Record<string, any> = {
  Phone: Phone,
  MessageCircle: MessageCircle,
  Mail: Mail,
};

export default function ContactPage() {
  const [sections, setSections] = useState<ContactSection[]>(defaultSections);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContactSections();
  }, []);

  const fetchContactSections = async () => {
    try {
      const res = await contactApi.getAll();
      if (res.data.success && res.data.data.length > 0) {
        setSections(res.data.data);
      }
    } catch (error) {
      console.log('Using default contact sections');
    } finally {
      setLoading(false);
    }
  };

  const renderIcon = (iconName: string | null, className: string) => {
    if (!iconName) return <ExternalLink className={className} />;
    const IconComponent = iconMap[iconName];
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
    return <ExternalLink className={className} />;
  };

  const getLinkTypeColor = (linkType: string) => {
    switch (linkType) {
      case 'phone':
        return 'bg-green-500/20 text-green-400';
      case 'whatsapp':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'email':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-accent-500/20 text-accent-400';
    }
  };

  const getLinkTypeLabel = (linkType: string) => {
    switch (linkType) {
      case 'phone':
        return 'Call';
      case 'whatsapp':
        return 'WhatsApp';
      case 'email':
        return 'Email';
      default:
        return 'Visit';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-primary-800 text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto h-16 w-16 mb-6">
            <img src="/logo.png" alt="Edwardian Educational Consult" className="h-full w-full object-contain" />
          </div>
          <span className="inline-block px-4 py-1.5 bg-accent-500/20 text-accent-400 rounded-full text-sm font-medium mb-6">
            Contact Us
          </span>
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold font-heading mb-6">
            Get In <span className="text-accent-400">Touch</span>
          </h1>
          <p className="text-lg text-primary-200 max-w-2xl mx-auto">
            Choose your preferred method of contact below. We are here to help you succeed.
          </p>
        </div>
      </section>

      {/* Contact Sections */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map((section) => (
              <div key={section.id}>
                {/* Section Title */}
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">{section.title}</h2>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Cards Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.cards.map((card) => (
                    <a
                      key={card.id}
                      href={card.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getLinkTypeColor(card.linkType)}`}>
                          {renderIcon(card.icon, 'h-6 w-6')}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                              {card.title}
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getLinkTypeColor(card.linkType)}`}>
                              {getLinkTypeLabel(card.linkType)}
                            </span>
                          </div>
                          {card.description && (
                            <p className="text-sm text-gray-500 truncate">{card.description}</p>
                          )}
                        </div>

                        {/* Arrow */}
                        <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto h-12 w-12 mb-4">
            <img src="/logo.png" alt="Edwardian Educational Consult" className="h-full w-full object-contain" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white font-heading mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-primary-200 mb-8">
            Join thousands of students already preparing for their exams.
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent-500 text-primary-900 font-bold rounded-xl hover:bg-accent-400 transition-all shadow-lg text-lg"
          >
            BECOME A STUDENT FREE
          </a>
        </div>
      </section>
    </div>
  );
}
