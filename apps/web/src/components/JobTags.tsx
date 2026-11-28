import type { JobData } from '@devjobs/shared'
import { getLabel, LEVEL_OPTIONS, MODALITY_OPTIONS } from '../constants/filters'
import styles from './JobTags.module.css'

export function JobTags({ data }: { data: JobData }) {
  return (
    <ul className={styles.tags} aria-label="Etiquetas">
      <li className={styles.highlight}>{getLabel(LEVEL_OPTIONS, data.level)}</li>
      <li className={styles.highlight}>{getLabel(MODALITY_OPTIONS, data.modality)}</li>
      {data.technology.map((technology) => (
        <li key={technology}>{technology}</li>
      ))}
    </ul>
  )
}
