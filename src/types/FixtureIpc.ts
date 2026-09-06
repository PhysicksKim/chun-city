export interface League {
  id: number;
  name: string;
  logo: string;
}

export interface Team {
  id: number;
  name: string;
  logo: string;
}

export type EventType = 'GOAL' | 'CARD' | 'SUBST' | 'VAR' | string;

export interface EventTeam {
  teamId: number;
  name: string;
}

export interface EventPlayer {
  playerId: number;
  name: string;
  number: number;
  tempId: string | null;
}

export interface FixtureEvent {
  sequence: number;
  elapsed: number;
  extraTime: number;
  team: EventTeam;
  player: EventPlayer | null;
  assist: EventPlayer | null;
  type: EventType;
  detail: string;
  comments: string | null;
}

export type SubstPlayer = 'player' | 'assist';

export type SubstMeta = {
  inPlayer: SubstPlayer;
  outPlayer: SubstPlayer;
  teamId: number;
};

export type FixtureEventMeta = {
  sequence: number;
  data: SubstMeta | null;
};

export interface FixtureEventState {
  fixtureId: number;
  events: FixtureEvent[];
  meta: FixtureEventMeta[];
}

export type EventMeta =
  | {
      type: 'subst';
      inPlayer: EventPlayer;
      outPlayer: EventPlayer;
      isAssistIn: boolean;
    }
  | { type: 'card'; cardType: 'yellow' | 'red'; player: EventPlayer }
  | { type: 'goal'; scorer: EventPlayer; assist?: EventPlayer }
  | { type: 'var'; decision: string; player?: EventPlayer };

export interface FixtureLiveStatus {
  fixtureId: number;
  liveStatus: LiveStatus;
}

export interface LiveStatus {
  elapsed: number;
  shortStatus: string;
  longStatus: string;
  score: {
    home: number;
    away: number;
  };
}

export interface FixtureInfo {
  fixtureId: number;
  referee: string;
  date: string;
  league: League;
  home: Team;
  away: Team;
}

/**
 * 원본 라인업(FixtureLineup)
 * - API에서 전달받은 경기 라인업의 원형 데이터입니다.
 * - 포메이션/선수 배치 등 기본 정보만 포함하며, 이벤트/통계는 적용되지 않습니다.
 * - 화면 표시는 보통 `ProcessedLineup`(가공 라인업)을 사용하고,
 *   이 타입은 레이아웃 계산이나 가공의 입력으로 사용됩니다.
 */
export interface FixtureLineup {
  fixtureId: number;
  lineup: TeamLineups;
}

export interface TeamLineups {
  home: LineupTeam;
  away: LineupTeam;
}

export interface LineupTeam {
  teamId: number;
  teamName: string;
  formation: string;
  players: LineupPlayer[];
  substitutes: LineupPlayer[];
}

export interface LineupPlayer {
  id: number;
  name: string;
  number: number;
  photo: string;
  position: string;
  grid: string;
  substitute: boolean;
  tempId: string | null;
}

export interface ViewPlayer {
  id: number;
  name: string;
  number: number;
  photo: string;
  position: string;
  grid: string | null;
  tempId: string | null;
  events: ViewPlayerEvents;
  statistics: PlayerStatisticsResponse | null;
  /**
   * 교체된 선수가 있을 경우 객체가 들어가며, 교체 선수가 다시 교체된 경우가 있을 수 있으므로 재귀적으로 검사해야 함
   */
  subInPlayer?: ViewPlayer | null;
}

export interface ViewPlayerEvents {
  subIn: boolean;
  yellow: boolean;
  red: boolean;
  goal: Goal[];
}

export interface Goal {
  minute: number;
  ownGoal: boolean;
}

export interface ViewLineup {
  teamId: number;
  teamName: string;
  players: ViewPlayer[][];
  substitutes: ViewPlayer[];
}

export interface FixtureStatistics {
  fixtureId: number;
  home: {
    team: Team;
    teamStatistics: TeamStatistics;
    playerStatistics: PlayerStatisticsResponse[];
  };
  away: {
    team: Team;
    teamStatistics: TeamStatistics;
    playerStatistics: PlayerStatisticsResponse[];
  };
}

export interface TeamStatistics {
  shotsOnGoal: number;
  shotsOffGoal: number;
  totalShots: number;
  blockedShots: number;
  shotsInsideBox: number;
  shotsOutsideBox: number;
  fouls: number;
  cornerKicks: number;
  offsides: number;
  ballPossession: number;
  yellowCards: number;
  redCards: number;
  goalkeeperSaves: number;
  totalPasses: number;
  passesAccurate: number;
  passesAccuracyPercentage: number;
  goalsPrevented: number;
  xg: XG[];
}

export interface XG {
  elapsed: number;
  xg: string;
}

export interface PlayerBasicInfo {
  id: number;
  name: string;
  photo: string;
  number: number;
  position: string;
  tempId: string | null;
}

export interface PlayerStatistics {
  minutesPlayed: number;
  position: string;
  rating: string;
  captain: boolean;
  substitute: boolean;
  shotsTotal: number;
  shotsOn: number;
  goals: number;
  goalsConceded: number;
  assists: number;
  saves: number;
  passesTotal: number;
  passesKey: number;
  passesAccuracy: number;
  tacklesTotal: number;
  interceptions: number;
  duelsTotal: number;
  duelsWon: number;
  dribblesAttempts: number;
  dribblesSuccess: number;
  foulsCommitted: number;
  foulsDrawn: number;
  yellowCards: number;
  redCards: number;
  penaltiesScored: number;
  penaltiesMissed: number;
  penaltiesSaved: number;
}

export interface PlayerStatisticsResponse {
  player: PlayerBasicInfo;
  statistics: PlayerStatistics;
}
