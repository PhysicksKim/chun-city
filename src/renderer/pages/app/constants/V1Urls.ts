/**
 * V1 API URL 관리
 *
 * 환경변수 설정:
 * - 개발: VITE_API_URL=http://localhost:8083/api (로컬호스트는 /api 필요)
 * - 프로덕션: VITE_API_URL=https://api.footballay.com (서브도메인 방식, /api 불필요)
 *
 * 사용 예시:
 * - V1Urls.getApiUrl(V1Urls.api.leaguesAvailable)
 * - V1Urls.api.fixturesOfLeague('league-uid')
 */
const apiUrl = import.meta.env.VITE_API_URL;

/**
 * API 경로를 완전한 URL로 변환하는 헬퍼 함수
 * @param path - API 경로 (예: '/v1/football/leagues/available')
 * @returns 완전한 API URL
 */
const getApiUrl = (path: string): string => {
  // apiUrl이 이미 /api를 포함하고 있거나 서브도메인인 경우를 처리
  // path가 이미 /로 시작하므로 단순 연결
  return `${apiUrl}${path}`;
};

export const V1Urls = {
  domainUrl: import.meta.env.VITE_DOMAIN_URL,
  websocketUrl: import.meta.env.VITE_WEBSOCKET_URL,
  apiUrl,
  /**
   * API 경로를 완전한 URL로 변환
   * @param path - API 경로
   * @returns 완전한 API URL
   */
  getApiUrl,
  api: {
    /**
     * 리그 목록 조회
     * @returns 완전한 API URL
     */
    leaguesAvailable: () => getApiUrl('/v1/football/leagues/available'),
    /**
     * 특정 리그의 경기 목록 조회
     * @param leagueUid - 리그 UID
     * @returns 완전한 API URL
     */
    fixturesOfLeague: (leagueUid: string) =>
      getApiUrl(`/v1/football/${leagueUid}/fixtures`),
    /**
     * 특정 리그의 경기 보유 날짜 조회
     * @param leagueUid - 리그 UID
     * @returns 완전한 API URL
     */
    fixtureDatesByLeague: (leagueUid: string) =>
      getApiUrl(`/v1/football/leagues/${leagueUid}/fixtures/dates`),
    /**
     * 경기 정보 조회
     * @param fixtureUid - 경기 UID
     * @returns 완전한 API URL
     */
    fixtureInfo: (fixtureUid: string) =>
      getApiUrl(`/v1/football/fixtures/${fixtureUid}/info`),
    /**
     * 경기 상태 조회
     * @param fixtureUid - 경기 UID
     * @returns 완전한 API URL
     */
    fixtureStatus: (fixtureUid: string) =>
      getApiUrl(`/v1/football/fixtures/${fixtureUid}/status`),
    /**
     * 경기 라인업 조회
     * @param fixtureUid - 경기 UID
     * @returns 완전한 API URL
     */
    fixtureLineup: (fixtureUid: string) =>
      getApiUrl(`/v1/football/fixtures/${fixtureUid}/lineup`),
    /**
     * 경기 이벤트 조회
     * @param fixtureUid - 경기 UID
     * @returns 완전한 API URL
     */
    fixtureEvents: (fixtureUid: string) =>
      getApiUrl(`/v1/football/fixtures/${fixtureUid}/events`),
    /**
     * 경기 통계 조회
     * @param fixtureUid - 경기 UID
     * @returns 완전한 API URL
     */
    fixtureStatistics: (fixtureUid: string) =>
      getApiUrl(`/v1/football/fixtures/${fixtureUid}/statistics`),
  },
};
