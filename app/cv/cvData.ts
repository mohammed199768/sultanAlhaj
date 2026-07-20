import cv from "@/content/cv.json";
import { profile } from "@/lib/data/profile";

export const cvProfile = {
  formalName: profile.formalName,
  displayName: profile.name,
  title: profile.primaryTitle,
  email: profile.contact.email,
  phone: profile.contact.phoneDisplay,
  location: profile.location,
  addresses: profile.addresses,
  links: profile.links,
  nationality: cv.personal.nationality,
  dateOfBirth: cv.personal.dateOfBirth,
  summary: profile.about,
};
export const cvSectors = cv.sectors;
export const cvSpecializations = cv.specializations;
export const cvHighlights = cv.highlights;
export const cvExperience = cv.experience;
export const cvSkillGroups = cv.skillGroups;
export const cvTools = cv.tools;
export const cvSelectedValue = cv.selectedValue;
export const cvEducation = {
  degree: profile.education.degree,
  school: profile.education.school,
  location: profile.education.location,
  dates: profile.education.period,
  achievement: profile.education.achievement,
};
export const cvLanguages = profile.languages.map((language) => ({ label: language.name, value: language.level }));
export const cvSectionLabels = cv.sectionLabels;
