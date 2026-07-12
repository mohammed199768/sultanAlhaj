"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Download,
  FileText,
  GraduationCap,
  Languages,
  Mail,
  MapPin,
  Phone,
  Target,
  UserRound,
  Wrench,
} from "lucide-react";
import {
  cvEducation,
  cvExperience,
  cvHighlights,
  cvLanguages,
  cvProfile,
  cvSectors,
  cvSelectedValue,
  cvSectionLabels,
  cvSkillGroups,
  cvSpecializations,
  cvTools,
} from "./cvData";
import { cvDownloadFileName, cvDownloadHref } from "@/lib/data/profile";

type SectionId =
  | "profile"
  | "experience"
  | "skills"
  | "tools"
  | "education"
  | "languages"
  | "contact";

interface CvSection {
  id: SectionId;
  label: string;
  shortLabel: string;
  hint: string;
  icon: LucideIcon;
}

const sectionIcons: Record<SectionId, LucideIcon> = {
  profile: UserRound,
  experience: BriefcaseBusiness,
  skills: Target,
  tools: Wrench,
  education: GraduationCap,
  languages: Languages,
  contact: Mail,
};

const sections: CvSection[] = cvSectionLabels.map((section) => {
  const id = section.id as SectionId;
  return { ...section, id, icon: sectionIcons[id] };
});

const contacts = [
  {
    label: "Email",
    value: cvProfile.email,
    href: `mailto:${cvProfile.email}`,
    icon: Mail,
  },
  {
    label: "Phone",
    value: cvProfile.phone,
    href: `tel:${cvProfile.phone}`,
    icon: Phone,
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function initials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function useCvViewportLock() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const footer = document.querySelector("body > footer") as HTMLElement | null;
    const previous = {
      htmlHeight: html.style.height,
      htmlOverflow: html.style.overflow,
      bodyHeight: body.style.height,
      bodyOverflow: body.style.overflow,
      footerDisplay: footer?.style.display,
    };

    html.style.height = "100%";
    html.style.overflow = "hidden";
    body.style.height = "100%";
    body.style.overflow = "hidden";
    if (footer) footer.style.display = "none";

    return () => {
      html.style.height = previous.htmlHeight;
      html.style.overflow = previous.htmlOverflow;
      body.style.height = previous.bodyHeight;
      body.style.overflow = previous.bodyOverflow;
      if (footer) footer.style.display = previous.footerDisplay ?? "";
    };
  }, []);
}

function GlassCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-[1.25rem] border border-steel-400/20 bg-mist-300/[0.055] shadow-2xl shadow-navy-900/35 backdrop-blur-xl",
        className
      )}
    >
      {children}
    </div>
  );
}

function IconFrame({ icon: Icon, active = false }: { icon: LucideIcon; active?: boolean }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 flex-none items-center justify-center rounded-2xl border transition-colors duration-200 md:h-10 md:w-10",
        active
          ? "border-champagne/45 bg-champagne text-ink"
          : "border-steel-400/25 bg-ink/45 text-champagne"
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </span>
  );
}

function TopBar() {
  return (
    <GlassCard className="flex min-h-0 items-center justify-between gap-3 px-3 py-2.5 sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl border border-champagne/35 bg-champagne font-display text-xs font-bold text-ink">
          SS
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold uppercase tracking-[0.16em] text-mist-300">
            {cvProfile.displayName}
          </p>
          <p className="mt-0.5 truncate text-xs text-haze/72">
            Professional CV
            <span className="hidden sm:inline">
              {" "}
              - {cvProfile.title}
            </span>
          </p>
        </div>
      </div>

      <div className="flex flex-none items-center gap-2">
        <a
          href={cvDownloadHref}
          download={cvDownloadFileName}
          aria-label="Download Sultan Shadi CV"
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-champagne/35 bg-champagne px-3 text-xs font-semibold text-ink transition-colors duration-200 hover:bg-champagne-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">Download CV</span>
          <span className="sm:hidden">PDF</span>
        </a>
        <a
          href={`mailto:${cvProfile.email}`}
          className="hidden min-h-10 items-center gap-2 rounded-full border border-steel-400/20 bg-ink/45 px-3 text-xs font-medium text-mist transition-colors duration-200 hover:border-champagne/45 hover:text-champagne focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne sm:inline-flex"
        >
          <Mail className="h-3.5 w-3.5" aria-hidden />
          Email
        </a>
        <span className="hidden min-h-10 items-center rounded-full border border-champagne/25 bg-champagne/10 px-3 text-xs font-medium text-champagne-300 sm:inline-flex">
          JO / KSA
        </span>
      </div>
    </GlassCard>
  );
}

