export interface SocialLink {
  label: string;
  href: string;
}

export const profile = {
  name: "Sultan Shadi",
  formalName: "Sultan Alhaj Ahmad",
  primaryTitle: "Marketing Manager | Brand Positioning Strategist",
  extendedTitle: "Marketing Manager | Brand Positioning Strategist",
  positioning:
    "Strategic and creative Marketing Manager with over 5 years of experience developing and executing integrated marketing campaigns across medical, retail, F&B, sports, and real estate sectors.",
  currentRole: "Sales & Marketing Manager",
  currentCompany: "Garden Art – Landscape & Irrigation",
  currentRoleDates: "February 2026 – Present",
  location: "Riyadh, Saudi Arabia",
  addresses: [
    "Saudi Arabia – Riyadh",
    "The Hashemite Kingdom of Jordan – Amman",
  ],
  about:
    "Strategic and creative Marketing Manager with over 5 years of experience developing and executing integrated marketing campaigns across medical, retail, F&B, sports, and real estate sectors. Specialized in social media strategy, content development, brand building, and performance optimization. Known for launching successful community activations, managing high-ROI campaigns, and creating culturally engaging Arabic content tailored for both Jordanian and Saudi markets. Proficient in using data insights to drive results across platforms like Meta, Google, and Snapchat.",
  email: "sultan.shadi.ss@gmail.com",
  phone: "+966553478763",
  whatsapp: "+966553478763",
  // Optional — rendered only if a non-empty URL is present.
  linkedin: "",
  education: {
    field: "Marketing",
    school: "Applied Science Private University",
    period: "2018 – 2021",
    note: "Good / Honors List",
  },
  languages: [
    { name: "Arabic", level: "Native" },
    { name: "English", level: "Fluent" },
  ],
} as const;

/** WhatsApp deep link (digits only). */
export const whatsappHref = `https://wa.me/${profile.whatsapp.replace(/[^\d]/g, "")}`;
export const emailHref = `mailto:${profile.email}`;
export const cvDownloadHref = "/Sultan%20Shadi%20CV.pdf";
export const cvDownloadFileName = "Sultan Shadi CV.pdf";
export const formspreeEndpoint = "https://formspree.io/f/mgojglel";
