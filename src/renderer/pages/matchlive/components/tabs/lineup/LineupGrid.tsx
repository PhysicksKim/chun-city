import React from 'react';
import { ViewLineup, ViewPlayer } from './types';
import {
  GridLine,
  GridPlayer,
  SubInMark,
  CardYellow,
  CardRed,
  GoalMark,
  RatingBox,
  PlayerNumber,
  PlayerName,
} from './LineupStyled';
import RetryableImage from '@matchlive/components/common/RetryableImage';
import styled from 'styled-components';
import { isValidRating } from './RatingUtils';

const getFinalPlayer = (player: ViewPlayer): ViewPlayer => {
  let currentPlayer = player;
  while (currentPlayer.subInPlayer) {
    currentPlayer = currentPlayer.subInPlayer;
  }
  return currentPlayer;
};

interface LineupGridProps {
  lineup: ViewLineup;
  isAway: boolean;
  playerSize: number;
  lineHeight: number;
  showPhoto: boolean;
  handlePlayerClick: (player: ViewPlayer) => void;
}

const PlayerNumberPhotoBox = styled.div`
  -webkit-app-region: no-drag;
  pointer-events: all;
  cursor: auto;
`;

const LineupGrid: React.FC<LineupGridProps> = ({
  lineup,
  isAway,
  playerSize,
  lineHeight,
  showPhoto,
  handlePlayerClick,
}) => {
  /**
   * away일 때만 배열을 reverse하여 아래에 있는 선수가 더 위에 그려지도록 함
   *
   * z-index 사용시 앞에 모달이 떠있어도 이벤트를 삼키는 문제가 자주 발생합니다
   * 그러므로 배열을 reverse하여 아래에 있는 선수가 더 위에 그려지도록 합니다
   */
  const orderedLines = isAway ? [...lineup.players].reverse() : lineup.players;

  return (
    <>
      {orderedLines.map((linePlayers, lineIndex) => (
        <GridLine
          key={`line-${lineIndex}`}
          $height={100 / lineup.players.length}
          $isAway={isAway}
          $idx={lineIndex}
        >
          {linePlayers.map((player, index) => {
            const leftPosition = isAway
              ? (100 / linePlayers.length) * (index + 0.5)
              : (100 / linePlayers.length) * (linePlayers.length - index - 0.5);

            const finalPlayer = getFinalPlayer(player);
            const photoExistAndShowPhoto = !!finalPlayer.photo && showPhoto;
            const photoSize = Math.max(lineHeight - 20, 0);
            const nameFontSize = 16;
            const isRenderable = photoSize > 0;
            const rating = finalPlayer.statistics?.rating;

            return (
              isRenderable && (
                <GridPlayer
                  key={finalPlayer.matchPlayerUid}
                  $top={0}
                  $left={leftPosition}
                  $width={100 / linePlayers.length}
                  $playerSize={playerSize}
                  $lineHeight={lineHeight}
                >
                  <PlayerNumberPhotoBox
                    className="player-number-photo-box"
                    onClick={() => handlePlayerClick(finalPlayer)}
                  >
                    {photoExistAndShowPhoto && (
                      <RetryableImage
                        src={finalPlayer.photo!}
                        alt={finalPlayer.name}
                      />
                    )}

                    <PlayerName
                      name={finalPlayer.shortName ?? finalPlayer.name}
                      fontSize={nameFontSize}
                    />

                    {finalPlayer.number && (
                      <PlayerNumber number={finalPlayer.number} />
                    )}

                    {/* Events */}
                    {finalPlayer.events.subIn && (
                      <SubInMark
                        showPhoto={photoExistAndShowPhoto}
                        photoSize={photoSize}
                      />
                    )}
                    {finalPlayer.events.yellow && (
                      <CardYellow
                        showPhoto={photoExistAndShowPhoto}
                        photoSize={photoSize}
                      />
                    )}
                    {finalPlayer.events.red && (
                      <CardRed
                        showPhoto={photoExistAndShowPhoto}
                        photoSize={photoSize}
                      />
                    )}
                    {finalPlayer.events.goal.length > 0 && (
                      <GoalMark
                        goal={finalPlayer.events.goal}
                        showPhoto={photoExistAndShowPhoto}
                        photoSize={photoSize}
                      />
                    )}
                    {isValidRating(rating) && <RatingBox rating={rating} />}
                  </PlayerNumberPhotoBox>
                </GridPlayer>
              )
            );
          })}
        </GridLine>
      ))}
    </>
  );
};

export default LineupGrid;
