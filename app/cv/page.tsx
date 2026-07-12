import type { Metadata } from "next";
import CvControlCenter from "./CvControlCenter";
import cv from "@/content/cv.json";

export const metadata: Metadata = cv.metadata;

export default function CvPage() {
  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          html:has(#cv-control-center),
          html:has(#cv-control-center) body {
            height: 100%;
            overflow: hidden;
          }
        }

        body:has(#cv-control-center) footer {
          display: none;
        }

        @media (max-width: 767.98px) and (max-height: 500px) {
          #cv-control-center {
            height: auto;
            min-height: 100vh;
            min-height: 100dvh;
            overflow-y: visible;
          }

          #cv-control-center .cv-shell {
            height: auto;
            min-height: calc(100vh - 5rem);
            min-height: calc(100dvh - 5rem);
          }

          #cv-control-center .cv-dashboard {
            grid-template-rows: auto auto clamp(18rem, 85dvh, 22rem);
          }
        }
      `}</style>
      <CvControlCenter />
    </>
  );
}
