// A 14-day bar strip, tallest bar = the busiest day in the window.
export default function ActivityStrip({ days }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div className="activity-strip">
      {days.map((d) => (
        <div
          key={d.date}
          className={`activity-bar${d.count > 0 ? " active" : ""}`}
          style={{ height: `${8 + (d.count / max) * 32}px` }}
          title={`${d.date}: ${d.count} action${d.count === 1 ? "" : "s"}`}
        />
      ))}
    </div>
  );
}