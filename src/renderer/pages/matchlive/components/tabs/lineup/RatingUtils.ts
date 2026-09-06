const getRatingColor = (floatRating: number | string) => {
  if (typeof floatRating === 'string') {
    floatRating = parseFloat(floatRating);
  }

  const ratingColor =
    floatRating > 7.9
      ? '#0026a1'
      : floatRating > 7.4
        ? '#07ad0f'
        : floatRating > 6.9
          ? '#28ac00'
          : floatRating > 6.4
            ? '#76a71b'
            : floatRating > 5.9
              ? '#96a00e'
              : floatRating > 5.4
                ? '#ad4b09'
                : '#860000';
  return ratingColor;
};

export const isValidRating = (rating?: string): rating is string => {
  if (!rating?.trim()) return false;

  const parsedRating = Number(rating);
  return Number.isFinite(parsedRating) && parsedRating > 0;
};

export default getRatingColor;
