const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function NewsCard({ article, compact = false }) {
  const date = formatDate(article.publishedAt || article.fetchedAt);

  return (
    <article className="card card-hover p-5 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {(article.domains || []).map((domain) => (
          <span key={domain} className="chip text-xs">{domain}</span>
        ))}
        {date && <span className="chip chip-neutral text-xs">{date}</span>}
      </div>

      <h3 className="font-sans font-medium text-xl text-zinc-900 tracking-tight">
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {article.title}
        </a>
      </h3>

      <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
        {article.source}{article.author ? ` · ${article.author}` : ''}
      </p>

      {article.summary && (
        <p className={`text-sm leading-relaxed text-muted ${compact ? 'line-clamp-3' : ''}`}>{article.summary}</p>
      )}

      {!compact && article.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span key={tag} className="chip chip-neutral text-xs">{tag}</span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-1">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline text-xs px-4 py-2 inline-block"
        >
          Read article →
        </a>
      </div>
    </article>
  );
}
