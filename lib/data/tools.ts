export interface Tool {
  name: string;
  group: "Advertising" | "Analytics" | "Creative" | "Platform";
}

export const tools: Tool[] = [
  { name: "Meta Business Suite", group: "Advertising" },
  { name: "Snapchat Ads", group: "Advertising" },
  { name: "TikTok Ads", group: "Advertising" },
  { name: "Google Ads", group: "Advertising" },
  { name: "Google Analytics GA4", group: "Analytics" },
  { name: "Google My Business", group: "Analytics" },
  { name: "WordPress", group: "Platform" },
  { name: "Amazon Seller Central", group: "Platform" },
  { name: "WhatsApp Business", group: "Platform" },
  { name: "Canva", group: "Creative" },
  { name: "CapCut", group: "Creative" },
  { name: "Photoshop", group: "Creative" },
];
