import { createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';
import { decode } from 'html-entities';

import { ApiResponse } from '@app/deprecated/v0/types/api';
import Urls from '@app/deprecated/v0/constants/Urls';
import { isoStringToYearMonthDay } from '@app/deprecated/v0/common/DateUtils';

export interface FetchFixtureListParams {
  leagueId: number;
  date: string;
}

export interface FixtureListItemResponse {
  fixtureId: number;
  matchSchedule: {
    kickoff: string;
    round: string;
  };
  teamA: {
    name: string;
    logo: string;
  };
  teamB: {
    name: string;
    logo: string;
  };
  status: {
    longStatus: string;
    shortStatus: string;
    elapsed: number | null;
    score: {
      home: number;
      away: number;
    };
  };
  available: boolean;
}

const fetchFixtureList = createAsyncThunk<
  ApiResponse<FixtureListItemResponse>,
  FetchFixtureListParams
>(
  'fixtureList/fetchFixtureList',
  async ({ leagueId, date }, { rejectWithValue }) => {
    try {
      let response: AxiosResponse<ApiResponse<FixtureListItemResponse>>;
      if (date === '' || date === '_' || date === null || date === undefined) {
        response = await axios.get<ApiResponse<FixtureListItemResponse>>(
          Urls.domainUrl + Urls.football.fixtures,
          {
            params: { leagueId },
          }
        );
      } else {
        const dateYMDstring = isoStringToYearMonthDay(date);
        response = await axios.get<ApiResponse<FixtureListItemResponse>>(
          Urls.domainUrl + Urls.football.fixturesOnDate,
          {
            params: { leagueId, date: dateYMDstring },
          }
        );
      }

      if (
        !response?.data?.response ||
        response.data.response === null ||
        response.data.metaData?.responseCode !== 200
      ) {
        if (response.data.metaData) {
          return rejectWithValue(response.data.metaData);
        }
        return rejectWithValue('No response data');
      }

      decodeHtmlEntities(response.data.response);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);
export default fetchFixtureList;

const decodeHtmlEntities = (response: FixtureListItemResponse[]) => {
  response.forEach((fixture) => {
    fixture.teamA.name = decode(fixture?.teamA?.name);
    fixture.teamB.name = decode(fixture?.teamB?.name);
  });
};
