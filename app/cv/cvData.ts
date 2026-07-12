import cv from "@/content/cv.json";
import { profile } from "@/lib/data/profile";

export const cvProfile = { formalName: profile.formalName, displayName: profile.name, title: profile.primaryTitle, email: profile.email, phone: profile.phone, location: profile.location, addresses: profile.addresses, nationality: cv.personal.nationality, dateOfBirth: cv.personal.dateOfBirth, summary: profile.about };
export const cvSectors = cv.sectors;
export const cvSpecializations = cv.specializations;
export const cvHighlights = cv.highlights;
export const cvExperience = cv.experience;
export const cvSkillGroups = cv.skillGroups;
export const cvTools = cv.tools;
export const cvSelectedValue = cv.selectedValue;
export const cvEducation = { degree: profile.education.field, school: profile.education.school, dates: profile.education.period.replace(/\s/g, ""), result: profile.education.note };
export const cvLanguages = profile.languages.map((language) => ({ label: language.name, value: language.level }));
export const cvSectionLabels = cv.sectionLabels;
