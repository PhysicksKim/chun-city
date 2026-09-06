import { PlayerStatistics } from '@src/renderer/pages/app/v1/types/api';
import React from 'react';
import styled from 'styled-components';
import getRatingColor, { isValidRating } from './RatingUtils';
import { faFutbolBall } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RetryableImage from '@matchlive/components/common/RetryableImage';

interface ProfileSectionProps {
  name: string;
  photo: string;
  goals: number;
  assists: number;
  rating: string;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  name,
  photo,
  goals,
  assists,
  rating,
}) => {
  return (
    <ProfileSectionContainer>
      <div className="photo">
        <RetryableImage src={photo} alt={`${name} Profile`} />
      </div>
      <div className="player-infos">
        <div className="player-name">{name}</div>
        {isValidRating(rating) && (
          <div className="player-rating-box">
            <div className="rating-title">평점</div>
            <PlayerStatisticsRatingBox rating={rating} />
          </div>
        )}
        <div className="player-goal-assist-box">
          <div className="player-stat stat-goals">
            <div className="stat-title stat-title-goals">Goals</div>
            <div className="stat-value stat-value-goals">{goals}</div>
            <GoalMark goal={goals} />
          </div>
          <div className="player-stat stat-assists">
            <div className="stat-title stat-title-assists">Assists</div>
            <div className="stat-value stat-value-goals">{assists}</div>
          </div>
        </div>
      </div>
    </ProfileSectionContainer>
  );
};

type PositionString = string | 'G' | 'D' | 'M' | 'F';

const PlayerStatisticsList = ({
  stats,
  position,
}: {
  stats: PlayerStatistics;
  position: PositionString;
}) => {
  const statisticsToDisplay = statisticsArray(stats, position);
  return (
    <PlayerStatisticsListWrapper>
      {statisticsToDisplay.map((statItem, index) => (
        <CommonStatisticItem key={`${index}_${statItem.data}`}>
          <StatisticName>{statItem.name}</StatisticName>
          <StatisticValue>{statItem.data}</StatisticValue>
        </CommonStatisticItem>
      ))}
    </PlayerStatisticsListWrapper>
  );
};

export { PlayerStatisticsList, ProfileSection };

const calculatePassesAccuracyPercentString = (
  total: number,
  success: number
) => {
  if (total === 0) {
    return '0%';
  }
  return `${((success / total) * 100).toFixed(1)}%`;
};

/**
 * 선수 통계를 그룹화하여 배열로 반환합니다.
 * 주요 스탯을 상단에, 유사한 스탯을 근처에 배치합니다.
 * 골과 어시스트는 ProfileSection에서 이미 표시되므로 제외합니다.
 */
const statisticsArray = (stats: PlayerStatistics, position: PositionString) => {
  const isGoalkeeper = position === 'G';

  // 0 이상인 값만 필터링하는 헬퍼 함수
  const filterNonZero = (statItems: { data: number; name: string }[]) => {
    return statItems.filter((item) => item.data > 0);
  };

  if (isGoalkeeper) {
    // 골키퍼 우선 표시 항목 (항상 표시)
    const goalkeeperPrimaryStats = [
      { data: stats.saves || 0, name: '세이브' },
      { data: stats.goalsConceded || 0, name: '실점' },
      { data: stats.passesTotal || 0, name: '패스' },
      { data: stats.passesAccuracy || 0, name: '패스성공' },
      { data: stats.passesKey || 0, name: '슈팅으로 이어진 패스' },
      { data: stats.duelsTotal || 0, name: '볼 경합' },
      { data: stats.duelsWon || 0, name: '볼 경합 승리' },
      { data: stats.yellowCards || 0, name: '옐로카드' },
      { data: stats.foulsCommitted || 0, name: '파울' },
      { data: stats.foulsDrawn || 0, name: '당한 파울' },
    ];

    // 골키퍼 이외 항목 (0 이상인 경우에만 표시)
    const goalkeeperSecondaryStats = filterNonZero([
      { data: stats.shotsTotal || 0, name: '슈팅' },
      { data: stats.shotsOn || 0, name: '유효슈팅' },
      { data: stats.tacklesTotal || 0, name: '태클' },
      { data: stats.interceptions || 0, name: '인터셉트' },
      { data: stats.dribblesAttempts || 0, name: '드리블시도' },
      { data: stats.dribblesSuccess || 0, name: '드리블성공' },
      { data: stats.redCards || 0, name: '레드카드' },
      { data: stats.penaltiesSaved || 0, name: 'PK세이브' },
    ]);

    return [...goalkeeperPrimaryStats, ...goalkeeperSecondaryStats];
  }

  // 비골키퍼 스탯 (골과 어시스트 제외)
  // 슈팅 관련
  const shootingStats = [
    { data: stats.shotsTotal || 0, name: '슈팅' },
    { data: stats.shotsOn || 0, name: '유효슈팅' },
  ];

  // 패스 관련
  const passStats = [
    { data: stats.passesTotal || 0, name: '패스' },
    { data: stats.passesAccuracy || 0, name: '패스성공' },
    { data: stats.passesKey || 0, name: '슈팅으로 이어진 패스' },
  ];

  // 수비 관련
  const defenseStats = [
    { data: stats.tacklesTotal || 0, name: '태클' },
    { data: stats.interceptions || 0, name: '인터셉트' },
  ];

  // 듀얼/드리블 관련
  const duelDribbleStats = [
    { data: stats.duelsTotal || 0, name: '볼 경합' },
    { data: stats.duelsWon || 0, name: '볼 경합 승리' },
    { data: stats.dribblesAttempts || 0, name: '드리블시도' },
    { data: stats.dribblesSuccess || 0, name: '드리블성공' },
  ];

  // 파울 관련
  const foulStats = [
    { data: stats.foulsCommitted || 0, name: '파울' },
    { data: stats.foulsDrawn || 0, name: '당한 파울' },
  ];

  // 카드 관련
  const cardStats = [
    { data: stats.yellowCards || 0, name: '옐로카드' },
    { data: stats.redCards || 0, name: '레드카드' },
  ];

  // 페널티 (0 이상인 경우에만 표시)
  const penaltyStats =
    stats.penaltiesScored !== undefined &&
    stats.penaltiesMissed !== undefined &&
    (stats.penaltiesScored > 0 || stats.penaltiesMissed > 0)
      ? [
          { data: stats.penaltiesScored || 0, name: 'PK득점' },
          { data: stats.penaltiesMissed || 0, name: 'PK실축' },
        ]
      : [];

  return [
    ...shootingStats,
    ...passStats,
    ...defenseStats,
    ...duelDribbleStats,
    ...foulStats,
    ...cardStats,
    ...penaltyStats,
  ];
};

