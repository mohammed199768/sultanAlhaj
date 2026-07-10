export interface NavLink {
  label: string;
  href: string;
  index: string;
}

export const navLinks: NavLink[] = [
  { label: "Home", href: "/", index: "01" },
  { label: "CV", href: "/cv", index: "02" },
  { label: "Contact", href: "/contact", index: "03" },
];
