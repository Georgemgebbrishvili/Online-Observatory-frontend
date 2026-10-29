import type { ColorValue } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

import { palette } from "@/theme";

// The website's comet mark (apps/web/public/brand/logo-mark.svg) and wordmark
// (brand-lockup.tsx, Archivo Expanded Black as outlines), drawn natively.
const cometPath =
  "M13.0922 3.36946V1.73961C13.0922 1.27436 12.5543 1.01542 12.1906 1.30569L2.8604 8.75177C-0.321404 11.5593 -0.474794 16.4692 2.52582 19.4698C5.5263 22.4704 10.4363 22.3171 13.2437 19.1351L20.6898 9.80489C20.9801 9.44124 20.7211 8.90346 20.256 8.90346H18.6262C18.211 8.90346 17.9428 8.4646 18.132 8.09517L21.7925 0.950365C22.0383 0.470724 21.5251 -0.0425023 21.0451 0.203175L13.9005 3.86349C13.531 4.05286 13.0922 3.78447 13.0922 3.36946ZM7.99167 18.4452C5.53886 18.4452 3.55044 16.4567 3.55044 14.004C3.55044 11.5512 5.53872 9.56274 7.99167 9.5626C10.4445 9.5626 12.4329 11.5512 12.4329 14.004C12.4329 16.4568 10.4445 18.4452 7.99167 18.4452Z";

const wordmarkPath =
  "M468 12Q379 12 302 2Q225 -9 167 -34Q109 -60 76 -106Q43 -151 43 -220Q43 -222 43 -226Q43 -229 44 -233H285Q284 -229 284 -226Q284 -222 284 -219Q284 -189 304 -173Q324 -157 360 -152Q396 -146 443 -146Q462 -146 482 -146Q503 -147 522 -150Q542 -152 558 -157Q573 -162 582 -170Q592 -179 592 -192Q592 -210 570 -220Q547 -230 508 -236Q470 -241 422 -246Q375 -251 324 -259Q273 -267 226 -282Q178 -296 140 -321Q101 -346 78 -385Q56 -424 56 -480Q56 -540 88 -582Q119 -624 173 -650Q227 -676 297 -688Q367 -700 443 -700Q521 -700 590 -688Q658 -677 710 -652Q763 -627 793 -586Q823 -546 823 -488V-476H584V-480Q584 -500 571 -516Q558 -531 529 -540Q500 -550 453 -550Q405 -550 373 -544Q341 -538 326 -528Q310 -517 310 -505Q310 -487 332 -477Q355 -467 394 -462Q432 -456 480 -451Q527 -446 578 -438Q629 -431 676 -418Q724 -404 762 -380Q801 -356 824 -319Q846 -282 846 -228Q846 -143 796 -90Q747 -37 662 -12Q576 12 468 12ZM1197 0V-499H905V-688H1736V-499H1444V0ZM1833 0V-688H2568V-517H2081V-428H2501V-266H2081V-171H2576V0ZM2693 0V-688H2940V-189H3386V0ZM3479 0V-688H3726V-189H4172V0ZM4199 0 4532 -688H4804L5137 0H4872L4831 -91H4494L4454 0ZM4569 -262H4756L4708 -378Q4705 -386 4700 -400Q4695 -413 4689 -430Q4683 -447 4678 -464Q4672 -481 4667 -495H4660Q4654 -478 4646 -456Q4638 -434 4630 -413Q4623 -392 4617 -378ZM5219 0V-688H5815Q5892 -688 5944 -656Q5995 -624 6021 -572Q6047 -520 6047 -460Q6047 -391 6016 -338Q5986 -284 5927 -252L6063 0H5784L5680 -215H5466V0ZM5466 -386H5728Q5756 -386 5775 -404Q5794 -421 5794 -452Q5794 -473 5785 -488Q5776 -502 5762 -510Q5747 -517 5728 -517H5466Z";

export function CometMark({ size = 24 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0.1439 0.3757 21.485 21.485">
      <Defs>
        <LinearGradient id="core" gradientUnits="userSpaceOnUse" x1="14.008" y1="3.555" x2="14.008" y2="12.437">
          <Stop offset="0" stopColor="#FF8146" />
          <Stop offset="1" stopColor="#C8102E" />
        </LinearGradient>
      </Defs>
      <Circle cx="14.0083" cy="7.9960" r="4.4812" fill="url(#core)" />
      <Path transform="rotate(180 11 11)" d={cometPath} fill={palette.mark} fillRule="evenodd" />
    </Svg>
  );
}

export function Wordmark({ height = 14 }: { height?: number }) {
  return (
    <Svg width={(height * 6020) / 712} height={height} viewBox="43 -700 6020 712">
      <Path d={wordmarkPath} fill={palette.mark} />
    </Svg>
  );
}

type IconProps = { color: ColorValue; size?: number };

const stroke = (color: ColorValue) => ({
  stroke: color,
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
});

/** Tonight: a crescent over a horizon. */
export function TonightIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M15.5 3.5a7 7 0 1 0 5 11.8A6 6 0 0 1 15.5 3.5Z" {...stroke(color)} />
      <Path d="M3 20.5h18" {...stroke(color)} />
    </Svg>
  );
}

/** Book: a ticket. */
export function BookIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3.5 7.5a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1v2.2a2.3 2.3 0 0 0 0 4.6v2.2a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-2.2a2.3 2.3 0 0 0 0-4.6Z"
        {...stroke(color)}
      />
      <Path d="M14.5 7v10" {...stroke(color)} strokeDasharray="1.6 2.2" />
    </Svg>
  );
}

/** Collection: framed captures. */
export function CollectionIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="3.5" y="3.5" width="7" height="7" rx="1.5" {...stroke(color)} />
      <Rect x="13.5" y="3.5" width="7" height="7" rx="1.5" {...stroke(color)} />
      <Rect x="3.5" y="13.5" width="7" height="7" rx="1.5" {...stroke(color)} />
      <Rect x="13.5" y="13.5" width="7" height="7" rx="1.5" {...stroke(color)} />
    </Svg>
  );
}

/** Account: a person. */
export function AccountIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="8.5" r="4" {...stroke(color)} />
      <Path d="M4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" {...stroke(color)} />
    </Svg>
  );
}

export function ChevronLeft({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M15 5l-7 7 7 7" {...stroke(color)} strokeWidth={2.2} />
    </Svg>
  );
}

export function ChevronRight({ color, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 5l7 7-7 7" {...stroke(color)} strokeWidth={2} />
    </Svg>
  );
}
