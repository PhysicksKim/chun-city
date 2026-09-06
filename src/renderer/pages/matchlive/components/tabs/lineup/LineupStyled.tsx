import { faArrowUp, faFutbol, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled, { css, keyframes } from 'styled-components';
import React from 'react';
import { PlayerStatisticsList, ProfileSection } from './PlayerStatistics';
import getRatingColor, { isValidRating } from './RatingUtils';
import { ViewPlayer } from './types';
import { GlobalBorderRadiusPx } from '@matchlive/components/common/StyleConstant';

const commonBoxShadow = css`
  box-shadow: 1px 0 5px 0 rgba(0, 0, 0, 0.308);
`;

export const LineupTabContainer = styled.div<{
  $isModalOpen: boolean;
  $isActive: boolean;
}>`
  position: relative;
  box-sizing: border-box;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 12px;
  padding-bottom: 5px;
  border-radius: ${GlobalBorderRadiusPx}px;
  /* -webkit-app-region: drag;
  pointer-events: auto;
  cursor: auto; */

  /**
   * 라인업 위에 다른 모달이 떴을 때 스크롤이 가능하려면, 
  * 아래처럼 active조건에 따라서 drag 속성을 변경해줘야 합니다.
   */
  ${({ $isActive }) =>
    $isActive
      ? `
      -webkit-app-region: drag;
      pointer-events: all;
      cursor: auto;
    `
      : `
      -webkit-app-region: no-drag;
      pointer-events: none;
      cursor: default;
    `}
`;

export const TeamContainer = styled.div<{ $isAway?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 50%;
  box-sizing: border-box;
  overflow: hidden;
  margin-top: 10px;
  margin-bottom: 10px;
  overflow: visible;
`;

export const TeamName = styled.h2`
  font-size: 14px;
  font-weight: bold;
  margin: 10px 0;
  position: absolute;
`;

export const GridLine = styled.div<{
  $height: number;
  $isAway?: boolean;
  $idx: number;
}>`
  position: relative;
  width: 100%;
  height: ${(props) => props.$height}%;
  display: flex;
`;

const textShadowColor = 'rgba(31, 18, 105, 0.863)';
const textShadowStyle = css`
  text-shadow:
    -1px 0px ${textShadowColor},
    0px 1px ${textShadowColor},
    1px 0px ${textShadowColor},
    0px -1px ${textShadowColor};
`;
const isTextShadow = true;
const playerNameOverlapOffsetPx = 7;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const GridPlayer = styled.div<{
  $top: number;
  $left: number;
  $width: number;
  $playerSize: number;
  $lineHeight: number;
}>`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  top: 0%;
  left: ${(props) => props.$left}%;
  width: ${(props) => props.$width}%;
  height: ${(props) => props.$lineHeight}px;
  transform: translateX(-50%);

  opacity: 0;
  animation: ${fadeIn} 0.5s ease-in-out forwards;

  .player-number-photo-box {
    top: 0;
    position: relative;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    height: ${(props) => props.$lineHeight - 20}px;

    cursor: pointer;

    img {
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      object-position: top;
      background-color: white;
      -webkit-user-drag: none;
      ${commonBoxShadow}
    }

    .player-number {
      position: relative;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      border-radius: 50%;
      bottom: 0;
      width: ${(props) => props.$playerSize * 1.2}px;
      height: 100%;

      svg {
        height: 100%;
        width: 80%;
      }

      .player-number_val {
        position: absolute;
        box-sizing: border-box;
        text-align: center;
        bottom: 50%;
        left: 50%;
        transform: translate(-50%, 70%);
        font-size: ${(props) => props.$playerSize * 0.32}px;
      }
    }
  }

  span {
    display: inline-block;
    white-space: nowrap;
    margin-top: 3px;
    color: white;
    ${() => isTextShadow && textShadowStyle}
  }
`;

export const TeamLogoName = styled.div<{ $color?: string | null }>`
  position: absolute;
  left: 0;
  width: auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 24px;
  background-color: #002e6b;
  border-radius: 5px;
  padding-left: 5px;
  padding-bottom: 2px;
  margin-left: 18px;
  margin-top: 12px;
  margin-bottom: 12px;
  padding-right: ${({ $color }) => ($color ? '9px' : '5px')};

  &.team-name__home {
    top: 8px;
  }
  &.team-name__away {
    bottom: 8px;
  }

  .team-logo {
    margin-top: 1px;
    height: 20px;
    width: 20px;

    img {
      height: 100%;
      object-fit: contain;
    }
  }

  .team-name {
    display: flex;
    flex-direction: column;
    justify-content: end;
    font-size: 16px;
    font-weight: 700;
    white-space: nowrap;
    overflow-x: visible;
    margin-left: 3px;
    transform: translate(0, 2px);
    border-radius: 5px;
    color: white;
    text-align: center;
    padding-right: 3px;
  }

  .color-bar {
    position: relative;
    width: 6px;
    height: 70%;
    margin-top: 3px;
    margin-right: 4px;
    margin-bottom: 1px;
    border: 1px solid #ffffff;
    background-color: ${({ $color }) => $color || 'transparent'};
    border-radius: 0;
  }
`;

const SubInMarkWrapper = styled.div<{
  $showPhoto?: boolean;
  $photoSize?: number;
}>`
  position: absolute;
  top: 0px;
  left: ${({ $photoSize }) => ($photoSize ? `0` : '-20%')};
  transform: translate(-50%, 0);
  width: 22px;
  height: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: white;
  border: 1px solid #5c5c5c;
  box-sizing: border-box;
`;

const SubIndicatorInner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  width: 70%;
  height: 70%;
  border-radius: 50%;
  background-color: #0d5df1;
  color: #ffffff;
`;

export const SubInMark: React.FC<{
  showPhoto: boolean;
  photoSize?: number;
}> = ({ showPhoto, photoSize }) => {
  return (
    <SubInMarkWrapper $showPhoto={showPhoto} $photoSize={photoSize}>
      <SubIndicatorInner>
        <FontAwesomeIcon icon={faArrowUp} />
      </SubIndicatorInner>
    </SubInMarkWrapper>
  );
};

const CardWrapper = styled.div<{ $showPhoto?: boolean; $photoSize?: number }>`
  position: absolute;
  top: 27%;
  left: ${({ $photoSize }) => ($photoSize ? 0 : '-30%')};
  transform: translate(-75%, 0);
  width: 22px;
  height: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  border: 1px solid #5c5c5c;
  border-radius: 50%;
  background-color: white;
  ${commonBoxShadow}
`;

const CardInner = styled.div<{ color: string; $borderColor: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 65%;
  width: 50%;
  background-color: ${({ color }) => color};
  border: 1px solid ${({ $borderColor }) => $borderColor};
  border-radius: 25%;
`;

export const CardYellow: React.FC<{
  showPhoto: boolean;
  photoSize?: number;
}> = ({ showPhoto, photoSize }) => {
  return (
    <CardWrapper $showPhoto={showPhoto} $photoSize={photoSize}>
      <CardInner color="#f1f10d" $borderColor="#969617" />
    </CardWrapper>
  );
};

export const CardRed: React.FC<{ showPhoto: boolean; photoSize?: number }> = ({
  showPhoto,
  photoSize,
}) => {
  return (
    <CardWrapper $showPhoto={showPhoto} $photoSize={photoSize}>
      <CardInner color="#f14141" $borderColor="#6b1010" />
    </CardWrapper>
  );
};

const GoalMarkWrapper = styled.div<{
  $showPhoto?: boolean;
  $photoSize?: number;
}>`
  position: absolute;
  bottom: -2px;
  right: ${({ $photoSize }) => ($photoSize ? '0' : '0%')};
  transform: translate(-5%, 0);
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: black;
  box-sizing: border-box;
  border-radius: 40%;
`;

const GoalIndicatorInner = styled.div<{ $index: number; $isOwnGoal: boolean }>`
  display: flex;
  position: absolute;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  background-color: ${({ $isOwnGoal }) => ($isOwnGoal ? '#f1e1e1' : 'white')};
  border-radius: 50%;
  right: ${({ $index }) => `-${$index * 7}px`};
  scale: 1;
  ${commonBoxShadow}
`;

export const GoalMark: React.FC<{
  goal: { minute: number; ownGoal: boolean }[];
  showPhoto: boolean;
  photoSize?: number;
}> = ({ goal, showPhoto, photoSize }) => {
  return (
    <GoalMarkWrapper $showPhoto={showPhoto} $photoSize={photoSize}>
      {goal
        .map((goalItem, index) => {
          return (
            <GoalIndicatorInner
              key={`${index}_${goalItem.minute}`}
              $index={index}
              $isOwnGoal={goalItem.ownGoal}
            >
              <FontAwesomeIcon
                icon={faFutbol}
                style={{
                  scale: '1.15',
                  color: goalItem.ownGoal ? '#961d1d' : 'black',
                }}
              />
            </GoalIndicatorInner>
          );
        })
        .reverse()}
    </GoalMarkWrapper>
  );
};

const PlayerNumberWrapper = styled.div<{
  $number: number;
}>`
  position: absolute;
  bottom: 5px;
  left: 0%;
  transform: translate(-50%, 0);
  width: 24px;
  height: 19px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  border: 1px solid #93939b;
  border-radius: 5px;
  background-color: white;
  ${commonBoxShadow}
`;

const PlayerNumberInner = styled.div<{ $number: number }>`
  text-align: center;
  font-size: 14px;
  width: 100%;
  height: 100%;
  padding-top: 2px;
  color: black;
  font-weight: 700;
`;

export const PlayerNumber: React.FC<{ number: number }> = ({ number }) => {
  return (
    <PlayerNumberWrapper $number={number}>
      <PlayerNumberInner $number={number}>{number}</PlayerNumberInner>
    </PlayerNumberWrapper>
  );
};

const PlayerNameSpan = styled.span<{ $fontsize: number }>`
  position: absolute;
  top: 100%;
  left: 50%;
  overflow: visible;
  transform: translate(-50%, -${playerNameOverlapOffsetPx}px);
  background-color: #0a4192c1;
  padding: 0 2px;
  border-radius: 5px;
  font-size: ${({ $fontsize }) => $fontsize}px;
  font-weight: 700;
`;

export const PlayerName: React.FC<{ name: string; fontSize: number }> = ({
  name,
  fontSize,
}) => {
  return <PlayerNameSpan $fontsize={fontSize}>{name}</PlayerNameSpan>;
};

const HomeMarkerInner = styled.div`
  font-size: 12px;
  text-align: center;
  font-weight: 900;
  border-radius: 5px;
  transform: translate(0, 2px);
  padding-top: 3px;
  padding-left: 4px;
  padding-right: 4px;
  padding-bottom: 1px;
  box-sizing: border-box;
  background-color: #12089e;
  color: #eef2f7;
  border: 1px solid #c5dcff;
`;

const HomeMarkerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 3px;
`;

export const HomeMarker: React.FC = () => {
  return (
    <HomeMarkerWrapper>
      <HomeMarkerInner>H</HomeMarkerInner>
    </HomeMarkerWrapper>
  );
};

const OutstandingPlayerMark = (
  <FontAwesomeIcon
    icon={faStar}
    style={{
      color: '#ffffff',
      fontSize: '0.6rem',
      paddingLeft: '2px',
      transform: 'translate(1px, 0)',
    }}
  />
);

const RatingWrapper = styled.div<{ $ratingColor: string }>`
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(35%, 0%);
  font-size: 0.8rem;
  font-weight: 500;
  min-width: 1.9rem;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  padding: 1px 5px;
  border-radius: 0.5rem;
  box-sizing: border-box;
  background-color: ${({ $ratingColor }) => $ratingColor};
  ${commonBoxShadow}
`;

export const RatingBox: React.FC<{ rating: string }> = ({ rating }) => {
  if (!isValidRating(rating)) return null;

  const floatRating = Number(rating);

  const formattedRating = floatRating.toFixed(1);
  const ratingColor = getRatingColor(floatRating);

  const outstandingPlayerMark =
    floatRating > 8.5 ? OutstandingPlayerMark : null;

  return (
    <RatingWrapper $ratingColor={ratingColor}>
      {formattedRating}
      {outstandingPlayerMark}
    </RatingWrapper>
  );
};

const PlayerStatisticsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  box-sizing: border-box;
  border-radius: 5px;
  padding: 0 3px;
  margin-top: 2px;
  width: 100%;
  height: 100%;
`;

const StatisticsListSection = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
  width: 100%;
`;

const NoPlayerStatistics = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  margin-top: 20px;
  font-size: 1rem;
  font-weight: 500;
`;

export const PlayerStatisticsContent: React.FC<{
  player: ViewPlayer;
}> = ({ player }) => {
  const stats = player.statistics;
  return (
    <PlayerStatisticsContainer>
      {/* 프로필 영역 */}
      <ProfileSection
        name={player.name}
        photo={player.photo || ''}
        goals={stats?.goals || 0}
        assists={stats?.assists || 0}
        rating={stats?.rating || ''}
      />

      {/* PlayerStatisticsList가 표시될 영역 */}
      <StatisticsListSection>
        {stats ? (
          <PlayerStatisticsList
            stats={stats}
            position={player.position || ''}
          />
        ) : (
          <NoPlayerStatistics>아직 통계 정보가 없습니다</NoPlayerStatistics>
        )}
      </StatisticsListSection>
    </PlayerStatisticsContainer>
  );
};

export const PlayerModalOverlayStyle = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(10, 27, 44, 0.473);
  border-radius: ${GlobalBorderRadiusPx}px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  transition: opacity 0.1s ease-in-out;
  opacity: 0;
  cursor: pointer;

  -webkit-app-region: ${({ $isOpen }) => ($isOpen ? 'no-drag' : 'drag')};
  pointer-events: ${({ $isOpen }) => ($isOpen ? 'all' : 'none')};

  &.modal-enter,
  &.modal-enter-active {
    opacity: 0;
  }

  &.modal-enter-done {
    opacity: 1;
  }

  &.modal-exit {
    opacity: 1;
  }

  &.modal-exit-active,
  &.modal-exit-done {
    opacity: 0;
  }
`;

export const PlayerModalContentStyle = styled.div`
  background-color: #f5faff; // ThemeColors.popWindow.background
  position: fixed;
  top: 50%;
  left: 50%;
  width: 70%;
  height: 70%;
  max-width: 400px;
  max-height: 550px;
  transform: translate(-50%, -50%);
  padding: 20px;
  border-radius: 10px;
  z-index: 999;
  transition: opacity 0.1s ease-in-out;
  opacity: 1;
  cursor: default;
  overflow: hidden;
`;
