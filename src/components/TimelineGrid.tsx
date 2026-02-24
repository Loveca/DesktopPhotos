interface TimelineGridProps {
  groups: TimelineGroup[];
}

export function TimelineGrid({ groups }: TimelineGridProps) {
  return (
    <div className="timeline">
      {groups.map((group) => (
        <section className="timeline-section" key={group.date}>
          <h2>{group.date}</h2>
          <div className="photo-grid">
            {group.items.map((item) => (
              <article className="photo-card" key={item.filePath} title={item.filePath}>
                <img src={`file://${item.filePath}`} alt={item.filePath} loading="lazy" />
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
