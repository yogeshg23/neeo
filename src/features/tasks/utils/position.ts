export const POSITION_STEP = 1000;

export interface PositionUpdate {
  id: string;
  position: number;
}

export const getPositionBetween = (
  previousPosition?: number,
  nextPosition?: number,
): number | null => {
  if (previousPosition === undefined && nextPosition === undefined) {
    return POSITION_STEP;
  }

  if (previousPosition === undefined) {
    return nextPosition! / 2;
  }

  if (nextPosition === undefined) {
    return previousPosition + POSITION_STEP;
  }

  const position = (previousPosition + nextPosition) / 2;
  return position > previousPosition && position < nextPosition ? position : null;
};

export const getRebalancedPositions = (taskIds: string[]): PositionUpdate[] =>
  taskIds.map((id, index) => ({
    id,
    position: (index + 1) * POSITION_STEP,
  }));
