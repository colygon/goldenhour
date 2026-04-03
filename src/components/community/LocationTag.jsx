function timeAgo(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 60000);

  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff} min ago`;
  const hrs = Math.floor(diff / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return 'yesterday';
}

export default function LocationTag({ locationName, createdAt }) {
  return (
    <p className="text-xs mt-2 truncate" style={{ color: 'var(--subtle-foreground)' }}>
      {locationName && (
        <>
          <span>{locationName}</span>
          <span className="mx-1">·</span>
        </>
      )}
      <span>{timeAgo(createdAt)}</span>
    </p>
  );
}
