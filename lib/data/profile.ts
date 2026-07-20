import profileJson from "@/content/profile.json";

export const profile = {
  ...profileJson,
  email: profileJson.contact.email,
  phone: profileJson.contact.phoneDisplay,
  linkedin: profileJson.links.linkedin,
  portfolio: profileJson.links.portfolio,
};
export const emailHref = profileJson.links.email;
export const phoneHref = profileJson.links.phone;
export const whatsappHref = profileJson.links.whatsapp;
export const linkedinHref = profileJson.links.linkedin;
export const portfolioHref = profileJson.links.portfolio;
export const cvDownloadHref = profile.downloads.cvHref;
export const cvDownloadFileName = profile.downloads.cvFileName;
export const formspreeEndpoint = profile.formEndpoint;
