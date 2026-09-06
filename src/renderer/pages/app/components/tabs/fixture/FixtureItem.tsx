import React from 'react';
import styled from 'styled-components';
import {
  faArrowUpRightFromSquare,
  faBan,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FixtureByLeagueResponse } from '@app/v1/types/api';
import TeamLogo from './TeamLogo';
import { useAppDispatch } from '@app/store/store';
import { createV1DataController } from '@app/v1/services/v1DataController';

interface FixtureItemProps {
  fixture: FixtureByLeagueResponse;
}

const FixtureItem = ({ fixture }: FixtureItemProps) => {
  const dispatch = useAppDispatch();
  const { homeTeam, awayTeam, kickoff, status, score, available, uid, round } =
    fixture;

  const convertKickoffTimeToHHMM = (kickoffStr: string) => {
    const date = new Date(kickoffStr);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleOpenMatchlive = () => {
    if (!available) return;

    const controller = createV1DataController(dispatch);
    controller.setFixtureUid(uid);
    controller.start();

    window.electron.ipcRenderer.send('open-matchlive-window', uid);
  };

  return (
    <Container>
      <ScheduleBox>
        <KickoffTime>{convertKickoffTimeToHHMM(kickoff)}</KickoffTime>
        <RoundText>{round}</RoundText>
      </ScheduleBox>

      <VersusBox>
        <TeamSide $side="home">
          <TeamMark $type="home">H</TeamMark>
          <TeamLogo logo={homeTeam.logo} name={homeTeam.name} />
          <TeamName>{homeTeam.name}</TeamName>
        </TeamSide>

        <ScoreBox>
          <Score>{score?.home ?? 0}</Score>
          <Divider>:</Divider>
          <Score>{score?.away ?? 0}</Score>
        </ScoreBox>

        <TeamSide $side="away">
          <TeamName>{awayTeam.name}</TeamName>
          <TeamLogo logo={awayTeam.logo} name={awayTeam.name} />
          <TeamMark $type="away">A</TeamMark>
        </TeamSide>
      </VersusBox>

      <StatusBox>
        <StatusTitle>경기상태</StatusTitle>
        <StatusNow>{status.shortStatus}</StatusNow>
      </StatusBox>

      <LiveBtnBox $available={available} onClick={handleOpenMatchlive}>
        {available ? (
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
        ) : (
          <FontAwesomeIcon icon={faBan} />
        )}
      </LiveBtnBox>
    </Container>
  );
};

export default FixtureItem;

const Container = styled.div`
  width: 100%;
  height: 57px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  box-sizing: border-box;
  margin-bottom: 10px;
  font-size: 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 10px;
`;

const ScheduleBox = styled.div`
  flex: 0 0 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const KickoffTime = styled.div`
  margin-top: 5px;
  font-size: 14px;
  font-weight: 400;
`;

const RoundText = styled.div`
  margin-top: 2px;
  font-size: 12px;
  font-weight: 400;
  width: 80px;
  max-height: 30px;
  text-align: center;
  overflow: hidden;
  white-space: normal;
  word-wrap: break-word;
  line-height: 1.2;
  margin-bottom: 2px;
`;

const VersusBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1 1 auto;
  min-width: 0;
  gap: 6px;
`;

const TeamSide = styled.div<{ $side: 'home' | 'away' }>`
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: row;
  justify-content: ${({ $side }) =>
    $side === 'home' ? 'flex-start' : 'flex-end'};
  align-items: center;
  gap: 6px;
`;

const TeamMark = styled.div<{ $type: 'home' | 'away' }>`
  width: 16px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 400;
  margin-top: 3px;
  border: 2px solid ${({ $type }) => ($type === 'home' ? '#565897' : '#d89066')};
  background-color: ${({ $type }) =>
    $type === 'home' ? '#565897' : '#d89066'};
`;

const TeamName = styled.div`
  flex: 1 1 0;
  min-width: 0;
  text-align: center;
  line-height: 1.2;
  overflow: hidden;
  overflow-wrap: anywhere;
  word-break: keep-all;
  white-space: normal;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;

const ScoreBox = styled.div`
  flex: 0 0 40px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
`;

const Score = styled.div`
  flex: 1;
  text-align: center;
`;

const Divider = styled.div`
  margin: 0 2px;
`;

const StatusBox = styled.div`
  flex: 0 0 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 5px;
  margin-right: 10px;
`;

const StatusTitle = styled.div`
  margin-top: 2px;
  font-size: 12px;
  font-weight: 400;
  color: #bbbbbb;
`;

const StatusNow = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-top: 2px;
`;

const LiveBtnBox = styled.div<{ $available: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 0 0 40px;
  width: 40px;
  height: 34px;
  border-radius: 7px;
  font-size: 16px;
  cursor: ${({ $available }) => ($available ? 'pointer' : 'not-allowed')};
  color: ${({ $available }) => ($available ? '#E1E4E8' : '#5C6370')};
  background-color: ${({ $available }) => ($available ? '#282C34' : '#21252B')};

  &:hover {
    background-color: ${({ $available }) =>
      $available ? '#3E4451' : '#21252B'};
    transition: 0.2s;
  }
`;
