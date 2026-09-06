import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState, useAppDispatch } from '@app/store/store';
import {
  addFilterEvent,
  removeFilterEvent,
} from '@app/store/slices/control/eventFilterSlice';
import FixtureEventList from './FixtureEventList';

import { EventInfo } from '@app/v1/types/api';
import '@app/styles/tabs/MatchliveControlTab.scss';

const MatchliveControlTab = () => {
  const dispatch = useAppDispatch();
  const info = useSelector((state: RootState) => state.v1.fixtureDetail.info);
  const liveStatus = useSelector(
    (state: RootState) => state.v1.fixtureDetail.liveStatus
  );
  const events = useSelector(
    (state: RootState) => state.v1.fixtureDetail.events
  );
  const filterEvents = useSelector(
    (state: RootState) => state.eventFilter.filterEvents
  );

  const isAlwaysOnTop = useSelector(
    (state: RootState) => state.windowInfo.matchliveAlwaysOnTop
  );

  const contentTabContainerRef = useRef<HTMLDivElement>(null);

  const parseKickoffTime = (dateString: string) => {
    const kickoffTime = new Date(dateString);
    const month = String(kickoffTime.getMonth() + 1).padStart(2, '0');
    const date = String(kickoffTime.getDate()).padStart(2, '0');
    const hour = String(kickoffTime.getHours()).padStart(2, '0');
    const minute = String(kickoffTime.getMinutes()).padStart(2, '0');
    return `${month}/${date} ${hour}:${minute}`;
  };

  /**
   *
   * @param dateString
   * @returns MM/DD HH:mm:ss 형식으로 변환
   */
  const parseLastFetchTimeString = (dateString: string) => {
    const lastFetchTime = new Date(dateString);
    const month = String(lastFetchTime.getMonth() + 1).padStart(2, '0');
    const date = String(lastFetchTime.getDate()).padStart(2, '0');
    const hour = String(lastFetchTime.getHours()).padStart(2, '0');
    const minute = String(lastFetchTime.getMinutes()).padStart(2, '0');
    const second = String(lastFetchTime.getSeconds()).padStart(2, '0');
    return `${month}/${date} ${hour}:${minute}:${second}`;
  };

  const isInfoReady =
    info &&
    info.fixtureUid &&
    info.league &&
    info.home &&
    info.away &&
    info.date;

  const reloadMatchlive = () => {
    window.electron.ipcRenderer.send('window-control', {
      window: 'matchlive',
      action: 'reload',
    });
  };

  const minimizeMatchlive = () => {
    window.electron.ipcRenderer.send('window-control', {
      window: 'matchlive',
      action: 'minimize',
    });
  };

  const closeMatchlive = () => {
    window.electron.ipcRenderer.send('window-control', {
      window: 'matchlive',
      action: 'close',
    });
  };

  const alwaysOnTopMatchlive = () => {
    window.electron.ipcRenderer.send('window-control', {
      window: 'matchlive',
      action: 'toggle:always-on-top',
    });
  };

  const handleAddFilter = (event: EventInfo) => {
    dispatch(addFilterEvent(event));
  };

  const handleRemoveFilter = (event: EventInfo) => {
    dispatch(removeFilterEvent(event));
  };

  const unfilteredEvents = events?.events.filter(
    (event: EventInfo) =>
      !filterEvents.some(
        (filterEvent: EventInfo) => filterEvent.sequence === event.sequence
      )
  );

  /**
   * matchlive window 의 사이즈를 초기화하고, 화면 중앙에 위치하도록 한다.
   */
  const resetMatchliveWindowSizeAndPosition = () => {
    window.electronStore.resetMatchliveWindowSizeAndPosition();
  };

  // 마지막 데이터 갱신 시각 계산 (현재 시간 사용)
  const lastFetchTime = liveStatus ? new Date().toISOString() : null;

  return (
    <div ref={contentTabContainerRef} className="matchlive-control-container">
      <div className="matchlive-control-title">
        <span>라이브 경기 정보</span>
      </div>
      <div className="match-info-section">
        {isInfoReady ? (
          <>
            <div className="league-info-box">
              <div className="league-info">
                <span>{info.league.koreanName || info.league.name}</span>
              </div>
            </div>
            <div className="fixture-info-box">
              <div className="home-team-box team-box">
                <div className="home-mark">홈</div>
                <div className="home-team-name team-name">
                  {info.home.koreanName || info.home.name}
                </div>
                <div className="home-team-logo team-logo">
                  {info.home.logo && (
                    <img src={info.home.logo} alt={'홈팀로고'} />
                  )}
                </div>
              </div>
              <div className="match-detail-box">
                <div className="match-status">
                  {liveStatus?.liveStatus.shortStatus || 'VS'}
                </div>
                <div className="match-date">{parseKickoffTime(info.date)}</div>
              </div>
              <div className="away-team-box team-box">
                <div className="away-team-logo team-logo">
                  {info.away.logo && (
                    <img src={info.away.logo} alt={'원정팀로고'} />
                  )}
                </div>
                <div className="away-team-name team-name">
                  {info.away.koreanName || info.away.name}
                </div>
                <div className="away-mark">
                  {/* 사이즈 맞추기 위한 빈 태그 */}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="fixture-not-selected">
              아직 경기가 선택되지 않았습니다.
            </div>
          </>
        )}
      </div>

      <div className="event-filter" style={{ width: '100%' }}>
        <FixtureEventList
          events={unfilteredEvents}
          isFiltered={false}
          handleEventClick={handleAddFilter}
        />
        <FixtureEventList
          events={filterEvents}
          isFiltered={true}
          handleEventClick={handleRemoveFilter}
        />
      </div>

      <div className="window-control-section-title">
        <span>팝업 창 컨트롤</span>
      </div>
      <div className="window-control-section">
        <button className="refresh-btn win-con-btn" onClick={reloadMatchlive}>
          새로고침
        </button>
        <button
          className="minimize-btn win-con-btn"
          onClick={minimizeMatchlive}
        >
          최소화
        </button>
        <button
          className="reset-window-btn win-con-btn"
          onClick={resetMatchliveWindowSizeAndPosition}
        >
          크기 초기화
        </button>
        <button
          className="always-on-top-btn win-con-btn"
          onClick={alwaysOnTopMatchlive}
        >
          {isAlwaysOnTop ? '항상 위 해제' : '항상 위로'}
        </button>
        <button className="close-btn win-con-btn" onClick={closeMatchlive}>
          닫기
        </button>
      </div>

      <div className="last-fetch-title-box">
        <span>데이터 갱신 시각</span>
      </div>
      <div className="last-fetch-time-box">
        <div
          className={`last-fetch-time ${lastFetchTime ? 'exist-last-fetch' : 'no-last-fetch'}`}
        >
          {lastFetchTime
            ? '마지막 데이터 갱신 : ' + parseLastFetchTimeString(lastFetchTime)
            : '경기가 선택되지 않았습니다.'}
        </div>
      </div>
    </div>
  );
};

export default MatchliveControlTab;
