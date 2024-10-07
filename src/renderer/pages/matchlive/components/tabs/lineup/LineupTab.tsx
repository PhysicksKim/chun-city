import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import FootballFieldCanvas from './FootballFieldCanvas';
import { TeamLineups, ViewPlayer } from '@src/types/FixtureIpc';
import { debounce } from 'lodash';
import {
  HomeMarker,
  LineupTabContainer,
  TeamContainer,
  TeamLogoName,
} from './LineupStyled';
import LineupView, {
  PlayerModalContentStyle,
  PlayerModalOverlayStyle,
} from './LineupView';
import { ViewLineup } from '@src/types/FixtureIpc';
import styled from 'styled-components';
import Modal from '../../common/Modal';

export interface LineupTabProps {
  applyEvents?: boolean;
}

const LineupTab: React.FC<LineupTabProps> = ({ applyEvents = true }) => {
  const lineup = useSelector(
    (state: RootState) => state.fixture.lineup,
  )?.lineup;
  const info = useSelector((state: RootState) => state.fixture.info);
  const events = useSelector((state: RootState) => state.fixture.events);
  const showPhoto = useSelector((state: RootState) => state.options.showPhoto);
  const processedLineup = useSelector(
    (state: RootState) => state.fixtureProcessedData.lineup,
  );

  const homeTeamContainerRef = useRef<HTMLDivElement>(null);
  const awayTeamContainerRef = useRef<HTMLDivElement>(null);
  const [homeGridPlayerHeight, setHomeGridPlayerHeight] = useState(0);
  const [awayGridPlayerHeight, setAwayGridPlayerHeight] = useState(0);
  const lineupRef = useRef<TeamLineups | null | undefined>(lineup);

  // Modal manage
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedPlayerStatistics, setSelectedPlayerStatistics] =
    useState<any>(null); // 선택된 선수의 통계 정보 관리
  const modalCloseTimoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlayerClick = (finalPlayer: ViewPlayer) => {
    if (!finalPlayer?.statistics) {
      return;
    }

    setModalOpen(true);
    if (modalCloseTimoutRef.current) {
      clearTimeout(modalCloseTimoutRef.current);
    }
    setSelectedPlayerStatistics(finalPlayer.statistics);
  };

  const closeModal = () => {
    setModalOpen(false);
    modalCloseTimoutRef.current = setTimeout(() => {
      setSelectedPlayerStatistics(null);
    }, 500);
  };

  const [processedHomeLineup, setProcessedHomeLineup] =
    useState<ViewLineup | null>(null);
  const [processedAwayLineup, setProcessedAwayLineup] =
    useState<ViewLineup | null>(null);

  const updatePlayerSize = debounce(() => {
    const _lineup = lineupRef.current;
    if (!_lineup || !_lineup.away || !_lineup.home) {
      return;
    }
    const homeLineupGridCount = _lineup.home.formation.split('-').length + 1;
    const awayLineupGridCount = _lineup.away.formation.split('-').length + 1;

    if (homeTeamContainerRef.current) {
      const height =
        homeTeamContainerRef.current.clientHeight / homeLineupGridCount;
      setHomeGridPlayerHeight(height);
    }
    if (awayTeamContainerRef.current) {
      const height =
        awayTeamContainerRef.current.clientHeight / awayLineupGridCount;
      setAwayGridPlayerHeight(height);
    }
  }, 150);

  const updateStoredWindowSize = debounce(() => {
    const height = window.innerHeight;
    const width = window.innerWidth;
    window.electronStore.set('matchlive_window_height', height);
    window.electronStore.set('matchlive_window_width', width);
  }, 150);

  const resizeEventListner = () => {
    updatePlayerSize();
    updateStoredWindowSize();
  };

  useEffect(() => {
    lineupRef.current = lineup;
  }, [lineup]);

  useEffect(() => {
    updatePlayerSize();
  }, [lineupRef.current]);

  useEffect(() => {
    window.addEventListener('resize', resizeEventListner);
    return () => {
      window.removeEventListener('resize', resizeEventListner);
    };
  }, []);

  useEffect(() => {
    setProcessedHomeLineup(processedLineup.home);
    setProcessedAwayLineup(processedLineup.away);
  }, [processedLineup]);

  const playerSize = Math.min(homeGridPlayerHeight, awayGridPlayerHeight);
  const minGridPlayerHeight = Math.min(
    homeGridPlayerHeight,
    awayGridPlayerHeight,
  );

  // __Modal 창 테스트용 코드__
  const MODAL_TEST_MODE = false;
  useEffect(() => {
    if (!MODAL_TEST_MODE) {
      return;
    }
    console.log(
      `
      DEV MODE: Opening Player Statistics Modal.
      Set opacity of 'PlayerModalOverlayStyle' to 1 to display modal.
      Because CSSTransition className appending does not work when hot reloading,
      you need to manually set the opacity to 1 to see the modal.
      `,
    );
    if (!lineup || !lineup.home || !lineup.away || !processedHomeLineup) {
      return;
    }

    const firstPlayerFORDEBUG = processedHomeLineup.players
      .flat()
      .find((player) => player.position !== 'G');
    if (!firstPlayerFORDEBUG) {
      return;
    }
    handlePlayerClick(firstPlayerFORDEBUG);
  }, [processedHomeLineup]);

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        $StyledOverlay={PlayerModalOverlayStyle}
        $StyledContent={PlayerModalContentStyle}
      >
        {selectedPlayerStatistics ? (
          <div>
            <h3>선수 통계</h3>
            <p>평점: {selectedPlayerStatistics.rating}</p>
          </div>
        ) : (
          <p>통계 정보가 없습니다.</p>
        )}
      </Modal>
      <LineupTabContainer isModalOpen={isModalOpen}>
        <TeamContainer ref={homeTeamContainerRef}>
          {processedHomeLineup && (
            <LineupView
              lineup={processedHomeLineup}
              isAway={false}
              playerSize={playerSize}
              lineHeight={minGridPlayerHeight}
              showPhoto={showPhoto}
              isModalOpen={isModalOpen}
              closeModal={closeModal}
              selectedPlayerStatistics={selectedPlayerStatistics}
              handlePlayerClick={handlePlayerClick}
            />
          )}
          {info && (
            <TeamLogoName className="team-name-logo-box team-name__home">
              <div className="team-logo">
                <img src={info.home.logo} alt={info.home.name} />
              </div>
              <div className="team-name">
                {info.home.koreanName || info.home.name}
              </div>
              <HomeMarker />
            </TeamLogoName>
          )}
        </TeamContainer>
        <TeamContainer ref={awayTeamContainerRef} $isAway>
          {processedAwayLineup && (
            <LineupView
              lineup={processedAwayLineup}
              isAway={true}
              playerSize={playerSize}
              lineHeight={minGridPlayerHeight}
              showPhoto={showPhoto}
              isModalOpen={isModalOpen}
              closeModal={closeModal}
              selectedPlayerStatistics={selectedPlayerStatistics}
              handlePlayerClick={handlePlayerClick}
            />
          )}
          {info && (
            <TeamLogoName className="team-name-logo-box team-name__away">
              <div className="team-logo">
                <img src={info.away.logo} alt={info.away.name} />
              </div>
              <div className="team-name">
                {info.away.koreanName || info.away.name}
              </div>
            </TeamLogoName>
          )}
        </TeamContainer>
        <FootballFieldCanvas />
      </LineupTabContainer>
    </>
  );
};

export default LineupTab;
