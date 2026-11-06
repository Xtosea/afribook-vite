import React from "react";
import {
  Mail,
  MessageCircle,
  Music2,
  Globe,
  MapPin,
  ExternalLink,
} from "lucide-react";

const contactMethods = [
  {
    icon: MessageCircle,
    title: "WhatsApp Community",
    description: "Join the AfricSocial WhatsApp community.",
    label: "Join on WhatsApp",
    href: "https://chat.whatsapp.com/HgPfMlpmQoh7aPCVpguUQb?s=cl&p=a&mlu=4&ilr=4",
    external: true,
  },
  {
    icon: Mail,
    title: "Official Support Email",
    description: "For support and general enquiries.",
    label: "support@africsocial.com",
    href: "mailto:support@africsocial.com",
  },
  {
    icon: Mail,
    title: "Alternative Email",
    description: "You can also reach us at this email address.",
    label: "africsocial1@gmail.com",
    href: "mailto:africsocial1@gmail.com",
  },
  {
    icon: Music2,
    title: "TikTok",
    description: "Follow AfricSocial on TikTok.",
    label: "@africsocial",
    href: "https://www.tiktok.com/@africsocial",
    external: true,
  },
  {
    icon: Globe,
    title: "Facebook",
    description: "Visit the AfricSocial Facebook page.",
    label: "AfricSocial on Facebook",
    href: "https://www.facebook.com/africsocial",
    external: true,
  },
];

export default function Contact() {
  return (
    <main className="min-h-screen bg-gray-50 px-5 py-12 text-gray-800">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-green-700">
            We would love to hear from you
          </p>
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">
            Contact AfricSocial
          </h1>
          <p className="mx-auto max-w-2xl leading-7 text-gray-600">
            Have a question, need assistance or want to share feedback?
            Contact our team using any of the channels below.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {contactMethods.map(
            ({ icon: Icon, title, description, label, href, external }) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <Icon size={24} />
                </div>
                <h2 className="mb-2 text-lg font-semibold">{title}</h2>
                <p className="mb-4 text-sm leading-6 text-gray-600">
                  {description}
                </p>
                <a
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-2 break-all font-semibold text-green-700 hover:text-green-900"
                >
                  {label}
                  {external && <ExternalLink size={15} />}
                </a>
              </div>
            )
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <MapPin className="text-green-700" size={22} />
            <h2 className="text-lg font-semibold">Office address</h2>
          </div>
          <p className="leading-7 text-gray-600">
            AfricSocial does not currently have a public office address.
            We will update this page when an official office address becomes
            available.
          </p>
        </section>

        <p className="mt-8 text-center text-sm text-gray-500">
          Thank you for being part of the AfricSocial journey.
        </p>
      </div>
    </main>
  );
}
