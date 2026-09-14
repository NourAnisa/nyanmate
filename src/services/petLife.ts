export type PetIdleActivity = 'rest' | 'look-around' | 'groom' | 'stretch' | 'doze'

export interface PetLifeSnapshot {
  activity: PetIdleActivity
  inactiveMs: number
  asleep: boolean
}

const activityCycle: PetIdleActivity[] = ['rest', 'look-around', 'rest', 'groom', 'rest', 'stretch']

export function chooseIdleActivity(inactiveMs: number, cycleIndex: number, sleepAfterMs: number): PetLifeSnapshot {
  const safeInactive = Math.max(0, inactiveMs)
  if (safeInactive >= sleepAfterMs) return { activity: 'doze', inactiveMs: safeInactive, asleep: true }
  if (safeInactive < 15_000) return { activity: 'rest', inactiveMs: safeInactive, asleep: false }
  return {
    activity: activityCycle[Math.abs(cycleIndex) % activityCycle.length],
    inactiveMs: safeInactive,
    asleep: false,
  }
}

export function activityLabel(activity: PetIdleActivity) {
  const labels: Record<PetIdleActivity, string> = {
    rest: 'relaxing',
    'look-around': 'looking around',
    groom: 'grooming',
    stretch: 'stretching',
    doze: 'napping',
  }
  return labels[activity]
}
