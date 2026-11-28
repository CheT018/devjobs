import cardStyles from './JobCard.module.css'
import listStyles from './JobListings.module.css'
import styles from './Skeleton.module.css'

export function JobListingsSkeleton({ count, label }: { count: number; label: string }) {
  return (
    <div className={listStyles.listings} role="status">
      <span className={styles.visuallyHidden}>{label}</span>

      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={`${cardStyles.card} ${styles.card}`} aria-hidden="true">
          <div className={styles.cardContent}>
            <span className={styles.cardTitle} />
            <span className={styles.cardMeta} />
            <span className={styles.cardText} />
            <span className={styles.cardTextMobile} />
            <span className={styles.cardTextMobile} />
            <span className={styles.cardTextMobile} />
            <span className={styles.cardTextShort} />
            <span className={styles.cardTags}>
              <span className={styles.pill} />
              <span className={styles.pill} />
              <span className={styles.pill} />
            </span>
          </div>

          <div className={cardStyles.actions}>
            <span className={styles.cardLink} />
            <span className={styles.cardButton} />
            <span className={styles.cardIconButton} />
          </div>
        </div>
      ))}
    </div>
  )
}
