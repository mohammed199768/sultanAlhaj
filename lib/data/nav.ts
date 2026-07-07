export interface NavLink {
  label: string;
  href: string;
  index: string;
}

export const navLinks: NavLink[] = [
  { label: "Home", href: "#hero", index: "01" },
  { label: "About", href: "#about", index: "02" },
  { label: "Capabilities", href: "#capabilities", index: "03" },
  { label: "Experience", href: "#experience", index: "04" },
  { label: "Selected Work", href: "#work", index: "05" },
  { label: "Clients", href: "#clients", index: "06" },
  { label: "Case Studies", href: "#case-studies", index: "07" },
  { label: "Results", href: "#results", index: "08" },
  { label: "Testimonials", href: "#reels", index: "09" },
  { label: "Tools", href: "#tools", index: "10" },
  { label: "Contact", href: "#contact", index: "11" },
];
