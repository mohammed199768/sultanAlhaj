import { profile } from "@/lib/data/profile";

export const cvProfile = {
  formalName: profile.formalName,
  displayName: profile.name,
  title: profile.primaryTitle,
  email: profile.email,
  phone: profile.phone,
  location: profile.location,
  addresses: profile.addresses,
  nationality: "Jordanian",
  dateOfBirth: "20/05/1998",
  summary: profile.about,
};

export const cvSectors = ["Medical", "Retail", "F&B", "Sports", "Real Estate"];

export const cvSpecializations = [
  "Social media strategy",
  "Content development",
  "Brand building",
  "Performance optimization",
];

export const cvHighlights = [
  "Launching successful community activations",
  "Managing high-ROI campaigns",
  "Creating culturally engaging Arabic content tailored for Jordanian and Saudi markets",
  "Using data insights across Meta, Google, and Snapchat",
];

export const cvExperience = [
  {
    role: "Sales & Marketing Manager",
    company: "Garden Art – Landscape & Irrigation",
    location: "Riyadh, Saudi Arabia",
    dates: "February 2026 – Present",
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
    role: "Digital Marketing Manager",
    company: "Digital Dragon Marketing Agency",
    location: "Riyadh, Saudi Arabia",
    dates: "May 2023 – June 2026",
    points: [
      "Specialized in managing healthcare marketing accounts, including Care Clinic, SKN Clinic, HAMC, U Medical Complex, Avant Clinics, and multiple doctors.",
      "Built digital strategies across SEO, Google Maps optimization, paid advertising, and social media for services such as laser, plastic surgery, dermatology, and internal medicine.",
      "Created Arabic and English campaigns promoting medical procedures and devices.",
      "Directed creative production for offer posts, influencer videos, highlights, and online consultations.",
      "Managed coordination between designers, media buyers, web developers, and content creators.",
    ],
  },
  {
    role: "Marketing Manager",
    company: "Quattro Village & Padel Me Club",
    location: "Amman, Jordan",
    dates: "February 2025 – December 2025",
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
    role: "Digital Marketing Executive",
    company: "Khotwa Medical Co. / Step Drug Store / Al Farabi L.C.C",
    location: "Jordan & KSA",
    dates: "November 2022 – June 2023",
    points: [
      "Developed and managed cross-platform advertising campaigns for pharmaceutical and medical import businesses.",
      "Managed SEO websites and Amazon/Noon product listings.",
      "Produced email newsletters and e-commerce content for B2B and B2C audiences.",
      "Managed social media strategy against estimated KPIs.",
    ],
  },
];

export const cvSkillGroups = [
  {
    label: "Strategy",
    items: ["Full-Funnel Marketing Strategy", "Branding & Identity Creation"],
  },
  {
    label: "Paid Media",
    items: ["Meta, Snapchat, Google & TikTok Ads", "Performance Reports & Analytics"],
  },
  {
    label: "Content & Social",
    items: [
      "Bilingual Content Creation: Jordanian Arabic, Saudi Arabic, and English",
      "Social Media Management: Instagram, Snapchat, and Facebook",
      "SEO & Web Content Writing",
    ],
  },
  {
    label: "Brand & Events",
    items: [
      "Influencer Marketing & Sponsorship Management",
      "Event Planning & On-Ground Activations",
    ],
  },
  {
    label: "Management",
    items: ["Client & Team Management"],
  },
];

export const cvTools = [
  "Meta Business Suite",
  "Snapchat Ads",
  "TikTok Ads",
  "Google Ads",
  "WordPress",
  "Google My Business",
  "Amazon Seller Central",
  "Canva",
  "CapCut",
  "Photoshop — Basic",
  "Google Analytics GA4",
  "WhatsApp Business",
];

export const cvSelectedValue = [
  "Brand Strategy and Brand Development",
  "Marketing Strategy and Campaign Management",
  "Content Strategy and Copywriting",
  "Creative and Visual Direction",
  "Digital Marketing and Social Media Management",
  "Sales and Business Development Support",
  "B2B Marketing",
  "Project and Vendor Coordination",
];

export const cvEducation = {
  degree: "Marketing",
  school: "Applied Science Private University",
  dates: "2018–2021",
  result: "Good / Honors List",
};

export const cvLanguages = [
  { label: "Arabic", value: "Native" },
  { label: "English", value: "Fluent" },
];
