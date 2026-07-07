import { cn } from "@/lib/utils/cn";

export default function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("shell", className)}>{children}</div>;
}
