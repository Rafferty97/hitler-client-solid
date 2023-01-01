export function validateGameId(gameId: string | undefined): string | undefined {
  if (gameId == null) return undefined
  gameId = gameId.trim().toUpperCase()
  return gameId.match(/^[a-z]{4}$/i) ? gameId : undefined
}

export function validateName(name: string | undefined): string | undefined {
  if (name == null) return undefined
  name = name.trim().toUpperCase()
  return name.match(/^[a-z ]+$/i) ? name : undefined
}

export function validateGameIdAndName(
  gameId: string | undefined,
  name: string | undefined
) {
  gameId = validateGameId(gameId ?? '')
  name = validateName(name ?? '')
  return gameId != null && name != null ? { gameId, name } : undefined
}
