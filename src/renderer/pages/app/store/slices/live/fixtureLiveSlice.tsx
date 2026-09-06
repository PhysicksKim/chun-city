import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  FixtureInfo,
  FixtureLiveStatus,
  FixtureLineup,
  FixtureEventState,
  FixtureEventMeta,
  FixtureStatistics,
} from '@src/types/FixtureIpc';
import {
  fetchFixtureInfo,
  fetchFixtureLiveStatus,
  fetchFixtureLineup,
  fetchFixtureEvents,
  fetchFixtureStatistics,
} from './fixtureLiveSliceThunk';

export interface FixtureState {
  fixtureId: number | null;
  info: FixtureInfo | null;
  liveStatus: FixtureLiveStatus | null;
  lineup: FixtureLineup | null;
  events: FixtureEventState | null;
  statistics: FixtureStatistics | null;
  taskState: {
    init: InitTaskState;
  };
  intervalIds: NodeJS.Timeout[]; // interval IDs 배열
  lastFetchedAt: string | null;
}

export interface InitTaskState {
  matchliveWindowReady: boolean;
  fixtureIdUpdated: boolean;
  fixtureLiveStateReset: boolean;
}

export const initialState: FixtureState = {
  fixtureId: null,
  info: null,
  liveStatus: null,
  lineup: null,
  events: null,
  statistics: null,
  taskState: {
    init: {
      matchliveWindowReady: false,
      fixtureIdUpdated: false,
      fixtureLiveStateReset: false,
    },
  },
  intervalIds: [],
  lastFetchedAt: null,
};

const resetFixtureLiveState = (state: FixtureState) => {
  state.info = null;
  state.liveStatus = null;
  state.lineup = null;
  state.events = null;
};

const resetTaskState = (state: FixtureState) => {
  state.taskState.init.matchliveWindowReady = false;
  state.taskState.init.fixtureIdUpdated = false;
  state.taskState.init.fixtureLiveStateReset = false;
};

const removeAllIntervals = (state: FixtureState) => {
  state.intervalIds.forEach((id) => clearInterval(id));
  state.intervalIds = [];
};

const updateLastFetchedAt = (state: FixtureState) => {
  state.lastFetchedAt = new Date().toISOString();
};

/**
 * 이벤트 정보를 담는 객체
 */
export interface SimpleLineupPlayer {
  id: number | null;
  subInPlayer: SimpleLineupPlayer | null;
  tempId: string | null;
}

export interface SimpleLineup {
  teamId: number;
  lineup: SimpleLineupPlayer[];
  substitutes: SimpleLineupPlayer[];
}

