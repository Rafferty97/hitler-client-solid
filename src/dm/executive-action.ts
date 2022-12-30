import { z } from 'zod'

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
