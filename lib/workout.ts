export function epley1RM(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30) * 10) / 10
}

export interface ProgressionDecision {
  decision: 'PROGRESS' | 'REPEAT' | 'FIRST'
  targetWeight: number
  targetReps: number
  tip: string
}

export function getProgression(
  lastWeight: number | null,
  lastReps: number | null,
  repRangeLow: number,
  repRangeHigh: number,
  weightIncrement: number,
  isCompound: boolean,
): ProgressionDecision {
  if (lastWeight === null || lastReps === null) {
    return {
      decision: 'FIRST',
      targetWeight: 20,
      targetReps: repRangeLow,
      tip: 'First session. Start with a manageable weight.',
    }
  }

  if (lastReps >= repRangeHigh) {
    const newWeight = lastWeight + weightIncrement
    return {
      decision: 'PROGRESS',
      targetWeight: newWeight,
      targetReps: repRangeLow,
      tip: `Hit ${lastReps} reps at ${lastWeight}kg — time to progress. Add ${weightIncrement}kg, reset to ${repRangeLow} reps.`,
    }
  }

  if (lastReps >= repRangeLow) {
    return {
      decision: 'PROGRESS',
      targetWeight: lastWeight,
      targetReps: lastReps + 1,
      tip: `${lastReps} reps at ${lastWeight}kg. Push for ${lastReps + 1} reps this session.`,
    }
  }

  return {
    decision: 'REPEAT',
    targetWeight: lastWeight,
    targetReps: repRangeLow,
    tip: `${lastReps} reps short of the ${repRangeLow}–${repRangeHigh} range. Repeat ${lastWeight}kg until you hit ${repRangeLow}+ clean.`,
  }
}
