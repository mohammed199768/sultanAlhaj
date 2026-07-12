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
    company: "Garden Art – Landscape & Irrigation",
    role: "Sales & Marketing Manager",
    location: "Riyadh, Saudi Arabia",
    period: "February 2026 – Present",
    current: true,
    points: [
      "Developed and managed Garden Art's brand identity.",
      "Led marketing strategy, content planning, and digital presence across Instagram, LinkedIn, Google Business Profile, website content, and corporate outreach channels.",
      "Created Arabic and English marketing content tailored for the Saudi market, including social media posts, captions, campaigns, brochures, and company presentations.",
      "Supported sales activities through client outreach, lead generation, prospect research, email marketing campaigns, WhatsApp campaigns, follow-ups, and proposal preparation.",
      "Managed email marketing campaigns and built updated prospect databases for new business opportunities.",
      "Coordinated with management on business development activities, client communication, project submissions, and corporate presentations.",
      "Prepared professional sales and marketing materials for tenders, client meetings, company introductions, and partnership opportunities.",
      "Improved Garden Art's corporate image through consistent branding, premium visual direction, and professional marketing documentation.",
      "Supported client acquisition across sectors including villas, residential compounds, corporate buildings, healthcare, hospitality, government-related facilities, contractors, and developers.",
      "Worked closely with internal teams to align marketing materials with sales objectives, company positioning, and client requirements.",
    ],
  },
  {
    company: "Digital Dragon Marketing Agency",
    role: "Digital Marketing Manager",
    location: "Riyadh, Saudi Arabia",
    period: "May 2023 – June 2026",
    points: [
      "Specialized in managing healthcare marketing accounts, including Care Clinic, SKN Clinic, HAMC, U Medical Complex, Avant Clinics, and multiple doctors.",
      "Built digital strategies across SEO, Google Maps optimization, paid advertising, and social media for services such as laser, plastic surgery, dermatology, and internal medicine.",
      "Created Arabic and English campaigns promoting medical procedures and devices.",
      "Directed creative production for offer posts, influencer videos, highlights, and online consultations.",
      "Managed coordination between designers, media buyers, web developers, and content creators.",
    ],
  },
  {
    company: "Quattro Village & Padel Me Club",
    role: "Marketing Manager",
    location: "Amman, Jordan",
    period: "February 2025 – December 2025",
    points: [
      "Led marketing and branding operations for Quattro Village.",
      "Developed and executed campaigns with Reflect, Ittihad Bank, and Red Bull, including cashback activations, field events, branding materials, and tournaments.",
      "Built and managed monthly social media calendars, carousels, and Friday activations.",
      "Managed Padel Me Club tournament planning, influencer partnerships, and gear shop promotions.",
      "Created video content strategies and event recap Reels, and directed production and brand identity work.",
      "Oversaw booking campaigns and membership promotions.",
      "Collaborated with management on sponsorship proposals, pricing models, and performance reviews.",
      "Created a tournament collaboration involving Ahli Bank, Zain, Careem, and more than 11 sponsors.",
    ],
  },
  {
    company: "Khotwa Medical Co. / Step Drug Store / Al Farabi L.C.C",
    role: "Digital Marketing Executive",
    location: "Jordan & KSA",
    period: "November 2022 – June 2023",
    points: [
      "Developed and managed cross-platform advertising campaigns for pharmaceutical and medical import businesses.",
      "Managed SEO websites and Amazon/Noon product listings.",
      "Produced email newsletters and e-commerce content for B2B and B2C audiences.",
      "Managed social media strategy against estimated KPIs.",
    ],
  },
];
