import { cn } from "@/lib/utils/cn";
import Reveal from "./Reveal";

interface Props {
  index?: string;
  eyebrow: string;
  title: string;
  intro?: string;
  className?: string;
  align?: "left" | "center";
}

export default function SectionHeader({
  index,
  eyebrow,
  title,
  intro,
  className,
  align = "left",
}: Props) {
  return (
    <div
      className={cn(
        "mb-14 md:mb-20 max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <Reveal>
        <div
          className={cn(
            "flex items-center gap-4",
            align === "center" && "justify-center"
          )}
        >
          {index && (
            <span className="font-display text-xs text-champagne/70">{index}</span>
          )}
          <span className="eyebrow">{eyebrow}</span>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="display-2 mt-5">{title}</h2>
      </Reveal>
      {intro && (
        <Reveal delay={0.16}>
          <p className="lede mt-6">{intro}</p>
        </Reveal>
      )}
    </div>
  );
}
