import cv from "@/content/cv.json";

export interface ExperienceRole { company: string; role: string; location: string; period: string; current?: boolean; points: string[] }
export const experience: ExperienceRole[] = cv.experience.map(({ dates, ...item }) => ({ ...item, period: dates }));
