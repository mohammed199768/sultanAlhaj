export interface ExperienceRole {
  company: string;
  role: string;
  location: string;
  period: string;
  current?: boolean;
  points: string[];
}

export const experience: ExperienceRole[] = [
  {
    company: "Quattro Village & Padel Me Club",
    role: "Marketing Manager",
    location: "Amman, Jordan",
    period: "February 2025 – Present",
    current: true,
    points: [
      "Lead marketing and branding operations for Quattro Village.",
      "Developed campaigns with Reflect, Ittihad Bank and Redbull including cashback activations, in-field events, branding materials and tournaments.",
      "Built monthly social media content calendars, carousels and Friday activations targeting footfall and awareness.",
      "Managed Padel Me Club's marketing scope: tournament planning, influencer partnerships and gear-shop promotions.",
      "Created video content strategies and event recap reels.",
      "Directed photographer/videographer shoots and brand identity production.",
      "Oversaw booking campaigns and membership promotions targeting off-peak hours and family-focused users.",
      "Collaborated with management on sponsorship proposals, pricing models and performance reviews.",
      "Helped create a major padel tournament with Ahli Bank, Zain, Careem and 11+ sponsors.",
    ],
  },
  {
    company: "Digital Dragon Marketing Agency",
    role: "Team Leader | Digital Marketing Manager",
    location: "Riyadh, Saudi Arabia",
    period: "May 2023 – Present",
    current: true,
    points: [
      "Managed healthcare marketing accounts including Care Clinic, SKN Clinic, HAMC, U Medical Complex, Avant Clinics and multiple doctors.",
      "Built digital strategies across SEO, Google Maps optimization, paid ads and social media.",
      "Created campaigns for laser, plastic surgery, dermatology, internal medicine, medical procedures and devices.",
      "Directed creative production for offer posts, influencer videos, highlights and online consultations.",
      "Coordinated designers, media buyers, web developers and content creators.",
    ],
  },
  {
    company: "Khotwa Medical Co. / Step Drug Store / Al Farabi L.C.C",
    role: "Digital Marketing Executive",
    location: "Jordan & KSA",
    period: "November 2022 – June 2023",
    points: [
      "Developed and managed cross-platform ad campaigns for pharmaceutical and medical import businesses.",
      "Managed SEO websites and Amazon/Noon product listings.",
      "Produced email newsletters and e-commerce content for B2B and B2C audiences.",
      "Managed social media strategy aligned with estimated KPIs.",
    ],
  },
];
