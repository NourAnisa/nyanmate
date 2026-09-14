export type PetPersonality = 'gentle' | 'playful' | 'focused' | 'sleepy'
export type PetAccessory = 'scarf' | 'bell' | 'bow' | 'none'
export type PetMotionLevel = 'low' | 'normal' | 'high'

export interface PetSettings {
  name: string
  personality: PetPersonality
  accessory: PetAccessory
  motionLevel: PetMotionLevel
  sleepAfterMinutes: number
  autonomousMovement: boolean
}

const STORAGE_KEY = 'nyanmate-pet-settings-v1'

export const defaultPetSettings: PetSettings = {
  name: 'NyanMate',
  personality: 'gentle',
  accessory: 'scarf',
  motionLevel: 'normal',
  sleepAfterMinutes: 3,
  autonomousMovement: true,
}

export const personalityLabels: Record<PetPersonality, string> = {
  gentle: 'Gentle',
  playful: 'Playful',
  focused: 'Focused',
  sleepy: 'Sleepy',
}

export function normalizePetSettings(value?: Partial<PetSettings> | null): PetSettings {
  const personality: PetPersonality[] = ['gentle', 'playful', 'focused', 'sleepy']
  const accessory: PetAccessory[] = ['scarf', 'bell', 'bow', 'none']
  const motionLevel: PetMotionLevel[] = ['low', 'normal', 'high']
  return {
    name: (value?.name || defaultPetSettings.name).trim().slice(0, 24) || defaultPetSettings.name,
    personality: personality.includes(value?.personality as PetPersonality) ? value!.personality as PetPersonality : defaultPetSettings.personality,
    accessory: accessory.includes(value?.accessory as PetAccessory) ? value!.accessory as PetAccessory : defaultPetSettings.accessory,
    motionLevel: motionLevel.includes(value?.motionLevel as PetMotionLevel) ? value!.motionLevel as PetMotionLevel : defaultPetSettings.motionLevel,
    sleepAfterMinutes: Math.max(1, Math.min(60, Math.round(value?.sleepAfterMinutes || defaultPetSettings.sleepAfterMinutes))),
    autonomousMovement: value?.autonomousMovement ?? defaultPetSettings.autonomousMovement,
  }
}

export function loadPetSettings(): PetSettings {
  try { return normalizePetSettings(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')) } catch { return { ...defaultPetSettings } }
}

export function savePetSettings(settings: PetSettings) {
  const normalized = normalizePetSettings(settings)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  window.dispatchEvent(new CustomEvent('nyanmate-pet-settings-changed', { detail: normalized }))
  return normalized
}

export function personalitySleepMultiplier(personality: PetPersonality) {
  if (personality === 'sleepy') return 0.65
  if (personality === 'playful') return 1.35
  if (personality === 'focused') return 1.15
  return 1
}

export function personalityMotionMultiplier(personality: PetPersonality) {
  if (personality === 'playful') return 1.35
  if (personality === 'focused') return 0.6
  if (personality === 'sleepy') return 0.45
  return 1
}

export function motionMultiplier(level: PetMotionLevel) {
  return level === 'low' ? 0.55 : level === 'high' ? 1.35 : 1
}
