import profileJson from "@/content/profile.json";

export const profile = profileJson;
export const whatsappHref = `https://wa.me/${profile.whatsapp.replace(/[^\d]/g, "")}`;
export const emailHref = `mailto:${profile.email}`;
export const cvDownloadHref = profile.downloads.cvHref;
export const cvDownloadFileName = profile.downloads.cvFileName;
export const formspreeEndpoint = profile.formEndpoint;
