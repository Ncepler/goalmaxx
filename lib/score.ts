export interface ScoreInputs {
  tasksCompleted: number
  tasksPlanned: number
  waterMlDrunk: number
  waterTargetMl: number
  sleepHours: number
  workoutLoggedToday: boolean
  focusMinutes: number
  focusTargetMinutes: number
  tomorrowPlanFilled: boolean
}

export function computeDailyScore(inputs: ScoreInputs): number {
  const {
    tasksCompleted,
    tasksPlanned,
    waterMlDrunk,
    waterTargetMl,
    sleepHours,
    workoutLoggedToday,
    focusMinutes,
    focusTargetMinutes,
    tomorrowPlanFilled,
  } = inputs

  let totalWeight = 0
  let weightedSum = 0

  // Tasks — 30%
  if (tasksPlanned > 0) {
    weightedSum += 0.30 * Math.min(1, tasksCompleted / tasksPlanned)
    totalWeight += 0.30
  }

  // Water — 20%
  if (waterTargetMl > 0) {
    weightedSum += 0.20 * Math.min(1, waterMlDrunk / waterTargetMl)
    totalWeight += 0.20
  }

  // Sleep — 15%
  weightedSum += 0.15 * Math.min(1, sleepHours / 8)
  totalWeight += 0.15

  // Workout — 15%
  weightedSum += 0.15 * (workoutLoggedToday ? 1 : 0)
  totalWeight += 0.15

  // Focus — 10%
  if (focusTargetMinutes > 0) {
    weightedSum += 0.10 * Math.min(1, focusMinutes / focusTargetMinutes)
    totalWeight += 0.10
  }

  // Tomorrow plan — 10%
  weightedSum += 0.10 * (tomorrowPlanFilled ? 1 : 0)
  totalWeight += 0.10

  if (totalWeight === 0) return 0
  return Math.round((weightedSum / totalWeight) * 100)
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
