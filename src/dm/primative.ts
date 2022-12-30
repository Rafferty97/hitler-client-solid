import { z } from 'zod'

export function nonzeroInt() {
  return z.number().int().min(0)
}
