import { describe, expect, it } from 'vitest';
import { getPassAccuracy } from '../src/renderer/pages/app/components/processing/ViewStatisticsLogic';

describe('getPassAccuracy', () => {
  it.each([0, 0.0, -1])(
    'calculates from passes when the supplied percentage is %s',
    (passesAccuracyPercentage) => {
      expect(
        getPassAccuracy({
          passesAccuracyPercentage,
          totalPasses: 427,
          passesAccurate: 356,
        })
      ).toBe(83);
    }
  );

  it('keeps a positive supplied percentage', () => {
    expect(
      getPassAccuracy({
        passesAccuracyPercentage: 88,
        totalPasses: 523,
        passesAccurate: 462,
      })
    ).toBe(88);
  });
});
