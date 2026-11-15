const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Editorial story block. Lives inside a .story-list (stacked, hairline
// separators) or a .story-grid (columns with a top rule), not a boxed card.
export default function NewsCard({ article, compact = false }) {
  const date = formatDate(article.publishedAt || article.fetchedAt);
  const domains = article.domains || [];

  return (
    <article className="story flex flex-col gap-2.5">
      <p className="eyebrow">
        {domains.join(' · ') || 'Tech'}
      </p>

      <h3 className={`item-title ${compact ? '' : 'md:text-[1.5rem]'}`}>
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          {article.title}
        </a>
      </h3>

      {article.summary && (
        <p className={`body-text ${compact ? 'line-clamp-3' : 'max-w-3xl'}`}>{article.summary}</p>
      )}

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted mt-1">
        <span className="font-medium text-zinc-800">{article.source}</span>
        {article.author && !compact && <span className="line-clamp-1 max-w-md">· {article.author}</span>}
        {date && <span>· {date}</span>}
      </div>

      {!compact && article.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {article.tags.map((tag) => (
            <span key={tag} className="chip">{tag}</span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-2">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="link-accent text-sm"
        >
          Read the full article →
        </a>
      </div>
    </article>
  );
}
