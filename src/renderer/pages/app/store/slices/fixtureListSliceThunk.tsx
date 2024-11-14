import { createAsyncThunk } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';
import { ApiResponse } from '../../types/api';
import Urls from '../../constants/Urls';
import dateToYearMonthDay, {
  isoStringToYearMonthDay,
} from '@app/common/DateUtils';
import { decode } from 'html-entities';

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
  teamALogo: {
    name: string;
    logo: string;
    koreanName: string | null;
  };
  teamBLogo: {
    name: string;
    logo: string;
    koreanName: string | null;
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
          Urls.apiUrl + Urls.football.fixtures,
          {
            params: { leagueId },
          },
        );
      } else {
        const dateYMDstring = isoStringToYearMonthDay(date);
        response = await axios.get<ApiResponse<FixtureListItemResponse>>(
          Urls.apiUrl + Urls.football.fixturesOnDate,
          {
            params: { leagueId, date: dateYMDstring },
          },
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
        error.response ? error.response.data : error.message,
      );
    }
  },
);
export default fetchFixtureList;

const decodeHtmlEntities = (response: FixtureListItemResponse[]) => {
  response.forEach((fixture) => {
    fixture.teamALogo.name = decode(fixture?.teamALogo?.name);
    fixture.teamBLogo.name = decode(fixture?.teamBLogo?.name);
  });
};
