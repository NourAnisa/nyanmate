export type PetMood = 'calm' | 'curious' | 'playful' | 'sleepy'

export interface PetMoodSnapshot {
  mood: PetMood
  energy: number
  affection: number
  roamX: number
  roamY: number
}

export interface PetMoodInput {
  inactiveMs: number
  recentPets: number
  cycleIndex: number
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export function buildPetMood(input: PetMoodInput): PetMoodSnapshot {
  const inactiveMinutes = Math.max(0, input.inactiveMs) / 60_000
  const affection = clamp(45 + input.recentPets * 9 - inactiveMinutes * 1.5, 0, 100)
  const energy = clamp(78 - inactiveMinutes * 13 + Math.min(18, input.recentPets * 3), 5, 100)

  let mood: PetMood = 'calm'
  if (inactiveMinutes >= 2.5) mood = 'sleepy'
  else if (input.recentPets >= 4) mood = 'playful'
  else if (input.cycleIndex % 4 === 1 || input.cycleIndex % 4 === 3) mood = 'curious'

  const roamPattern = [
    { x: 0, y: 0 },
    { x: -16, y: 2 },
    { x: 12, y: -3 },
    { x: 22, y: 1 },
    { x: -8, y: -4 },
  ]
  const point = roamPattern[Math.abs(input.cycleIndex) % roamPattern.length]
  const roamScale = mood === 'playful' ? 1.25 : mood === 'sleepy' ? 0.25 : 1

  return {
    mood,
    energy: Math.round(energy),
    affection: Math.round(affection),
    roamX: Math.round(point.x * roamScale),
    roamY: Math.round(point.y * roamScale),
  }
}

export function moodLabel(mood: PetMood) {
  return ({ calm: 'calm', curious: 'curious', playful: 'playful', sleepy: 'sleepy' } as Record<PetMood, string>)[mood]
}
