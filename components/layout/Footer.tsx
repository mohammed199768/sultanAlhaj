import { profile, emailHref, whatsappHref } from "@/lib/data/profile";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-steel-400/25 py-14">
      <div className="shell flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl font-bold uppercase tracking-tight text-mist-300">
            {profile.name}
          </p>
          <p className="mt-2 max-w-sm text-sm text-haze/70">
            {profile.primaryTitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 font-display text-[0.65rem] uppercase tracking-[0.25em] text-haze/70">
          <a href={emailHref} className="hover:text-champagne">
            Email
          </a>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:text-champagne">
            WhatsApp
          </a>
          <a href={`tel:${profile.phone}`} className="hover:text-champagne">
            {profile.phone}
          </a>
          {profile.linkedin ? (
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-champagne">
              LinkedIn
            </a>
          ) : null}
        </div>
      </div>
      <div className="shell mt-10 flex flex-col gap-2 text-[0.65rem] text-haze/40 md:flex-row md:justify-between">
        <span>
          © {year} {profile.formalName}. All rights reserved.
        </span>
        <span>Built as a cinematic marketing dossier.</span>
      </div>
    </footer>
  );
}
