import type { Metadata } from "next";
import CvControlCenter from "./CvControlCenter";
import cv from "@/content/cv.json";

export const metadata: Metadata = cv.metadata;

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
