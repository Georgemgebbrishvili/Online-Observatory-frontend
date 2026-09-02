import { OpticalRing } from "@/components/astronomy/optical-ring";
import { LiveIndicator } from "@/components/observatory/live-indicator";
import { ObservatoryStatus } from "@/components/observatory/observatory-status";
import type { HomepageDictionary } from "@/types/homepage";

type HeroObservatoryVisualProps = {
  content: HomepageDictionary["hero"];
  demoLabel: string;
};

export function HeroObservatoryVisual({
  content,
  demoLabel,
}: HeroObservatoryVisualProps) {
  return (
    <div className="hero-observatory" aria-label={content.visualLabel}>
      <header>
        <div>
          <span>{content.visualTitle}</span>
          <strong>{content.visualLocation}</strong>
        </div>
        <ObservatoryStatus status="ONLINE" label={content.visualStatus} />
      </header>

      <div className="hero-optics">
        <span className="hero-axis hero-axis-horizontal" aria-hidden="true" />
        <span className="hero-axis hero-axis-vertical" aria-hidden="true" />
        <OpticalRing size="large" active />
        <div className="hero-target-label">
          <LiveIndicator label={content.visualLive} />
          <strong>{content.visualTarget}</strong>
        </div>
      </div>

      <footer>
        <span>{content.visualOperation}</span>
        <span>{demoLabel}</span>
      </footer>
    </div>
  );
}
