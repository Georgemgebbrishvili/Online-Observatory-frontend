import { TargetQuality } from "@/components/astronomy/target-quality";
import { ButtonLink } from "@/components/ui/button";
import type { HomepageTarget } from "@/features/targets/homepage-data";
import type { HomepageDictionary } from "@/types/homepage";

type TargetCardProps = {
  target: HomepageTarget;
  content: HomepageDictionary["tonight"]["targets"][HomepageTarget["id"]];
  common: HomepageDictionary["common"];
};

export function TargetCard({ common, content, target }: TargetCardProps) {
  return (
    <article className="target-card">
      <div className={`target-visual target-visual-${target.visual}`} aria-hidden="true">
        <span />
      </div>
      {/* CLAUDE.md: never present an illustration as telescope output. */}
      <p className="target-visual-note">{common.illustration}</p>
      <div className="target-card-body">
        <header>
          <div>
            <p>{content.type}</p>
            <h3>{content.name}</h3>
          </div>
          <TargetQuality
            quality={target.quality}
            label={common.qualities[target.quality]}
          />
        </header>
        <dl>
          <div>
            <dt>{common.status}</dt>
            <dd>{content.visibility}</dd>
          </div>
          <div>
            <dt>{common.bestTime}</dt>
            <dd>{content.bestTime}</dd>
          </div>
          <div>
            <dt>{common.duration}</dt>
            <dd>
              {target.durationMinutes} {common.minutes}
            </dd>
          </div>
        </dl>
        <ButtonLink href="#final-cta" variant="secondary" size="small">
          {common.planMission}
        </ButtonLink>
      </div>
    </article>
  );
}
