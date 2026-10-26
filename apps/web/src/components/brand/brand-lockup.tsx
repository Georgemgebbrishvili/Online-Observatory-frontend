import { brand } from "@/brand";

import { BrandMark } from "./brand-mark";

// The name in Archivo Expanded Black (wght 900, wdth 125) as outlines, so no page loads
// an 89 KB variable font for one word. Units are the font's (1000 to the em).
const wordmarkPath =
  "M468 12Q379 12 302 2Q225 -9 167 -34Q109 -60 76 -106Q43 -151 43 -220Q43 -222 43 -226Q43 -229 44 -233H285Q284 -229 284 -226Q284 -222 284 -219Q284 -189 304 -173Q324 -157 360 -152Q396 -146 443 -146Q462 -146 482 -146Q503 -147 522 -150Q542 -152 558 -157Q573 -162 582 -170Q592 -179 592 -192Q592 -210 570 -220Q547 -230 508 -236Q470 -241 422 -246Q375 -251 324 -259Q273 -267 226 -282Q178 -296 140 -321Q101 -346 78 -385Q56 -424 56 -480Q56 -540 88 -582Q119 -624 173 -650Q227 -676 297 -688Q367 -700 443 -700Q521 -700 590 -688Q658 -677 710 -652Q763 -627 793 -586Q823 -546 823 -488V-476H584V-480Q584 -500 571 -516Q558 -531 529 -540Q500 -550 453 -550Q405 -550 373 -544Q341 -538 326 -528Q310 -517 310 -505Q310 -487 332 -477Q355 -467 394 -462Q432 -456 480 -451Q527 -446 578 -438Q629 -431 676 -418Q724 -404 762 -380Q801 -356 824 -319Q846 -282 846 -228Q846 -143 796 -90Q747 -37 662 -12Q576 12 468 12ZM1197 0V-499H905V-688H1736V-499H1444V0ZM1833 0V-688H2568V-517H2081V-428H2501V-266H2081V-171H2576V0ZM2693 0V-688H2940V-189H3386V0ZM3479 0V-688H3726V-189H4172V0ZM4199 0 4532 -688H4804L5137 0H4872L4831 -91H4494L4454 0ZM4569 -262H4756L4708 -378Q4705 -386 4700 -400Q4695 -413 4689 -430Q4683 -447 4678 -464Q4672 -481 4667 -495H4660Q4654 -478 4646 -456Q4638 -434 4630 -413Q4623 -392 4617 -378ZM5219 0V-688H5815Q5892 -688 5944 -656Q5995 -624 6021 -572Q6047 -520 6047 -460Q6047 -391 6016 -338Q5986 -284 5927 -252L6063 0H5784L5680 -215H5466V0ZM5466 -386H5728Q5756 -386 5775 -404Q5794 -421 5794 -452Q5794 -473 5785 -488Q5776 -502 5762 -510Q5747 -517 5728 -517H5466Z";

type BrandLockupProps = {
  ariaLabel: string;
  /** "by Astroman", shown where the lockup signs off a page: the footer (ADR-052 §3). */
  endorsement?: string;
};

/** The comet mark beside the name, as the Skychaser site sets its own (ADR-052 §3). */
export function BrandLockup({ ariaLabel, endorsement }: BrandLockupProps) {
  return (
    <span className="brand-lockup" aria-label={ariaLabel}>
      <BrandMark className="brand-mark" />
      <span className="brand-wordmark" lang="en">
        <svg viewBox="43 -700 6020 712" aria-hidden="true" focusable="false">
          <path d={wordmarkPath} />
        </svg>
        <span className="visually-hidden">{brand.en.name}</span>
      </span>
      {endorsement && <span className="brand-endorsement">{endorsement}</span>}
    </span>
  );
}
