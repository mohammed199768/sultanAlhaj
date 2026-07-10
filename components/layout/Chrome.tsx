"use client";

import { useState } from "react";
import Header from "./Header";
import Menu from "./Menu";
import FloatingCvButton from "./FloatingCvButton";
import { usePageTransition } from "@/components/transitions/TransitionProvider";

/** Holds the shared menu open/close state for Header + overlay Menu. */
export default function Chrome() {
  const [open, setOpen] = useState(false);
  const { playMenuPulse } = usePageTransition();
  const toggle = () => {
    setOpen((value) => {
      playMenuPulse(!value);
      return !value;
    });
  };

  return (
    <>
      <Header open={open} onToggle={toggle} />
      <FloatingCvButton />
      <Menu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
