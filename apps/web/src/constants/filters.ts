import type { JobLevel } from '@devjobs/shared'

export const RESULTS_PER_PAGE = 4

interface Option<T extends string = string> {
  value: T
  label: string
}

export const TECHNOLOGY_OPTIONS: Option[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'react', label: 'React' },
  { value: 'node', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'sql', label: 'SQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'docker', label: 'Docker' },
  { value: 'kubernetes', label: 'Kubernetes' },
  { value: 'aws', label: 'AWS' },
  { value: 'terraform', label: 'Terraform' },
]

export const LOCATION_OPTIONS: string[] = [
  'Remoto',
  'Barcelona',
  'Bogotá',
  'Buenos Aires',
  'Ciudad de México',
  'Guadalajara',
  'Lima',
  'Madrid',
  'Monterrey',
  'Santiago de Chile',
  'Valencia',
]

export const LEVEL_OPTIONS: Option<JobLevel>[] = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' },
]
