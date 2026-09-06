import { describe, expect, it } from 'vitest';
import { isValidRating } from '../src/renderer/pages/matchlive/components/tabs/lineup/RatingUtils';

describe('isValidRating', () => {
  it.each(['0', '0.0', '-1', '', 'N/A', '6.5abc'])(
    'rejects %j',
    (rating) => {
      expect(isValidRating(rating)).toBe(false);
    }
  );

  it('accepts a positive numeric rating', () => {
    expect(isValidRating('6.5')).toBe(true);
  });
});
