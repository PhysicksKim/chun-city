import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { parseISO, format } from 'date-fns';

import { RootState, useAppDispatch } from '@app/store/store';
import { loadV1Leagues, resetLeaguesStatus } from '@app/v1/store/leaguesSlice';
import { appEnv } from '@app/config/environment';
import {
  clearFixtures,
  loadV1Fixtures,
  setSelectedLeague,
} from '@app/v1/store/fixturesSlice';
import { selectTimezone } from '@app/store/slices/settings/v1PreferencesSlice';
import { FixtureMode } from '@app/v1/api/endpoints';
import {
  DEFAULT_TIMEZONE,
  getTodayDateString,
  isValidDateInput,
} from '@app/v1/utils/date';
import { createV1DataController } from '@app/v1/services/v1DataController';

import LeagueSelector from './LeagueSelector';
import FixtureList from './FixtureList';

const FixtureSelectTab = () => {
  const dispatch = useAppDispatch();
  const leagues = useSelector((state: RootState) => state.v1.leagues.items);
  const leaguesStatus = useSelector(
    (state: RootState) => state.v1.leagues.status
  );
  const fixtures = useSelector((state: RootState) => state.v1.fixtures.items);
  const fixturesStatus = useSelector(
    (state: RootState) => state.v1.fixtures.status
  );
  const selectedLeague = useSelector(
    (state: RootState) => state.v1.fixtures.selectedLeagueUid
  );
  const lastRequest = useSelector(
    (state: RootState) => state.v1.fixtures.lastRequest
  );
  const cfAccessStatus = useSelector(
    (state: RootState) => state.cfAccess.status
  );

  const timezonePreference = useSelector(selectTimezone);
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    getTodayDateString(timezonePreference || DEFAULT_TIMEZONE)
  );

  const [requestTimezone, setRequestTimezone] = useState<string>(
    timezonePreference || DEFAULT_TIMEZONE
  );

  const dataControllerRef = useRef<ReturnType<typeof createV1DataController>>();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // dev 환경에서는 CF Access 토큰 로드 완료 후에만 리그 조회
    const canLoadLeagues = appEnv !== 'dev' || cfAccessStatus !== 'loading';

    if (leaguesStatus === 'idle' && canLoadLeagues) {
      dispatch(loadV1Leagues());
    }
  }, [leaguesStatus, cfAccessStatus, dispatch]);

  useEffect(() => {
    setRequestTimezone(timezonePreference || DEFAULT_TIMEZONE);
    setSelectedDate((prev) =>
      prev && isValidDateInput(prev)
        ? prev
        : getTodayDateString(timezonePreference || DEFAULT_TIMEZONE)
    );
  }, [timezonePreference]);

  useEffect(() => {
    if (!dataControllerRef.current) {
      dataControllerRef.current = createV1DataController(dispatch);
      dataControllerRef.current.start();
    }
    // V1DataController는 singleton이며, 경기 선택 상태와 무관하게 계속 실행되어야 합니다.
    // 따라서 cleanup에서 stop()을 호출하지 않습니다.
    // 탭 전환으로 인해 컴포넌트가 언마운트되어도 polling은 계속되어야 합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  /**
   * 조회된 경기 데이터가 업데이트되면 해당 경기의 날짜로 UI 날짜를 동기화합니다.
   */
  useEffect(() => {
    if (fixtures.length > 0) {
      const firstFixture = fixtures[0];
      const kickoff = firstFixture.kickoff;
      if (kickoff) {
        try {
          const fixtureDate = parseISO(kickoff);
          const dateStr = format(fixtureDate, 'yyyy-MM-dd');
          if (dateStr !== selectedDate && isValidDateInput(dateStr)) {
            setSelectedDate(dateStr);
          }
        } catch (e) {
          console.error('경기 날짜 파싱 오류', e);
        }
      }
    }
  }, [fixtures, selectedDate]);

  /**
   * 경기 목록이 있고 리그가 선택되어 있으면 해당 날짜를 exact 모드로 1분마다 polling합니다.
   * 경기 상태(스코어, 경과시간, available 등)를 자동 업데이트하기 위함입니다.
   */
  useEffect(() => {
    // 기존 polling이 있으면 중지
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // polling 시작 조건 확인
    const shouldStartPolling =
      fixtures.length > 0 && selectedLeague && lastRequest;

    if (shouldStartPolling) {
      const pollingDate = selectedDate;
      const pollingLeagueUid = selectedLeague;
      const pollingTimezone = lastRequest.timezone;

      // 1분(60000ms)마다 exact 모드로 경기 목록을 다시 조회
      pollingIntervalRef.current = setInterval(() => {
        const timezone =
          requestTimezone.trim() || timezonePreference || DEFAULT_TIMEZONE;
        dispatch(
          loadV1Fixtures({
            leagueUid: pollingLeagueUid,
            date: pollingDate,
            mode: 'exact',
            timezone: pollingTimezone || timezone,
            isSilent: true,
          })
        );
      }, 60000);
    }

    // cleanup: 컴포넌트 unmount 또는 조건 변경 시 polling 중지
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [
    fixtures.length,
    selectedLeague,
    lastRequest,
    dispatch,
    requestTimezone,
    timezonePreference,
    selectedDate,
  ]);

  const requestFixtures = (
    leagueUid: string,
    date: string,
    mode: FixtureMode
  ) => {
    const timezone =
      requestTimezone.trim() || timezonePreference || DEFAULT_TIMEZONE;

    dispatch(loadV1Fixtures({ leagueUid, date, mode, timezone }));
  };

  const handleSelectLeague = (leagueUid: string) => {
    dispatch(setSelectedLeague(leagueUid));
    requestFixtures(leagueUid, selectedDate, 'nearest');
  };

  const handleRefreshLeagues = () => {
    dispatch(resetLeaguesStatus());
    dispatch(loadV1Leagues());
  };

  /**
   * 날짜 변경 요청을 처리합니다.
   * 로컬 상태를 먼저 업데이트하지 않고 리덕스 액션만 디스패치하여
   * 실제 데이터 로드 완료 후 날짜 동기화가 이루어지도록 합니다.
   */
  const handleRequestFetch = (date: string, mode: FixtureMode) => {
    if (!selectedLeague) return;
    requestFixtures(selectedLeague, date, mode);
  };

  return (
    <Container>
      <LeagueSelector
        leagues={leagues}
        selectedLeagueUid={selectedLeague}
        onSelectLeague={handleSelectLeague}
        onRefresh={handleRefreshLeagues}
        loading={leaguesStatus === 'loading'}
      />
      <FixtureList
        fixtures={fixtures}
        leagueUid={selectedLeague}
        selectedDate={selectedDate}
        timezone={
          requestTimezone.trim() || timezonePreference || DEFAULT_TIMEZONE
        }
        loading={fixturesStatus === 'loading'}
        onRequestFetch={handleRequestFetch}
      />
    </Container>
  );
};

export default FixtureSelectTab;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  width: 100%;
  min-width: 0;
  height: 100%;
  box-sizing: border-box;
  color: white;
  overflow: hidden;
  padding-bottom: 20px;
`;
