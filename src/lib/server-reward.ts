/** Shape every XP-bearing response the same way so the client can call reward(). */
export function emitReward({ xpEarned = 0, newBadges = [] as string[] } = {}) {
  return { xpEarned, newBadges };
}
