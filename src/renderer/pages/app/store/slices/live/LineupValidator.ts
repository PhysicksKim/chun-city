import { FixtureLineup, LineupPlayer } from '@src/types/FixtureIpc';

/**
 * lineup fetch interval 에서 모든 선수가 등록 선수(id 존재) 인지 확인합니다.
 * @param lineup
 */
const isCompleteLineupData = (fixtureLineup: FixtureLineup) => {
  const homeLineup = fixtureLineup?.lineup?.home;
  const awayLineup = fixtureLineup?.lineup?.away;
  const homeStartXI = homeLineup?.players;
  const awayStartXI = awayLineup?.players;
  const homeSubs = homeLineup?.substitutes;
  const awaySubs = awayLineup?.substitutes;

  if (
    !homeLineup ||
    !awayLineup ||
    !homeStartXI ||
    !awayStartXI ||
    !homeSubs ||
    !awaySubs
  ) {
    return false;
  }

  const lineups = [homeStartXI, awayStartXI, homeSubs, awaySubs];

  for (const lineup of lineups) {
    if (
      !(lineup.length > 0) ||
      !allPlayersAreRegistered(lineup)
    ) {
      return false;
    }
  }

  return true;
};

const allPlayersAreRegistered = (players: LineupPlayer[]) => {
  for (let i = 0; i < players.length; i++) {
    if (!players[i].id) {
      return false;
    }
  }
  return true;
};

export { isCompleteLineupData };