const fixtureLiveSlice = createSlice({
  name: 'fixtureLive',
  initialState,
  reducers: {
    setFixtureIdAndClearInterval(state, action: PayloadAction<number>) {
      state.fixtureId = action.payload;
      resetFixtureLiveState(state);
      removeAllIntervals(state);
      state.taskState.init.fixtureIdUpdated = true;
      state.taskState.init.fixtureLiveStateReset = true;
    },
    setMatchliveWindowReady(state, action: PayloadAction<boolean>) {
      state.taskState.init.matchliveWindowReady = action.payload;
    },
    resetInitTaskState(state) {
      state.taskState.init.matchliveWindowReady = false;
      state.taskState.init.fixtureIdUpdated = false;
      state.taskState.init.fixtureLiveStateReset = false;
    },
    addIntervalId(state, action: PayloadAction<NodeJS.Timeout>) {
      state.intervalIds.push(action.payload);
    },
    removeIntervalId(state, action: PayloadAction<NodeJS.Timeout>) {
      state.intervalIds = state.intervalIds.filter(
        (id) => id !== action.payload
      );
    },
    setEventMeta(state, action: PayloadAction<FixtureEventMeta[]>) {
      if (!state.events) {
        return;
      }

      // 이전 meta와 비교하여 실제 변경이 있는지 확인
      const currentMeta = state.events.meta;
      const newMeta = action.payload;

      // meta가 같은 길이이고 각 요소가 동일한지 확인
      if (currentMeta && currentMeta.length === newMeta.length) {
        const isEqual = currentMeta.every(
          (item, index) =>
            item.sequence === newMeta[index]?.sequence &&
            JSON.stringify(item.data) === JSON.stringify(newMeta[index]?.data)
        );

        if (isEqual) {
          return; // 변경사항이 없으면 업데이트하지 않음
        }
      }

      state.events.meta = action.payload;
    },
    clearAllIntervals(state) {
      removeAllIntervals(state);
    },
    clearFixtureLive(state) {
      state.fixtureId = null;
      resetFixtureLiveState(state);
      removeAllIntervals(state);
    },
    removeEvents(state) {
      state.events = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        fetchFixtureInfo.fulfilled,
        (state, action: PayloadAction<FixtureInfo>) => {
          state.info = action.payload;
          updateLastFetchedAt(state);
        }
      )
      .addCase(
        fetchFixtureLiveStatus.fulfilled,
        (state, action: PayloadAction<FixtureLiveStatus>) => {
          state.liveStatus = action.payload;
          updateLastFetchedAt(state);
        }
      )
      .addCase(
        fetchFixtureLineup.fulfilled,
        (state, action: PayloadAction<FixtureLineup>) => {
          state.lineup = action.payload;
          updateLastFetchedAt(state);
        }
      )
      .addCase(
        fetchFixtureEvents.fulfilled,
        (state, action: PayloadAction<FixtureEventState>) => {
          const sortedEvents = action.payload.events.sort(
            (a, b) => a.sequence - b.sequence
          );

          const processedEvents: FixtureEventState = {
            ...action.payload,
            events: sortedEvents,
          };
          state.events = processedEvents;
          updateLastFetchedAt(state);
        }
      )
      .addCase(
        fetchFixtureStatistics.fulfilled,
        (state, action: PayloadAction<FixtureStatistics>) => {
          // home이나 away가 null이면 빈 객체로 변환하여 null exception 방지
          const normalizedStatistics: FixtureStatistics = {
            ...action.payload,
            home: action.payload.home ?? {
              team: {
                id: 0,
                name: '',
                logo: '',
              },
              teamStatistics: {
                shotsOnGoal: 0,
                shotsOffGoal: 0,
                totalShots: 0,
                blockedShots: 0,
                shotsInsideBox: 0,
                shotsOutsideBox: 0,
                fouls: 0,
                cornerKicks: 0,
                offsides: 0,
                ballPossession: 0,
                yellowCards: 0,
                redCards: 0,
                goalkeeperSaves: 0,
                totalPasses: 0,
                passesAccurate: 0,
                passesAccuracyPercentage: 0,
                goalsPrevented: 0,
                xg: [],
              },
              playerStatistics: [],
            },
            away: action.payload.away ?? {
              team: {
                id: 0,
                name: '',
                logo: '',
              },
              teamStatistics: {
                shotsOnGoal: 0,
                shotsOffGoal: 0,
                totalShots: 0,
                blockedShots: 0,
                shotsInsideBox: 0,
                shotsOutsideBox: 0,
                fouls: 0,
                cornerKicks: 0,
                offsides: 0,
                ballPossession: 0,
                yellowCards: 0,
                redCards: 0,
                goalkeeperSaves: 0,
                totalPasses: 0,
                passesAccurate: 0,
                passesAccuracyPercentage: 0,
                goalsPrevented: 0,
                xg: [],
              },
              playerStatistics: [],
            },
          };
          state.statistics = normalizedStatistics;
          updateLastFetchedAt(state);
        }
      );
  },
});

export const {
  setFixtureIdAndClearInterval,
  addIntervalId,
  removeIntervalId,
  clearAllIntervals,
  setMatchliveWindowReady,
  resetInitTaskState,
  clearFixtureLive,
  setEventMeta,
  removeEvents,
} = fixtureLiveSlice.actions;
export default fixtureLiveSlice.reducer;
