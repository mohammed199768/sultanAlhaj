import { cn } from "@/lib/utils/cn";
import TransitionLink from "@/components/transitions/TransitionLink";

type Variant = "primary" | "ghost";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  external?: boolean;
  ariaLabel?: string;
}

export default function Button({
  href,
  children,
  variant = "primary",
  className,
  external,
  ariaLabel,
}: ButtonProps) {
  const cls = cn(variant === "primary" ? "btn-primary" : "btn-ghost", className);
  if (external) {
    return (
      <a
        href={href}
        className={cls}
        aria-label={ariaLabel}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }
  return (
    <TransitionLink href={href} className={cls} aria-label={ariaLabel}>
      {children}
    </TransitionLink>
  );
}
