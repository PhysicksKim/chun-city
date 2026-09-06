import { TeamStatistics } from '@app/v1/types/api';

export const getPassAccuracy = (
  statistics: Pick<
    TeamStatistics,
    'passesAccuracyPercentage' | 'passesAccurate' | 'totalPasses'
  >
) => {
  const { passesAccuracyPercentage, passesAccurate = 0, totalPasses } =
    statistics;

  if (
    typeof passesAccuracyPercentage === 'number' &&
    Number.isFinite(passesAccuracyPercentage) &&
    passesAccuracyPercentage > 0
  ) {
    return passesAccuracyPercentage;
  }

  return totalPasses && totalPasses > 0
    ? Math.round((passesAccurate / totalPasses) * 100)
    : 0;
};
