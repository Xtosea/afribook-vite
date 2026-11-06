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
    title: "Photos, Videos, Reels and Stories",
    description:
      "Share your moments, creativity and experiences through photos, videos, reels, stories and other engaging content.",
  },
  {
    icon: MessageCircle,
    title: "Messaging and Calls",
    description:
      "Connect with friends, creators and other members through direct messaging and communication features.",
  },
  {
    icon: Users,
    title: "Social Networking and Communities",
    description:
      "Build relationships, discover people, grow your audience, join groups and participate in meaningful conversations.",
  },
  {
    icon: Store,
    title: "Marketplace",
    description:
      "Discover products and business listings, showcase what you offer and connect with potential customers through the AfricSocial Marketplace.",
  },
  {
    icon: Heart,
    title: "Creator Monetisation",
    description:
      "Access creator-focused monetisation opportunities designed to help eligible creators grow their audience and earn from their content.",
  },
  {
    icon: Lightbulb,
    title: "Business Pages",
    description:
      "Give businesses and brands a place to establish their presence, showcase their services and connect with their audiences.",
  },
];

const services = [
  {
    title: "Jobs and Opportunities",
    description:
      "Discover career opportunities, professional connections and other opportunities within the AfricSocial community.",
  },
  {
    title: "Events",
    description:
      "Discover and share events, activities and experiences that bring communities together.",
  },
  {
    title: "Learning Hub",
    description:
      "Explore educational content, useful knowledge and opportunities for learning and personal development.",
  },
  {
    title: "Verified Creators",
    description:
      "Support authenticity and recognition through creator verification features.",
  },
  {
    title: "AI-Powered Recommendations",
    description:
      "Discover relevant content and explore a more personalised social networking experience through AI-powered recommendations.",
  },
  {
    title: "Digital Wallet",
    description:
      "Access wallet-related features designed to support eligible financial activities and creator monetisation on the platform.",
  },
  {
    title: "Premium Subscriptions",
    description:
      "Access premium subscription offerings and additional platform benefits.",
  },
  {
    title: "Advertising and Promotions",
    description:
      "Promote content, boost posts and create advertising campaigns to reach your intended audience.",
  },
];

export default function About() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-800">
      <section className="bg-gradient-to-br from-green-700 to-green-900 px-5 py-20 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-green-200">
            About AfricSocial
          </p>

          <h1 className="mb-5 text-3xl font-bold leading-tight sm:text-5xl">
            Africa's Social Media Platform for Connection, Creativity and
            Opportunities.
          </h1>

          <p className="max-w-3xl text-base leading-8 text-green-50 sm:text-lg">
            AfricSocial is an Africa-focused social media platform that brings
            people, content creators, businesses and communities together.
            Share your creativity, connect with others, discover opportunities,
            promote your business and explore new ways to grow in the digital
            world.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-14 px-5 py-12">

        <section>
          <h2 className="mb-4 text-2xl font-bold">Who We Are</h2>

          <p className="leading-8 text-gray-600">
            AfricSocial is a social networking platform built to give
            individuals, content creators, entrepreneurs, businesses and
            communities more opportunities to connect, express themselves and
            participate in the digital economy. Our platform brings social
            networking, content sharing, communication, business promotion,
            advertising and creator-focused services together in one place.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold">Our Mission</h2>

          <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
              <Heart size={25} />
            </div>

            <p className="leading-8 text-gray-600">
              Our mission is to connect Africa and the world through
              technology, creativity, communication and opportunities. We aim
              to empower people to share their voices, build communities,
              develop businesses, discover opportunities and grow through
              digital innovation.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-bold">
            What AfricSocial Offers
          </h2>

          <p className="mb-7 leading-8 text-gray-600">
            AfricSocial combines social networking, communication, content
            creation, business services and digital opportunities to provide
            members with a connected online experience.
          </p>

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

                <p className="leading-7 text-gray-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-bold">
            More Services and Opportunities
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {services.map(({ title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <h3 className="mb-2 font-semibold text-green-800">
                  {title}
                </h3>

                <p className="leading-7 text-gray-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="rounded-2xl bg-green-50 p-6 sm:p-8">
            <h2 className="mb-4 text-xl font-bold text-green-900">
              A Platform Built for Connection and Growth
            </h2>

            <p className="leading-8 text-gray-700">
              From sharing everyday experiences to growing a business,
              promoting content, connecting with communities and discovering
              new opportunities, AfricSocial brings different aspects of the
              digital experience together. We continue to improve our
              technology and services to provide members with a useful,
              engaging and accessible platform.
            </p>
          </div>
        </section>

        <section className="text-center">
          <h2 className="mb-3 text-2xl font-bold">
            Be Part of AfricSocial
          </h2>

          <p className="mb-6 text-gray-600">
            Join our community, share your creativity, connect with people
            and explore the opportunities AfricSocial brings together.
          </p>

          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-6 py-3 font-semibold text-white transition hover:bg-green-800"
          >
            Contact Us <ArrowRight size={18} />
          </Link>
        </section>

      </div>
    </main>
  );
}