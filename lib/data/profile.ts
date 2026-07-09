export interface SocialLink {
  label: string;
  href: string;
}

export const profile = {
  name: "Sultan Shadi",
  formalName: "Sultan Alhaj Ahmad",
  primaryTitle: "Marketing Manager | Digital Strategist | Content Architect",
  extendedTitle: "Marketing Manager | Digital Strategist | Content Architect",
  positioning:
    "Marketing strategist building brands, campaigns, and market presence across Jordan and Saudi Arabia.",
  location: "Amman, Jordan · Riyadh, Saudi Arabia",
  about:
    "Sultan is a strategic and creative Marketing Manager with over 5 years of experience developing and executing integrated marketing campaigns across medical, retail, F&B, sports, and real estate sectors. He specializes in social media strategy, content development, brand building, and performance optimization. He is known for launching successful community activations, managing high-ROI campaigns, and creating culturally engaging Arabic/English content tailored for Jordanian and Saudi markets. He uses data insights to drive results across platforms like Meta, Google, and Snapchat.",
  email: "sultan.shadi.ss@gmail.com",
  phoneJordan: "+962782548231",
  phoneSaudi: "+966561942030",
  whatsapp: "+962782548231",
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
