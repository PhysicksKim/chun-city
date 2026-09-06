import { useSelector } from 'react-redux';
import styled, { keyframes } from 'styled-components';
import { RootState } from '@matchlive/store/store';
import { ActiveTab } from './Layout';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  $isAbsolute?: boolean;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const Header = ({
  activeTab,
  onTabChange,
  $isAbsolute = true,
}: HeaderProps) => {
  const info = useSelector((state: RootState) => state.fixture.info);
  const liveStatus = useSelector(
    (state: RootState) => state.fixture.liveStatus
  );

  if (!info) {
    return null;
  }

  const homeTeam = info.home;
  const awayTeam = info.away;
  const score = liveStatus?.liveStatus.score;
  const status = liveStatus?.liveStatus;

  return (
    <HeaderContainer $isAbsolute={$isAbsolute}>
      <LeagueInfo>
        <LeagueName>{info.league.name}</LeagueName>
      </LeagueInfo>

      <MatchInfo>
        <TeamSection>
          <TeamLogo src={homeTeam.logo} alt="" />
          <TeamName>{homeTeam.name}</TeamName>
        </TeamSection>

        <ScoreSection>
          {score ? (
            <>
              <Score>
                {score.home ?? 0} : {score.away ?? 0}
              </Score>
              <Status>
                {status?.longStatus}
                {status?.elapsed && ` · ${status.elapsed}'`}
              </Status>
            </>
          ) : (
            <Status>{status?.longStatus ?? 'VS'}</Status>
          )}
        </ScoreSection>

        <TeamSection>
          <TeamLogo src={awayTeam.logo} alt="" />
          <TeamName>{awayTeam.name}</TeamName>
        </TeamSection>
      </MatchInfo>

      <TabSelector>
        <TabButton
          $active={activeTab === 'lineup'}
          onClick={() => onTabChange('lineup')}
        >
          라인업
        </TabButton>
        <TabButton
          $active={activeTab === 'stats'}
          onClick={() => onTabChange('stats')}
        >
          통계
        </TabButton>
        <TabButton
          $active={activeTab === 'events'}
          onClick={() => onTabChange('events')}
        >
          이벤트
        </TabButton>
      </TabSelector>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.div<{ $isAbsolute: boolean }>`
  position: ${(props) => (props.$isAbsolute ? 'absolute' : 'relative')};
  top: ${(props) => (props.$isAbsolute ? '0' : 'auto')};
  left: ${(props) => (props.$isAbsolute ? '0' : 'auto')};
  right: ${(props) => (props.$isAbsolute ? '0' : 'auto')};
  padding: 16px clamp(12px, 4vw, 24px) 12px;
  /* backdrop-filter: blur(8px); */
  z-index: ${(props) => (props.$isAbsolute ? '100' : '1')};
  animation: ${fadeIn} 0.3s ease forwards;
  opacity: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0; /* 컨테이너 자체도 줄어들 수 있게 */
  background: rgba(0, 0, 0, 0.4);

  -webkit-app-region: drag;
  pointer-events: none;
  cursor: move;
`;

const LeagueInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  justify-content: center;
`;

const LeagueName = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
`;

const MatchInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(8px, 4vw, 32px);
  width: 100%;
`;

const TeamSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0; /* Flex items can shrink below their content size */
`;

const TeamLogo = styled.img`
  width: clamp(32px, 10vw, 48px);
  height: clamp(32px, 10vw, 48px);
  object-fit: contain;
`;

const TeamName = styled.div`
  font-size: clamp(12px, 3vw, 16px);
  font-weight: 600;
  color: white;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  /* 줄바꿈 허용 및 말줄임 처리 */
  white-space: normal;
  overflow-wrap: anywhere; /* 좁은 공간에서 강제 줄바꿈 허용 */
  word-break: keep-all; /* 가능한 단어 단위 유지 */
  line-height: 1.2;

  /* 최대 2줄까지만 표시 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  max-width: 100%;
`;

const ScoreSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: auto; /* 고정 최소 너비 제거 */
  flex-shrink: 0; /* 스코어는 줄어들지 않음 */
`;

const Score = styled.div`
  font-size: clamp(24px, 6vw, 32px);
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  letter-spacing: 2px;
  white-space: nowrap;
`;

const Status = styled.div`
  font-size: clamp(11px, 2.5vw, 13px);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
`;

const TabSelector = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 16px;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px;
  border-radius: 8px;

  -webkit-app-region: no-drag;
  pointer-events: all;
  cursor: auto;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 6px 16px;
  border: none;
  background: ${(props) =>
    props.$active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  color: ${(props) => (props.$active ? 'white' : 'rgba(255, 255, 255, 0.6)')};
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }
`;

export default Header;
