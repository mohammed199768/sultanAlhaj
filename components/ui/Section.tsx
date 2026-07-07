import { cn } from "@/lib/utils/cn";
import Container from "./Container";

interface SectionProps {
  id?: string;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
  full?: boolean;
}

/** Vertical rhythm wrapper. `full` opts out of the max-width container. */
export default function Section({
  id,
  className,
  containerClassName,
  children,
  full,
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn("relative py-24 md:py-36 scroll-mt-24", className)}
    >
      {full ? children : <Container className={containerClassName}>{children}</Container>}
    </section>
  );
}
