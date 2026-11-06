import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Camera,
  MessageCircle,
  Store,
  Lightbulb,
  Heart,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Share your creativity",
    description:
      "Share photos, videos, stories and other content with a growing community.",
  },
  {
    icon: MessageCircle,
    title: "Connect with people",
    description:
      "Discover ways to communicate, build relationships and engage with others.",
  },
  {
    icon: Store,
    title: "Explore opportunities",
    description:
      "Our vision includes business tools, marketplace features and opportunities for creators.",
  },
  {
    icon: Users,
    title: "Build a community",
    description:
      "Connect with people, discover communities and take part in conversations.",
  },
];

export default function About() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <section className="bg-gradient-to-br from-green-700 to-green-900 px-5 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-green-200">
            About AfricSocial
          </p>
          <h1 className="mb-5 text-3xl font-bold leading-tight sm:text-5xl">
            Connecting Africa through creativity and community.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-green-50 sm:text-lg">
            AfricSocial is an Africa-focused social media platform being
            developed to help people connect, share content, discover
            opportunities and grow their communities.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-12 px-5 py-12">
        <section>
          <h2 className="mb-4 text-2xl font-bold">Who we are</h2>
          <p className="leading-8 text-gray-600">
            AfricSocial is being built with a vision of creating a welcoming
            digital space where African voices, ideas, talents and businesses
            can be discovered and celebrated. We want content creators,
            individuals, communities and businesses to have more ways to
            connect and participate in the digital world.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold">Our mission</h2>
          <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
              <Heart size={25} />
            </div>
            <p className="leading-8 text-gray-600">
              Our mission is to build an accessible and engaging social
              platform that empowers people to express themselves, connect
              with others, share knowledge and create opportunities.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-bold">What we are building</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <Icon size={23} />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="leading-7 text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="rounded-2xl bg-green-50 p-6 sm:p-8">
            <div className="mb-3 flex items-center gap-2 text-green-800">
              <Lightbulb size={22} />
              <h2 className="text-xl font-bold">A platform in development</h2>
            </div>
            <p className="leading-8 text-gray-700">
              AfricSocial is still being developed. Features and services may
              change as we improve the platform. Some features described here
              may not yet be available. We appreciate everyone supporting us
              as we work towards our vision.
            </p>
          </div>
        </section>

        <section className="text-center">
          <h2 className="mb-3 text-2xl font-bold">Be part of the community</h2>
          <p className="mb-6 text-gray-600">
            Have a question or want to connect with the AfricSocial team?
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800"
          >
            Contact us <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </main>
  );
}
