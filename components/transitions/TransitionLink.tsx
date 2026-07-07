"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import {
  isExternalHref,
  isModifiedNavigation,
  type TransitionIntent,
} from "@/lib/motion/pageTransitions";
import { usePageTransition } from "./TransitionProvider";

interface TransitionLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> {
  href: string;
  intent?: TransitionIntent;
  label?: string;
  replace?: boolean;
  onBeforeNavigate?: () => void;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function TransitionLink({
  href,
  intent,
  label,
  replace,
  target,
  download,
  onBeforeNavigate,
  onClick,
  children,
  ...props
}: TransitionLinkProps) {
  const { navigate, isTransitioning } = usePageTransition();
  const external = isExternalHref(href);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (external || target || download || isModifiedNavigation(event)) return;

    event.preventDefault();
    onBeforeNavigate?.();
    void navigate(href, { intent, label, replace });
  };

  if (external) {
    return (
      <a href={href} target={target} download={download} onClick={onClick} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      target={target}
      aria-disabled={isTransitioning || props["aria-disabled"]}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}
