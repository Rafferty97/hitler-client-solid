export function chooseRandom<T>(items: T[]): T {
  return items[chooseIndex(items.length)]
}

export function chooseIndex(count: number): number {
  return Math.floor(count * Math.random())
}
