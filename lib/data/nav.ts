import navigation from "@/content/navigation.json";

export interface NavLink {
  label: string;
  href: string;
  index: string;
}

export const navLinks: NavLink[] = navigation.primary;