const SCROLLBAR_WIDTH = 7;

const PlayerStatisticsListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  padding-top: 0;
  padding-left: ${SCROLLBAR_WIDTH}px;
  padding-right: ${SCROLLBAR_WIDTH}px;
  box-sizing: border-box;
  transform: translate(${SCROLLBAR_WIDTH / 2}px, 0);

  &::-webkit-scrollbar {
    width: ${SCROLLBAR_WIDTH}px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #cddef5;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #8ba4c5;
  }
`;

const CommonStatisticItem = styled.div`
  width: 95%;
  display: flex;
  justify-content: space-between;
  align-items: end;
  transition: background-color 0.1s ease;

  box-sizing: border-box;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.8rem;
  padding-bottom: 0.5rem;

  border-bottom: 1px solid #dad8d8;

  line-height: 1.2rem;

  &:hover {
    background-color: #f5fbff;
    border-top: 3px solid #f1fcff;

    & > * {
      transition: transform 0s;
      transform: scale(1.2) translate(0, -5%);
      line-height: 1rem;
    }
  }
`;

const StatisticName = styled.div`
  font-weight: 500;
  color: #727272;
  font-size: 1rem;
  padding-top: 3px;
`;

const StatisticValue = styled.div`
  color: #181818;
  text-align: right;
  font-weight: 500;
  font-size: 1.2rem;
`;

const ProfileSectionContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 90%;
  padding: 10px;
  border-bottom: 1px solid #ccc;

  .photo {
    flex-shrink: 0;
    width: 150px;
    height: 150px;
    max-width: 50%;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 5px;
      box-sizing: border-box;
    }
  }

  .player-infos {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    margin-left: 10px;
    flex-grow: 1;
    min-width: 0;

    .player-name {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 10px;
      white-space: normal;
      word-break: keep-all;
      overflow-wrap: anywhere;
    }

    .player-rating-box {
      display: flex;
      flex-direction: row;
      align-items: center;
      margin-bottom: 5px;

      .rating-title {
        font-size: 14px;
        color: #555;
      }
    }

    .player-goal-assist-box {
      display: flex;
      flex-direction: column;
      margin-bottom: 5px;

      .player-stat {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 0;
        margin-bottom: 5px;
        padding: 0;

        .stat-title {
          font-size: 14px;
          color: #555;
          margin-right: 10px;
          width: 50px;
        }

        .stat-value {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 0;
          padding-right: 5px;
        }
      }
    }
  }
`;

// Player Event Markers

const GoalFontAwesomeMark = faFutbolBall;

const GoalMarkTranslateDiv = styled.div<{ index: number }>`
  position: absolute;
  bottom: 0;
  font-size: 16px;
  border-radius: 16px;
  transform: translate(${(props) => props.index * 75}%, 50%);
  /* background-color: white; */
`;

const GoalMarkIcon: React.FC<{ index: number }> = ({ index }) => {
  return (
    <GoalMarkTranslateDiv index={index}>
      <FontAwesomeIcon
        style={{
          backgroundColor: 'white',
          borderRadius: '50%',
        }}
        icon={GoalFontAwesomeMark}
      />
    </GoalMarkTranslateDiv>
  );
};

const GoalMarkWrapper = styled.div`
  position: relative;
`;

const GoalMark: React.FC<{ goal: number }> = ({ goal }) => {
  let GoalMarks = [];
  for (let i = 0; i < goal; i++) {
    GoalMarks.push(<GoalMarkIcon index={i} key={'goal_' + i} />);
  }
  return <GoalMarkWrapper>{GoalMarks}</GoalMarkWrapper>;
};

const RatingBoxStyle = styled.div<{ $ratingColor: string }>`
  background-color: ${(props) => props.$ratingColor};
  border-radius: 10px;
  padding: 2px 5px;
  font-size: 14px;
  color: #ffffffeb;
  margin-left: 5px;
`;

const PlayerStatisticsRatingBox: React.FC<{ rating: string }> = ({
  rating,
}) => {
  if (!isValidRating(rating)) return null;

  const ratingColor = getRatingColor(rating);
  const floatRating = Number(rating);

  const formattedRating = floatRating.toFixed(1);
  return (
    <RatingBoxStyle $ratingColor={ratingColor}>
      {formattedRating}
    </RatingBoxStyle>
  );
};
