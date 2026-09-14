export type PetPersonality = 'gentle' | 'playful' | 'focused' | 'sleepy'
export type PetAccessory = 'scarf' | 'bell' | 'bow' | 'none'
export type PetMotionLevel = 'low' | 'normal' | 'high'
export type PetCharacter = 'momo' | 'kuro' | 'mikan' | 'yuki' | 'sora' | 'mocha' | 'sakura' | 'tora'

export interface PetSettings {
  name: string
  character: PetCharacter
  personality: PetPersonality
  accessory: PetAccessory
  motionLevel: PetMotionLevel
  sleepAfterMinutes: number
  autonomousMovement: boolean
}

const STORAGE_KEY = 'nyanmate-pet-settings-v1'

export const defaultPetSettings: PetSettings = { name:'NyanMate', character:'momo', personality:'gentle', accessory:'scarf', motionLevel:'normal', sleepAfterMinutes:3, autonomousMovement:true }
export const personalityLabels: Record<PetPersonality,string> = { gentle:'Gentle', playful:'Playful', focused:'Focused', sleepy:'Sleepy' }
export const characterLabels: Record<PetCharacter,string> = { momo:'Momo · Gray & White', kuro:'Kuro · Black', mikan:'Mikan · Orange Tabby', yuki:'Yuki · Snow White', sora:'Sora · Blue Gray', mocha:'Mocha · Brown', sakura:'Sakura · Cream', tora:'Tora · Tiger Tabby' }
export const petCharacters: PetCharacter[] = ['momo','kuro','mikan','yuki','sora','mocha','sakura','tora']

export function normalizePetSettings(value?: Partial<PetSettings>|null): PetSettings {
  const personality: PetPersonality[]=['gentle','playful','focused','sleepy'], accessory:PetAccessory[]=['scarf','bell','bow','none'], motionLevel:PetMotionLevel[]=['low','normal','high']
  return { name:(value?.name||defaultPetSettings.name).trim().slice(0,24)||defaultPetSettings.name, character:petCharacters.includes(value?.character as PetCharacter)?value!.character as PetCharacter:defaultPetSettings.character, personality:personality.includes(value?.personality as PetPersonality)?value!.personality as PetPersonality:defaultPetSettings.personality, accessory:accessory.includes(value?.accessory as PetAccessory)?value!.accessory as PetAccessory:defaultPetSettings.accessory, motionLevel:motionLevel.includes(value?.motionLevel as PetMotionLevel)?value!.motionLevel as PetMotionLevel:defaultPetSettings.motionLevel, sleepAfterMinutes:Math.max(1,Math.min(60,Math.round(value?.sleepAfterMinutes||defaultPetSettings.sleepAfterMinutes))), autonomousMovement:value?.autonomousMovement??defaultPetSettings.autonomousMovement }
}
export function loadPetSettings():PetSettings{try{return normalizePetSettings(JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'))}catch{return{...defaultPetSettings}}}
export function savePetSettings(settings:PetSettings){const normalized=normalizePetSettings(settings);localStorage.setItem(STORAGE_KEY,JSON.stringify(normalized));window.dispatchEvent(new CustomEvent('nyanmate-pet-settings-changed',{detail:normalized}));return normalized}
export function personalitySleepMultiplier(p:PetPersonality){return p==='sleepy'?.65:p==='playful'?1.35:p==='focused'?1.15:1}
export function personalityMotionMultiplier(p:PetPersonality){return p==='playful'?1.35:p==='focused'?.6:p==='sleepy'?.45:1}
export function motionMultiplier(level:PetMotionLevel){return level==='low'?.55:level==='high'?1.35:1}
