import React, { useId, type CSSProperties, type SVGProps } from "react";

export type SultanShadiMarkVariant = "full" | "compact" | "monogram";

interface SultanShadiMarkProps
  extends Omit<SVGProps<SVGSVGElement>, "width" | "height"> {
  variant?: SultanShadiMarkVariant;
  size?: CSSProperties["width"];
  decorative?: boolean;
  title?: string;
  description?: string;
}

export default function SultanShadiMark({
  variant = "full",
  size = 120,
  decorative = false,
  title = "Sultan Shadi luxury S monogram",
  description = "A champagne-gold custom S monogram in an elliptical frame.",
  className,
  style,
  ...props
}: SultanShadiMarkProps) {
  const instanceId = useId().replace(/:/g, "");
  const prefix = `sultan-shadi-${instanceId}`;
  const gradient = (name: string) => `url(#${prefix}-${name})`;
  const titleId = `${prefix}-title`;
  const descriptionId = `${prefix}-description`;
  const showFullFrame = variant === "full";
  const showCompactFrame = variant === "compact";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 822 961"
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="geometricPrecision"
      className={className}
      style={{ width: size, height: "auto", ...style }}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-labelledby={decorative ? undefined : `${titleId} ${descriptionId}`}
      focusable="false"
      {...props}
    >
      {!decorative && <title id={titleId}>{title}</title>}
      {!decorative && <desc id={descriptionId}>{description}</desc>}

      <defs>
        <linearGradient
          id={`${prefix}-monogram-gold`}
          gradientUnits="userSpaceOnUse"
          x1="218"
          y1="165"
          x2="622"
          y2="750"
        >
          <stop offset="0" stopColor="#8C5718" />
          <stop offset="0.16" stopColor="#BE8731" />
          <stop offset="0.34" stopColor="#DDB86D" />
          <stop offset="0.47" stopColor="#F5D995" />
          <stop offset="0.58" stopColor="#FFF0BD" />
          <stop offset="0.69" stopColor="#DDB86D" />
          <stop offset="0.84" stopColor="#C8943D" />
          <stop offset="1" stopColor="#8C5718" />
        </linearGradient>

        <linearGradient
          id={`${prefix}-monogram-edge`}
          gradientUnits="userSpaceOnUse"
          x1="236"
          y1="155"
          x2="587"
          y2="779"
        >
          <stop offset="0" stopColor="#FFF0BD" />
          <stop offset="0.28" stopColor="#E6C478" />
          <stop offset="0.57" stopColor="#B57827" />
          <stop offset="0.79" stopColor="#8C5718" />
          <stop offset="1" stopColor="#60370C" />
        </linearGradient>

        <linearGradient
          id={`${prefix}-monogram-highlight`}
          gradientUnits="userSpaceOnUse"
          x1="248"
          y1="175"
          x2="555"
          y2="742"
        >
          <stop offset="0" stopColor="#FFF7D6" />
          <stop offset="0.46" stopColor="#FFF0BD" />
          <stop offset="0.76" stopColor="#E6C478" />
          <stop offset="1" stopColor="#C8943D" />
        </linearGradient>

        <linearGradient
          id={`${prefix}-monogram-depth`}
          gradientUnits="userSpaceOnUse"
          x1="240"
          y1="215"
          x2="580"
          y2="730"
        >
          <stop offset="0" stopColor="#5F350A" />
          <stop offset="0.38" stopColor="#8C5718" />
          <stop offset="0.7" stopColor="#B57827" />
          <stop offset="1" stopColor="#63380B" />
        </linearGradient>

        <linearGradient
          id={`${prefix}-frame-gold`}
          gradientUnits="userSpaceOnUse"
          x1="18"
          y1="0"
          x2="804"
          y2="0"
        >
          <stop offset="0" stopColor="#815016" />
          <stop offset="0.18" stopColor="#BD8430" />
          <stop offset="0.38" stopColor="#F0D186" />
          <stop offset="0.5" stopColor="#FFF0BD" />
          <stop offset="0.62" stopColor="#E1BA68" />
          <stop offset="0.82" stopColor="#B97925" />
          <stop offset="1" stopColor="#75430F" />
        </linearGradient>

        <linearGradient
          id={`${prefix}-frame-highlight`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="120"
          x2="822"
          y2="840"
        >
          <stop offset="0" stopColor="#FFF0BD" />
          <stop offset="0.38" stopColor="#E7C778" />
          <stop offset="0.7" stopColor="#C8943D" />
          <stop offset="1" stopColor="#8C5718" />
        </linearGradient>

        <linearGradient
          id={`${prefix}-star-top-base`}
          gradientUnits="userSpaceOnUse"
          x1="386"
          y1="12"
          x2="447"
          y2="100"
        >
          <stop offset="0" stopColor="#FFF0BD" />
          <stop offset="0.28" stopColor="#F5D995" />
          <stop offset="0.56" stopColor="#D6A64F" />
          <stop offset="0.78" stopColor="#A5661E" />
          <stop offset="1" stopColor="#6D3D0C" />
        </linearGradient>

        <linearGradient
          id={`${prefix}-star-top-light`}
          gradientUnits="userSpaceOnUse"
          x1="382"
          y1="17"
          x2="429"
          y2="75"
        >
          <stop offset="0" stopColor="#FFF7D6" />
          <stop offset="0.5" stopColor="#F5D995" />
          <stop offset="1" stopColor="#D49D42" />
        </linearGradient>

        <linearGradient
          id={`${prefix}-star-top-dark`}
          gradientUnits="userSpaceOnUse"
          x1="421"
          y1="42"
          x2="448"
          y2="98"
        >
          <stop offset="0" stopColor="#DDB86D" />
          <stop offset="0.52" stopColor="#B77928" />
          <stop offset="1" stopColor="#75430F" />
        </linearGradient>

        <linearGradient
          id={`${prefix}-star-bottom-base`}
          gradientUnits="userSpaceOnUse"
          x1="382"
          y1="832"
          x2="452"
          y2="938"
        >
          <stop offset="0" stopColor="#FFF0BD" />
          <stop offset="0.28" stopColor="#EAC778" />
          <stop offset="0.57" stopColor="#D19A3D" />
          <stop offset="0.82" stopColor="#9A5C17" />
          <stop offset="1" stopColor="#65380A" />
        </linearGradient>

        <linearGradient
          id={`${prefix}-star-bottom-light`}
          gradientUnits="userSpaceOnUse"
          x1="379"
          y1="836"
          x2="429"
          y2="900"
        >
          <stop offset="0" stopColor="#FFF7D6" />
          <stop offset="0.48" stopColor="#F5D995" />
          <stop offset="1" stopColor="#D49D42" />
        </linearGradient>

        <linearGradient
          id={`${prefix}-star-bottom-dark`}
          gradientUnits="userSpaceOnUse"
          x1="421"
          y1="874"
          x2="448"
          y2="937"
        >
          <stop offset="0" stopColor="#DDB86D" />
          <stop offset="0.53" stopColor="#AD6B20" />
          <stop offset="1" stopColor="#65380A" />
        </linearGradient>
      </defs>

      {showFullFrame && (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M364 62C174 84 25 250 25 454C25 651 160 824 361 875C388 882 402 907 415 939M466 62C656 85 800 251 800 454C800 651 662 824 469 875C442 883 429 907 415 939"
            stroke="#75430F"
            strokeWidth="5.4"
          />
          <path
            d="M364 62C174 84 25 250 25 454C25 651 160 824 361 875C388 882 402 907 415 939M466 62C656 85 800 251 800 454C800 651 662 824 469 875C442 883 429 907 415 939"
            stroke={gradient("frame-gold")}
            strokeWidth="3.4"
          />
          <path
            d="M365 61C176 85 28 251 28 452M465 61C653 86 797 252 797 452"
            stroke={gradient("frame-highlight")}
            strokeWidth="1.1"
            opacity="0.9"
          />
        </g>
      )}

      {(showFullFrame || showCompactFrame) && (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M365 76C187 97 40 255 40 453C40 640 168 805 365 861C391 869 403 892 415 921M465 76C644 98 785 256 785 453C785 640 656 805 467 861C441 870 428 893 415 921"
            stroke="#75430F"
            strokeWidth={showCompactFrame ? 7 : 4.5}
          />
          <path
            d="M365 76C187 97 40 255 40 453C40 640 168 805 365 861C391 869 403 892 415 921M465 76C644 98 785 256 785 453C785 640 656 805 467 861C441 870 428 893 415 921"
            stroke={gradient("frame-gold")}
            strokeWidth={showCompactFrame ? 4.2 : 2.6}
          />
          {!showCompactFrame && (
            <path
              d="M366 75C190 98 43 256 43 451M464 75C641 99 782 257 782 451"
              stroke={gradient("frame-highlight")}
              strokeWidth="0.9"
              opacity="0.86"
            />
          )}
        </g>
      )}

      {showFullFrame && (
        <g strokeLinejoin="round">
          <path
            d="M415 8C408 30 396 47 371 58C393 61 407 75 415 103C423 76 438 62 460 58C437 48 423 30 415 8Z"
            fill={gradient("star-top-base")}
            stroke="#8C5718"
            strokeWidth="1.5"
          />
          <path
            d="M415 8C408 30 397 47 371 58L415 58Z"
            fill={gradient("star-top-light")}
          />
          <path
            d="M415 8C422 30 435 47 460 58L415 58Z"
            fill="#E4B75F"
            opacity="0.92"
          />
          <path
            d="M371 58C392 62 406 76 415 103L415 58Z"
            fill="#C98B2C"
            opacity="0.95"
          />
          <path
            d="M460 58C438 63 423 77 415 103L415 58Z"
            fill={gradient("star-top-dark")}
          />
          <path
            d="M415 10L415 101"
            fill="none"
            stroke="#FFF0BD"
            strokeWidth="0.9"
            opacity="0.65"
          />
          <path
            d="M373 58H458"
            fill="none"
            stroke="#A8691E"
            strokeWidth="0.8"
            opacity="0.62"
          />
        </g>
      )}

      <g>
        <path
          fill={gradient("monogram-gold")}
          fillRule="evenodd"
          clipRule="evenodd"
          stroke={gradient("monogram-edge")}
          strokeWidth="2.2"
          strokeLinejoin="round"
          paintOrder="stroke fill"
          d="M569 165C557 181 548 190 534 190C497 171 453 165 411 166C321 166 253 220 232 298C208 386 247 458 324 507L463 595C512 627 536 657 524 694C510 738 468 758 416 758C336 758 276 718 230 581L230 756C244 741 258 730 275 730C311 730 345 765 416 765C506 765 576 730 611 665C645 601 628 532 580 485C553 458 510 431 463 402L356 335C316 310 296 282 307 245C319 204 360 179 410 177C470 174 524 192 548 225L569 316ZM321 192C285 225 267 271 277 317C288 367 327 403 389 443L501 514C549 545 579 577 584 616C589 655 573 690 546 717C526 737 500 751 466 757C501 744 526 718 536 687C549 646 533 609 491 576L365 495C303 455 259 412 246 362C232 310 249 252 286 215C298 203 310 195 321 192Z"
        />
        <path
          d="M568 166C556 181 547 190 533 190C491 169 450 165 410 166C321 166 253 220 232 298"
          fill="none"
          stroke={gradient("monogram-highlight")}
          strokeWidth="2.3"
          strokeLinecap="round"
          opacity="0.92"
        />
        <path
          d="M307 245C319 204 360 179 410 177C470 174 524 192 548 225"
          fill="none"
          stroke="#FFF0BD"
          strokeWidth="1.9"
          strokeLinecap="round"
          opacity="0.82"
        />
        <path
          d="M321 193C285 226 268 272 278 317C289 366 328 402 390 442L502 513C550 544 580 577 585 616"
          fill="none"
          stroke={gradient("monogram-highlight")}
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M246 362C259 412 303 455 365 495L491 576C533 609 549 646 536 687C526 718 501 744 466 757"
          fill="none"
          stroke={gradient("monogram-depth")}
          strokeWidth="2.1"
          strokeLinecap="round"
          opacity="0.76"
        />
        <path
          d="M230 581C244 674 305 758 416 758C468 758 510 738 524 694"
          fill="none"
          stroke={gradient("monogram-highlight")}
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.92"
        />
        <path
          d="M580 485C628 532 645 601 611 665C576 730 506 765 416 765"
          fill="none"
          stroke="#75430F"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.72"
        />
        <path
          d="M230 756C244 741 258 730 275 730C291 730 307 738 324 746"
          fill="none"
          stroke="#6E3E0B"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.82"
        />
      </g>

      {showFullFrame && (
        <g strokeLinejoin="round">
          <path
            d="M415 827C407 853 396 872 370 883C393 887 406 903 415 939C424 904 438 888 461 883C438 872 424 852 415 827Z"
            fill={gradient("star-bottom-base")}
            stroke="#8C5718"
            strokeWidth="1.5"
          />
          <path
            d="M415 827C408 853 396 872 370 883L415 883Z"
            fill={gradient("star-bottom-light")}
          />
          <path
            d="M415 827C423 852 437 872 461 883L415 883Z"
            fill="#E2B158"
            opacity="0.93"
          />
          <path
            d="M370 883C393 888 406 904 415 939L415 883Z"
            fill="#C68627"
            opacity="0.96"
          />
          <path
            d="M461 883C437 889 424 905 415 939L415 883Z"
            fill={gradient("star-bottom-dark")}
          />
          <path
            d="M415 829L415 937"
            fill="none"
            stroke="#FFF0BD"
            strokeWidth="0.9"
            opacity="0.62"
          />
          <path
            d="M372 883H459"
            fill="none"
            stroke="#A8691E"
            strokeWidth="0.8"
            opacity="0.64"
          />
        </g>
      )}
    </svg>
  );
}
