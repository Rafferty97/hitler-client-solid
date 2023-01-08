import { z } from 'zod'

export type ExecutiveAction = z.infer<typeof executiveAction>

export const executiveAction = z.enum([
  'InvestigatePlayer',
  'SpecialElection',
  'PolicyPeak',
  'Execution',
  'Bugging',
  'Radicalisation',
  'FiveYearPlan',
  'Congress',
  'Confession',
])
