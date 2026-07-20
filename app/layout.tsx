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
import site from "@/content/site.json";

const siteUrl = site.siteUrl;
const description = site.defaultSeoDescription;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: site.defaultSeoTitle,
    template: site.titleTemplate,
  },
  description,
  manifest: "/manifest.webmanifest",
  keywords: site.keywords,
  authors: [{ name: profile.formalName }],
  openGraph: {
    type: "website",
    title: site.defaultSeoTitle,
    description,
    url: siteUrl,
    siteName: site.brandDisplayName,
  },
  twitter: {
    card: "summary_large_image",
    title: site.defaultSeoTitle,
    description,
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.formalName,
  alternateName: profile.name,
  jobTitle: profile.currentRole,
  description: profile.positioning,
  email: profile.contact.email,
  telephone: profile.contact.phoneE164,
  url: profile.links.portfolio,
  sameAs: [profile.links.linkedin, profile.links.portfolio],
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
