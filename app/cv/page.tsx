import type { Metadata } from "next";
import CvControlCenter from "./CvControlCenter";

export const metadata: Metadata = {
  title: "Sultan Shadi CV",
  description:
    "Professional CV of Sultan Shadi - Marketing Manager, Digital Strategist, and Content Architect.",
};

export default function CvPage() {
  return (
    <>
      <style>{`
        html:has(#cv-control-center),
        html:has(#cv-control-center) body {
          height: 100%;
          overflow: hidden;
        }

        body:has(#cv-control-center) > footer {
          display: none;
        }
      `}</style>
      <CvControlCenter />
    </>
  );
}
