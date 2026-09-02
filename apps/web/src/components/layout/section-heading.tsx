type SectionHeadingProps = {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  id: string;
};

export function SectionHeading({
  description,
  eyebrow,
  id,
  index,
  title,
}: SectionHeadingProps) {
  return (
    <header className="home-section-heading">
      <span>{index}</span>
      <div>
        <p>{eyebrow}</p>
        <h2 id={id}>{title}</h2>
        <p className="home-section-description">{description}</p>
      </div>
    </header>
  );
}
