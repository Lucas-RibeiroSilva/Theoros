export function buildCardSummarySelect() {
  return {
    id: true,
    name: true,
    image: true,
    history: true,
    ratingAverage: true,
    userId: true,
    race: {
      select: {
        id: true,
        name: true,
      },
    },
    user: {
      select: {
        id: true,
        username: true,
        image: true,
      },
    },
  };
}

export function buildFavoriteCardSelect() {
  return {
    id: true,
    name: true,
    image: true,
    history: true,
    ratingAverage: true,
    userId: true,
    race: {
      select: {
        id: true,
        name: true,
      },
    },
  };
}

export function buildRatingSummarySelect() {
  return {
    id: true,
    score: true,
    commentary: true,
    createdAt: true,
    user: {
      select: {
        id: true,
        username: true,
        image: true,
      },
    },
  };
}
