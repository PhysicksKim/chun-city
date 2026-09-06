import httpClient from './httpClient';
import { ensureArray, ensureObject } from './validators';
import {
  AvailableLeagueResponse,
  FixtureByLeagueResponse,
  FixtureDatesByLeagueResponse,
  FixtureEventsResponse,
  FixtureInfoResponse,
  FixtureLineupResponse,
  FixtureLiveStatusResponse,
  FixtureStatisticsResponse,
} from '../types/api';

export type FixtureMode = 'previous' | 'exact' | 'nearest';

export interface FetchFixturesParams {
  leagueUid: string;
  date?: string;
  mode?: FixtureMode;
  timezone?: string;
  isSilent?: boolean;
}

export interface FetchFixtureDatesParams {
  leagueUid: string;
  startDate: string;
  endDate: string;
  timezone?: string;
}

export const fetchAvailableLeagues = async () => {
  const { data } = await httpClient.get<AvailableLeagueResponse[]>(
    '/v1/football/leagues/available'
  );
  return ensureArray<AvailableLeagueResponse>(data, 'leagues');
};

export const fetchFixturesByLeague = async ({
  leagueUid,
  date,
  mode,
  timezone,
}: FetchFixturesParams) => {
  const { data } = await httpClient.get<FixtureByLeagueResponse[]>(
    `/v1/football/leagues/${leagueUid}/fixtures`,
    {
      params: {
        date,
        mode,
        timezone,
      },
    }
  );
  return ensureArray<FixtureByLeagueResponse>(data, 'fixtures');
};

export const fetchFixtureDatesByLeague = async ({
  leagueUid,
  startDate,
  endDate,
  timezone,
}: FetchFixtureDatesParams) => {
  const { data } = await httpClient.get<FixtureDatesByLeagueResponse>(
    `/v1/football/leagues/${leagueUid}/fixtures/dates`,
    { params: { startDate, endDate, timezone } }
  );
  return ensureObject<FixtureDatesByLeagueResponse>(data, 'fixture dates');
};

export const fetchFixtureInfo = async (fixtureUid: string) => {
  const { data } = await httpClient.get<FixtureInfoResponse>(
    `/v1/football/fixtures/${fixtureUid}/info`
  );
  return ensureObject<FixtureInfoResponse>(data, 'fixture info');
};

export const fetchFixtureLiveStatus = async (fixtureUid: string) => {
  const { data } = await httpClient.get<FixtureLiveStatusResponse>(
    `/v1/football/fixtures/${fixtureUid}/status`
  );
  return ensureObject<FixtureLiveStatusResponse>(data, 'fixture live status');
};

export const fetchFixtureLineup = async (fixtureUid: string) => {
  const { data } = await httpClient.get<FixtureLineupResponse>(
    `/v1/football/fixtures/${fixtureUid}/lineup`
  );
  return ensureObject<FixtureLineupResponse>(data, 'fixture lineup');
};

export const fetchFixtureEvents = async (fixtureUid: string) => {
  const { data } = await httpClient.get<FixtureEventsResponse>(
    `/v1/football/fixtures/${fixtureUid}/events`
  );
  return ensureObject<FixtureEventsResponse>(data, 'fixture events');
};

export const fetchFixtureStatistics = async (fixtureUid: string) => {
  const { data } = await httpClient.get<FixtureStatisticsResponse>(
    `/v1/football/fixtures/${fixtureUid}/statistics`
  );
  return ensureObject<FixtureStatisticsResponse>(data, 'fixture statistics');
};
