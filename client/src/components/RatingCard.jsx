import { useI18n } from '../i18n.js';
import { RATING_LEVELS } from '../reportData.js';

function Medal({ level }) {
  return (
    <svg className={`medal medal-${level}`} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path className="medal-ribbon" d="M15 3h7l4 14h-7zM33 3h-7l-4 14h7z" />
      <circle className="medal-disc" cx="24" cy="30" r="14" />
      <circle className="medal-ring" cx="24" cy="30" r="9.5" />
      {level === 'none' && <path className="medal-cross" d="M19.5 25.5l9 9M28.5 25.5l-9 9" />}
    </svg>
  );
}

/** Baseerah's provisional Bronze / Silver / Gold rating, with what it would take to reach the next level. */
export function RatingCard({ rating, failedPages }) {
  const { t, count, impact } = useI18n();
  const reached = RATING_LEVELS.indexOf(rating.level); // -1 when not rated
  const next = rating.next
    ? rating.next.impact
      ? t('ratingNextImpact', {
          issues: count(rating.next.issues, 'issue'),
          impact: impact(rating.next.impact).toLowerCase(),
          level: t(`rating_${rating.next.level}`),
        })
      : t('ratingNextAll', { issues: count(rating.next.issues, 'issue'), level: t(`rating_${rating.next.level}`) })
    : t('ratingTop');

  return (
    <section className={`rating rating-${rating.level}`} aria-labelledby="rating-title">
      <Medal level={rating.level} />
      <div className="rating-text">
        <h2 id="rating-title">
          <span className="rating-label">{t('ratingTitle')}</span>
          <span className="rating-level" data-testid="rating-level">
            {t(`rating_${rating.level}`)}
          </span>
        </h2>
        <p>
          {t(`ratingReason_${rating.level}`)} {next}
        </p>
        <p className="rating-note">
          {t('ratingNote')}
          {failedPages > 0 && ` ${t('ratingPartial')}`}
        </p>
      </div>
      <ol className="rating-ladder" aria-label={t('ratingLadder')}>
        {RATING_LEVELS.map((level, index) => (
          <li
            key={level}
            className={`step step-${level}${index <= reached ? ' is-reached' : ''}`}
            aria-current={level === rating.level ? 'true' : undefined}
          >
            <span className="step-dot" aria-hidden="true" />
            {t(`rating_${level}`)}
          </li>
        ))}
      </ol>
    </section>
  );
}
