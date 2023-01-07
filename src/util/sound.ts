export function sound(url: string, volume = 1, loop = false) {
  const audio = new Audio(url)
  audio.volume = volume
  audio.loop = loop
  return audio
}
