import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFutbol,
  faSquare,
  faArrowsRotate,
} from '@fortawesome/free-solid-svg-icons';

import { RootState } from '@matchlive/store/store';
import { EventInfo } from '@app/v1/types/api';

interface EventsTabProps {
  isActive: boolean;
}

const translateEventType = (type: string, detail?: string): string => {
  const typeLowerCase = type.toLowerCase();
  const detailLowerCase = (detail || '').toLowerCase();

  switch (typeLowerCase) {
    case 'goal':
      if (detailLowerCase.includes('own')) {
        return '자책골';
      }
      return '골';
    case 'card':
      if (detailLowerCase.includes('yellow')) {
        return '경고';
      }
      if (detailLowerCase.includes('red')) {
        return '퇴장';
      }
      return '카드';
    case 'subst':
      return '교체';
    default:
      return type;
  }
};

const getPlayerLabel = (type: string): string => {
  const typeLowerCase = type.toLowerCase();
  switch (typeLowerCase) {
    case 'goal':
      return '득점';
    case 'subst':
      return '교체 투입';
    case 'card':
      return '';
    default:
      return '선수';
  }
};

const getAssistLabel = (type: string): string | null => {
  const typeLowerCase = type.toLowerCase();
  switch (typeLowerCase) {
    case 'goal':
      return '도움';
    case 'subst':
      return '교체 아웃';
    case 'card':
      return null;
    default:
      return '관련';
  }
};

const getEventIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'goal':
      return faFutbol;
    case 'card':
      return faSquare;
    case 'subst':
      return faArrowsRotate;
    default:
      return faSquare;
  }
};

const getEventColor = (type: string, detail?: string) => {
  if (type.toLowerCase() === 'card') {
    if (detail?.toLowerCase().includes('red')) {
      return '#ef4444';
    }
    return '#fbbf24';
  }
  if (type.toLowerCase() === 'goal') {
    if (detail?.toLowerCase().includes('own')) {
      return '#961d1d';
    }
    return '#10b981';
  }
  return '#666';
};

const EventCard = ({ event }: { event: EventInfo }) => {
  const icon = getEventIcon(event.type);
  const color = getEventColor(event.type, event.detail);
  const playerLabel = getPlayerLabel(event.type);
  const assistLabel = getAssistLabel(event.type);

  return (
    <EventCardContainer>
      <EventTime>
        {event.elapsed}
        {event.extraTime ? `+${event.extraTime}` : ''}
      </EventTime>
      <EventContent>
        <EventIcon style={{ color }}>
          <FontAwesomeIcon icon={icon} />
        </EventIcon>
        <EventDetails>
          <EventType style={{ color }}>
            {translateEventType(event.type, event.detail)}
          </EventType>
          <EventPlayer>
            {playerLabel && `${playerLabel}: `}
            {event.player?.koreanName || event.player?.name || ''}
            {event.assist && assistLabel && (
              <AssistInfo>
                {assistLabel}: {event.assist.koreanName || event.assist.name}
              </AssistInfo>
            )}
          </EventPlayer>
          {event.comments && <EventComments>{event.comments}</EventComments>}
        </EventDetails>
        <TeamBadge>{event.team.koreanName || event.team.name}</TeamBadge>
      </EventContent>
    </EventCardContainer>
  );
};

const EventsTab = ({ isActive }: EventsTabProps) => {
  const events = useSelector((state: RootState) => state.fixture.events);
  const filterEvents = useSelector(
    (state: RootState) => state.eventFilter.filterEvents
  );

  if (!events || events.events.length === 0) {
    return (
      <Container $isActive={isActive}>
        <EmptyMessage>이벤트 정보가 없습니다</EmptyMessage>
      </Container>
    );
  }

  // Filter out filtered events
  const filteredEventSequences = new Set(
    filterEvents.map((event) => event.sequence)
  );
  const unfilteredEvents = events.events.filter(
    (event) => !filteredEventSequences.has(event.sequence)
  );

  // Sort events by elapsed time (descending - most recent first)
  const sortedEvents = [...unfilteredEvents].sort((a, b) => {
    const aTime = a.elapsed + (a.extraTime || 0);
    const bTime = b.elapsed + (b.extraTime || 0);
    return bTime - aTime;
  });

  return (
    <Container $isActive={isActive}>
      <EventsContent>
        <Title>경기 타임라인</Title>
        <EventsList>
          {sortedEvents.map((event) => (
            <EventCard
              key={`${event.sequence}-${event.elapsed}`}
              event={event}
            />
          ))}
        </EventsList>
      </EventsContent>
    </Container>
  );
};

const Container = styled.div<{ $isActive: boolean }>`
  flex: 1;
  width: 100%;
  min-height: 0;
  padding: clamp(8px, 4vw, 32px);
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  opacity: ${(props) => (props.$isActive ? 1 : 0)};
  transition: opacity 0.3s ease;
  color: #fff;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
`;

const EmptyMessage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #fff;
`;

const EventsContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 2vw, 16px);
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-align: center;
  margin: 0 0 8px 0;
  text-shadow: none;
`;

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.5vw, 12px);
`;

const EventCardContainer = styled.div`
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  padding: clamp(8px, 2vw, 16px);
  display: flex;
  gap: clamp(4px, 2vw, 16px);
  align-items: flex-start;
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  }
`;

const EventTime = styled.div`
  font-size: clamp(12px, 2vw, 16px);
  font-weight: 700;
  color: #333;
  min-width: 0;
  width: fit-content;
  text-align: right;
  padding-top: 2px;
  flex-shrink: 0;
`;

const EventContent = styled.div`
  flex: 1;
  display: flex;
  gap: clamp(4px, 1.5vw, 12px);
  align-items: flex-start;
  min-width: 0;
`;

const EventIcon = styled.div`
  font-size: 24px;
  line-height: 1;
  padding-top: 2px;
`;

const EventDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const EventType = styled.div`
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const EventPlayer = styled.div`
  font-size: 15px;
  color: #111;
  font-weight: 500;
`;

const AssistInfo = styled.div`
  font-size: 13px;
  color: #666;
  font-weight: 400;
`;

const EventComments = styled.div`
  font-size: 12px;
  color: #888;
`;

const TeamBadge = styled.div`
  padding: 4px clamp(4px, 1.5vw, 12px);
  background: #eee;
  border-radius: 12px;
  font-size: clamp(10px, 1.5vw, 12px);
  font-weight: 600;
  color: #444;
  white-space: nowrap;
  align-self: flex-start;
  flex-shrink: 0;
`;

export default EventsTab;