function ProfileCard() {
  return (
    <GlassCard className="flex h-full min-h-0 items-center gap-3 p-3 md:flex-col md:items-stretch">
      <div className="relative h-16 w-16 flex-none overflow-hidden rounded-[1rem] border border-steel-400/20 md:h-40 md:w-full xl:flex-1">
        <Image
          src="/sultan.jpeg"
          alt="Sultan Alhaj Ahmad portrait"
          fill
          priority
          sizes="(max-width: 767px) 64px, (max-width: 1279px) 17rem, 24vw"
          className="object-cover transition-transform duration-300 hover:scale-[1.025]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/55 via-transparent to-transparent" />
      </div>

      <div className="min-w-0 flex-1 md:flex-none">
        <p className="truncate font-display text-base font-semibold uppercase leading-tight text-mist-300 md:text-xl xl:text-2xl">
          {cvProfile.formalName}
        </p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-haze/76 md:text-sm">
          {cvProfile.title}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5 md:mt-4">
          <span className="rounded-full border border-champagne/25 bg-champagne/10 px-2.5 py-1 text-[0.68rem] font-medium text-champagne-300">
            {cvProfile.location.split(",")[0]}
          </span>
          <span className="rounded-full border border-steel-400/20 bg-ink/45 px-2.5 py-1 text-[0.68rem] text-haze/78">
            5+ years
          </span>
        </div>
      </div>
    </GlassCard>
  );
}

function SignalCard() {
  return (
    <GlassCard className="hidden h-full p-4 xl:flex xl:flex-col xl:justify-between">
      <div>
        <p className="font-display text-[0.62rem] uppercase tracking-[0.22em] text-champagne/75">
          Market Signal
        </p>
        <p className="mt-3 text-3xl font-semibold text-mist-300">JO + KSA</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {cvSectors.slice(0, 4).map((item) => (
          <span
            key={item}
            className="rounded-2xl border border-steel-400/18 bg-ink/40 px-3 py-2 text-xs text-haze/78"
          >
            {item}
          </span>
        ))}
      </div>
    </GlassCard>
  );
}

function SectionButton({
  section,
  active,
  onSelect,
}: {
  section: CvSection;
  active: boolean;
  onSelect: (id: SectionId) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onSelect(section.id)}
      className={cn(
        "group min-w-0 rounded-[1rem] border p-2 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne sm:p-3",
        active
          ? "border-champagne/60 bg-champagne/15"
          : "border-steel-400/18 bg-ink/38 hover:border-champagne/35 hover:bg-mist-300/[0.07]"
      )}
    >
      <div className="flex min-w-0 flex-col items-center justify-center gap-1 text-center sm:flex-row sm:justify-start sm:gap-3 sm:text-left">
        <IconFrame icon={section.icon} active={active} />
        <span className="min-w-0">
          <span className="block truncate font-display text-[0.64rem] uppercase tracking-[0.14em] text-mist-300 sm:text-[0.7rem]">
            <span className="sm:hidden">{section.shortLabel}</span>
            <span className="hidden sm:inline">{section.label}</span>
          </span>
          <span className="mt-1 hidden truncate text-xs text-haze/68 md:block">
            {section.hint}
          </span>
        </span>
      </div>
    </button>
  );
}

