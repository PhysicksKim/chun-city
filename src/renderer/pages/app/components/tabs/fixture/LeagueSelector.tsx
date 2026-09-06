import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import useEmblaCarousel from 'embla-carousel-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import { AvailableLeagueResponse } from '@app/v1/types/api';

interface LeagueSelectorProps {
  leagues: AvailableLeagueResponse[];
  selectedLeagueUid?: string;
  onSelectLeague: (leagueUid: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

const LeagueSelector = ({
  leagues,
  selectedLeagueUid,
  onSelectLeague,
  onRefresh,
  loading,
}: LeagueSelectorProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    watchDrag: true,
    dragFree: true,
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;

    const handleResize = () => {
      emblaApi.reInit();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi, leagues]);

  const handleLeagueClick = (leagueUid: string) => {
    if (selectedLeagueUid === leagueUid) return;
    onSelectLeague(leagueUid);
  };

  return (
    <LeagueBox>
      <LeagueBoxTitleRow>
        <LeagueBoxTitle>리그</LeagueBoxTitle>
        {onRefresh && (
          <RefreshButton
            onClick={onRefresh}
            disabled={loading}
            title="리그 목록 새로고침"
          >
            <FontAwesomeIcon icon={faRotateRight} spin={loading} />
          </RefreshButton>
        )}
      </LeagueBoxTitleRow>
      <CarouselWrapper>
        <EmblaViewport ref={emblaRef}>
          <EmblaContainer>
            {[...leagues]
              .sort((a, b) => a.uid.localeCompare(b.uid))
              .map((league) => (
                <LeagueCard
                  key={league.uid}
                  $selected={selectedLeagueUid === league.uid}
                  onClick={() => handleLeagueClick(league.uid)}
                >
                  <LeagueName>{league.nameKo ?? league.name}</LeagueName>
                </LeagueCard>
              ))}
          </EmblaContainer>
        </EmblaViewport>

        <NavButton
          $direction="prev"
          onClick={scrollPrev}
          disabled={!prevBtnEnabled}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </NavButton>
        <NavButton
          $direction="next"
          onClick={scrollNext}
          disabled={!nextBtnEnabled}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </NavButton>
      </CarouselWrapper>
    </LeagueBox>
  );
};

export default LeagueSelector;

const LeagueBox = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-sizing: border-box;
  padding: 10px 40px 10px 30px;
`;

const LeagueBoxTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 10px;
`;

const LeagueBoxTitle = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-top: 5px;
  color: white;
`;

const RefreshButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
  margin: 0;
  padding: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-top: 8px;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const CarouselWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const EmblaViewport = styled.div`
  overflow: hidden;
  width: 100%;
  min-width: 0;
  margin-top: 15px;
`;

const EmblaContainer = styled.div`
  display: flex;
  user-select: none;
  -webkit-touch-callout: none;
`;

const LeagueCard = styled.div<{ $selected: boolean }>`
  flex: 0 0 auto;
  min-width: 145px;
  height: 100px;
  width: 145px;
  margin-right: 10px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${({ $selected }) =>
    $selected ? 'rgba(151, 176, 245, 0.35)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid
    ${({ $selected }) =>
      $selected ? 'rgba(151, 176, 245, 0.5)' : 'transparent'};

  &:hover {
    background-color: ${({ $selected }) =>
      $selected ? 'rgba(124, 156, 204, 0.3)' : 'rgba(255, 255, 255, 0.2)'};
  }

  box-shadow: ${({ $selected }) =>
    $selected ? '0 4px 12px rgba(59, 119, 209, 0.3)' : 'none'};
`;

const LeagueName = styled.div`
  white-space: nowrap;
  font-size: 14px;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  padding: 0 5px;
  font-weight: 500;
`;

const NavButton = styled.button<{ $direction: 'prev' | 'next' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $direction }) =>
    $direction === 'prev' ? 'left: -15px;' : 'right: -5px;'}

  width: 32px;
  height: 32px;
  border-radius: 50%;

  background-color: rgba(30, 30, 30, 0.6);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  color: white;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: background-color 0.2s ease;
  font-size: 14px;

  &:hover:not(:disabled) {
    background-color: rgba(50, 50, 50, 0.8);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;
