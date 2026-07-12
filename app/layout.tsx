import type { Metadata } from "next";
import "./globals.css";
import { unbounded, tinos } from "./fonts";
import SmoothScrollProvider from "@/components/layout/SmoothScrollProvider";
import Chrome from "@/components/layout/Chrome";
import Footer from "@/components/layout/Footer";
import TransitionProvider from "@/components/transitions/TransitionProvider";
import RouteTransitionLayer from "@/components/transitions/RouteTransitionLayer";
import SiteBootLoader from "@/components/system/SiteBootLoader";
import RouteLoadingIndicator from "@/components/system/RouteLoadingIndicator";
import { profile } from "@/lib/data/profile";

const siteUrl = "https://sultanshadi.com";
const description =
  "Sultan Shadi — Marketing Manager and Brand Positioning Strategist based in Riyadh, Saudi Arabia.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sultan Shadi — Marketing Manager | Brand Positioning Strategist",
    template: "%s — Sultan Shadi",
  },
  description,
  keywords: [
    "Sultan Shadi",
    "Sultan Alhaj Ahmad",
    "Marketing Manager",
    "Brand Positioning Strategist",
    "Sales & Marketing Manager",
    "Jordan",
    "Saudi Arabia",
    "Social Media Marketing",
  ],
  authors: [{ name: profile.formalName }],
  openGraph: {
    type: "website",
    title: "Sultan Shadi — Marketing Manager | Brand Positioning Strategist",
    description,
    url: siteUrl,
    siteName: "Sultan Shadi",
    images: [{ url: "/works/4.webp", width: 1200, height: 630, alt: "Sultan Shadi portfolio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sultan Shadi — Marketing Manager | Brand Positioning Strategist",
    description,
    images: ["/works/4.webp"],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.formalName,
  alternateName: profile.name,
  jobTitle: "Sales & Marketing Manager",
  description: profile.positioning,
  email: profile.email,
  telephone: profile.phone,
  address: [
    { "@type": "PostalAddress", addressLocality: "Riyadh", addressCountry: "SA" },
    { "@type": "PostalAddress", addressLocality: "Amman", addressCountry: "JO" },
  ],
  knowsLanguage: ["ar", "en"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${unbounded.variable} ${tinos.variable}`}>
      <body className="grain">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteBootLoader />
        <SmoothScrollProvider>
          <TransitionProvider>
            <RouteLoadingIndicator />
            <Chrome />
            <RouteTransitionLayer>
              <main id="main-content">{children}</main>
            </RouteTransitionLayer>
            <Footer />
          </TransitionProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