function CommandCard({
  selected,
  onSelect,
}: {
  selected: SectionId;
  onSelect: (id: SectionId) => void;
}) {
  return (
    <GlassCard className="flex h-full min-h-0 flex-col p-3">
      <div className="mb-2 flex flex-none items-center justify-between gap-3 md:mb-3">
        <div className="min-w-0">
          <p className="font-display text-[0.62rem] uppercase tracking-[0.22em] text-champagne/75">
            Command
          </p>
          <p className="hidden text-sm text-haze/70 md:mt-1 md:block">
            Choose one CV module.
          </p>
        </div>
        <FileText className="h-4 w-4 flex-none text-champagne/75" aria-hidden />
      </div>

      <div className="grid flex-none grid-cols-4 gap-2 md:min-h-0 md:flex-1 md:grid-cols-2 md:auto-rows-fr">
        {sections.map((section) => (
          <SectionButton
            key={section.id}
            section={section}
            active={selected === section.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </GlassCard>
  );
}

function DetailFrame({ selected }: { selected: CvSection }) {
  return (
    <div className="flex flex-none items-center justify-between gap-3 border-b border-steel-400/18 px-3 py-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-3">
        <IconFrame icon={selected.icon} active />
        <div className="min-w-0">
          <p className="font-display text-[0.6rem] uppercase tracking-[0.22em] text-champagne/75">
            Active Panel
          </p>
          <h2 className="mt-0.5 truncate text-lg font-semibold text-mist-300 sm:text-xl">
            {selected.label}
          </h2>
        </div>
      </div>
      <span className="hidden rounded-full border border-steel-400/20 bg-ink/35 px-3 py-1.5 text-xs text-haze/72 sm:block">
        In place
      </span>
    </div>
  );
}

function DetailCard({
  selected,
  section,
}: {
  selected: SectionId;
  section: CvSection;
}) {
  return (
    <GlassCard className="flex h-full min-h-0 flex-col">
      <DetailFrame selected={section} />
      <div
        key={selected}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 transition duration-200 sm:p-4"
      >
        <DetailBody selected={selected} />
      </div>
    </GlassCard>
  );
}

function ProfileDetail() {
  return (
    <div className="grid gap-3">
      <div className="rounded-[1.1rem] border border-steel-400/18 bg-ink/38 p-4">
        <p className="max-w-3xl text-sm leading-6 text-mist/86 sm:text-base sm:leading-7">
          {cvProfile.summary}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {cvSectors.map((sector) => (
          <div
            key={sector}
            className="rounded-2xl border border-steel-400/18 bg-mist-300/[0.055] p-3"
          >
            <p className="text-[0.62rem] uppercase tracking-[0.16em] text-haze/58">
              Sector
            </p>
            <p className="mt-1.5 text-sm font-medium text-mist-300">{sector}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <InfoTile icon={MapPin} label="Location" value={cvProfile.location} />
        <InfoTile icon={BadgeCheck} label="Nationality" value={cvProfile.nationality} />
        <InfoTile icon={Target} label="Markets" value="Jordan & Saudi Arabia" />
      </div>

      <div className="grid gap-2 lg:grid-cols-2">
        <div className="rounded-[1rem] border border-steel-400/18 bg-ink/38 p-3">
          <p className="font-display text-[0.62rem] uppercase tracking-[0.18em] text-champagne/80">
            Specialized In
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {cvSpecializations.map((item) => (
              <span
                key={item}
                className="rounded-full border border-steel-400/18 bg-mist-300/[0.06] px-3 py-1.5 text-xs leading-5 text-mist/82"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-[1rem] border border-steel-400/18 bg-ink/38 p-3">
          <p className="font-display text-[0.62rem] uppercase tracking-[0.18em] text-champagne/80">
            Known For
          </p>
          <ul className="mt-3 grid gap-2">
            {cvHighlights.slice(0, 3).map((item) => (
              <li key={item} className="flex gap-2 text-xs leading-5 text-mist/82">
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-champagne" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-[1rem] border border-steel-400/18 bg-ink/38 p-3">
        <p className="font-display text-[0.62rem] uppercase tracking-[0.18em] text-champagne/80">
          Selected Value
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {cvSelectedValue.map((item) => (
            <span
              key={item}
              className="rounded-full border border-steel-400/18 bg-mist-300/[0.06] px-3 py-1.5 text-xs leading-5 text-mist/82"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExperienceDetail() {
  const [active, setActive] = useState(0);
  const item = cvExperience[active];

  return (
    <div className="grid gap-3 lg:grid-cols-[14rem_minmax(0,1fr)]">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {cvExperience.map((entry, index) => (
          <button
            key={entry.company}
            type="button"
            aria-pressed={active === index}
            onClick={() => setActive(index)}
            className={cn(
              "min-w-0 rounded-[1rem] border p-3 text-left transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne",
              active === index
                ? "border-champagne/55 bg-champagne/14"
                : "border-steel-400/18 bg-ink/38 hover:border-champagne/35"
            )}
          >
            <p className="text-[0.68rem] font-medium leading-4 text-champagne/80">
              {entry.dates}
            </p>
            <p className="mt-2 text-sm font-semibold leading-5 text-mist-300">
              {entry.role}
            </p>
            <p className="mt-1 text-xs leading-4 text-haze/68">{entry.company}</p>
          </button>
        ))}
      </div>

      <article className="min-w-0 rounded-[1.1rem] border border-steel-400/18 bg-ink/38 p-4">
        <p className="text-sm font-medium text-champagne/80">{item.company}</p>
        <h3 className="mt-2 text-xl font-semibold leading-tight text-mist-300 sm:text-2xl">
          {item.role}
        </h3>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-haze/72">
          <span className="rounded-full border border-steel-400/20 px-3 py-1.5">
            {item.dates}
          </span>
          <span className="rounded-full border border-steel-400/20 px-3 py-1.5">
            {item.location}
          </span>
        </div>
        <ul className="mt-4 grid gap-2.5">
          {item.points.map((point) => (
            <li key={point} className="flex gap-3 text-sm leading-6 text-mist/82">
              <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-champagne" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}

function SkillsDetail() {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {cvSkillGroups.map((group) => (
        <div
          key={group.label}
          className="rounded-[1rem] border border-steel-400/18 bg-ink/38 p-3"
        >
          <p className="font-display text-[0.64rem] uppercase tracking-[0.18em] text-champagne/80">
            {group.label}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {group.items.map((item) => (
              <span
                key={item}
                className="rounded-full border border-steel-400/18 bg-mist-300/[0.06] px-3 py-1.5 text-sm leading-5 text-mist/82"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ToolsDetail() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
      {cvTools.map((tool) => (
        <div
          key={tool}
          className="flex min-w-0 items-center gap-2 rounded-[1rem] border border-steel-400/18 bg-ink/38 p-2.5 sm:gap-3 sm:p-3"
        >
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-2xl bg-champagne text-xs font-bold text-ink">
            {initials(tool)}
          </span>
          <span className="min-w-0 break-words text-xs font-medium leading-5 text-mist/84 sm:text-sm">
            {tool}
          </span>
        </div>
      ))}
    </div>
  );
}

function EducationDetail() {
  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_15rem]">
      <div className="rounded-[1.1rem] border border-steel-400/18 bg-ink/38 p-4">
        <p className="text-sm font-medium text-champagne/80">
          {cvEducation.school}
        </p>
        <h3 className="mt-2 text-2xl font-semibold text-mist-300 sm:text-3xl">
          {cvEducation.degree}
        </h3>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <InfoTile icon={CalendarDays} label="Dates" value={cvEducation.dates} />
          <InfoTile icon={BadgeCheck} label="Result" value={cvEducation.result} />
        </div>
      </div>
      <div className="rounded-[1.1rem] border border-champagne/25 bg-champagne/12 p-4">
        <GraduationCap className="h-8 w-8 text-champagne" aria-hidden />
        <p className="mt-4 text-sm leading-6 text-mist/82">
          A marketing foundation supporting his work in campaign planning,
          content systems, and performance-focused execution.
        </p>
      </div>
    </div>
  );
}

function LanguagesDetail() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {cvLanguages.map((language) => (
        <InfoTile
          key={language.label}
          icon={Languages}
          label={language.label}
          value={language.value}
        />
      ))}
      <InfoTile icon={BadgeCheck} label="Nationality" value={cvProfile.nationality} />
      <InfoTile icon={MapPin} label="Location" value={cvProfile.location} />
      <InfoTile icon={CalendarDays} label="Date of birth" value={cvProfile.dateOfBirth} />
    </div>
  );
}

function ContactDetail() {
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {contacts.map((contact) => (
        <a
          key={contact.value}
          href={contact.href}
          className="group flex min-w-0 flex-col justify-between rounded-[1.1rem] border border-steel-400/18 bg-ink/38 p-4 transition-colors duration-200 hover:border-champagne/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne"
        >
          <span className="flex items-center justify-between gap-3">
            <IconFrame icon={contact.icon} />
            <ArrowUpRight
              className="h-4 w-4 flex-none text-haze/60 transition-colors duration-200 group-hover:text-champagne"
              aria-hidden
            />
          </span>
          <span className="mt-6 min-w-0">
            <span className="block text-sm font-medium text-champagne/80">
              {contact.label}
            </span>
            <span className="mt-2 block break-words text-sm font-semibold leading-5 text-mist-300 sm:text-base">
              {contact.value}
            </span>
          </span>
        </a>
      ))}
      {cvProfile.addresses.map((address) => (
        <div
          key={address}
          className="rounded-[1.1rem] border border-steel-400/18 bg-ink/38 p-3 md:col-span-3"
        >
          <InfoTile icon={MapPin} label="Address" value={address} />
        </div>
      ))}
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-[1rem] border border-steel-400/18 bg-mist-300/[0.055] p-3">
      <IconFrame icon={icon} />
      <div className="min-w-0">
        <p className="text-[0.62rem] uppercase tracking-[0.15em] text-haze/58">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-semibold text-mist-300">
          {value}
        </p>
      </div>
    </div>
  );
}

function DetailBody({ selected }: { selected: SectionId }) {
  switch (selected) {
    case "experience":
      return <ExperienceDetail />;
    case "skills":
      return <SkillsDetail />;
    case "tools":
      return <ToolsDetail />;
    case "education":
      return <EducationDetail />;
    case "languages":
      return <LanguagesDetail />;
    case "contact":
      return <ContactDetail />;
    default:
      return <ProfileDetail />;
  }
}

export default function CvControlCenter() {
  const [selected, setSelected] = useState<SectionId>("profile");
  const activeSection = sections.find((section) => section.id === selected) ?? sections[0];

  useCvViewportLock();

  return (
    <main
      id="cv-control-center"
      className="relative h-[100svh] overflow-hidden bg-ink pt-20 text-mist-300 selection:bg-champagne selection:text-ink"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(227,195,157,0.16),transparent_29%),radial-gradient(circle_at_86%_18%,rgba(152,170,194,0.10),transparent_27%),linear-gradient(135deg,#000419_0%,#071739_48%,#18283c_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-navy-900/80 to-transparent" />

      <div className="relative mx-auto grid h-[calc(100svh-5rem)] w-full max-w-[1600px] grid-rows-[auto_minmax(0,1fr)] gap-2 px-2 pb-2 sm:gap-3 sm:px-3 sm:pb-3 lg:px-4 lg:pb-4">
        <TopBar />

        <div className="grid min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] gap-2 sm:gap-3 md:grid-cols-[17rem_minmax(0,1fr)] md:grid-rows-[auto_minmax(0,1fr)] xl:grid-cols-12 xl:grid-rows-6">
          <div className="min-h-0 md:col-start-1 md:row-start-1 xl:col-span-3 xl:row-span-4">
            <ProfileCard />
          </div>

          <div className="min-h-0 md:col-start-1 md:row-start-2 xl:col-start-4 xl:row-start-1 xl:col-span-3 xl:row-span-6">
            <CommandCard selected={selected} onSelect={setSelected} />
          </div>

          <div className="min-h-0 md:col-start-2 md:row-span-2 md:row-start-1 xl:col-start-7 xl:row-start-1 xl:col-span-6 xl:row-span-6">
            <DetailCard selected={selected} section={activeSection} />
          </div>

          <div className="hidden min-h-0 xl:col-span-3 xl:row-span-2 xl:row-start-5 xl:block">
            <SignalCard />
          </div>
        </div>
      </div>
    </main>
  );
}
