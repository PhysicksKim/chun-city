import { EventInfo } from '@app/v1/types/api';
import React from 'react';

import '@app/styles/tabs/FixtureEventList.scss';

interface EventListProps {
  events: EventInfo[] | undefined;
  isFiltered: boolean;
  handleEventClick: (event: EventInfo) => void;
}

const translateEventType = (type: string, detail?: string): string => {
  const typeLowerCase = type.toLowerCase();
  const detailLowerCase = (detail || '').toLowerCase();

  switch (typeLowerCase) {
    case 'goal':
      return '골';
    case 'card':
      if (detailLowerCase.includes('yellow')) {
        return '경고';
      } else if (detailLowerCase.includes('red')) {
        return '퇴장';
      } else {
        return '카드';
      }
    case 'subst':
      return '교체';
    default:
      return type;
  }
};

const getSubstDisplayText = (event: EventInfo): string => {
  if (event.type.toLowerCase() !== 'subst') {
    return event?.player?.name || '';
  }

  // V1 API에서는 player와 assist를 사용하여 교체 정보 표시
  if (event.player && event.assist) {
    const outName = event.player.name || '';
    const inName = event.assist.name || '';
    return `${outName} → ${inName}`;
  }

  return event?.player?.name || '';
};

const FixtureEventList: React.FC<EventListProps> = ({
  events,
  isFiltered,
  handleEventClick,
}) => {
  return (
    <div
      className={
        `event-filter__${isFiltered ? 'filtered' : 'applied'}-list` +
        ' event-filter-container'
      }
    >
      <h3 className="event-filter__title">
        {isFiltered ? '제외된 이벤트' : '이벤트 리스트'}
      </h3>
      <div className="event-filter__table-wrapper">
        <table className="event-filter__table">
          <thead className="event-filter__thead">
            <tr className="event-filter__legend">
              <th className="event-filter__legend-item event-filter__legend-item--elapsed">
                분
              </th>
              <th className="event-filter__legend-item event-filter__legend-item--type">
                유형
              </th>
              <th className="event-filter__legend-item event-filter__legend-item--team">
                팀
              </th>
              <th className="event-filter__legend-item event-filter__legend-item--player">
                선수
              </th>
            </tr>
          </thead>
          <tbody className="event-filter__body">
            {events &&
              events.map((event, index) => (
                <tr
                  key={`${event.sequence}-${index}`}
                  className={`event-filter__item ${isFiltered ? 'event-filter__item--filtered' : ''}`}
                  onClick={() => handleEventClick(event)}
                >
                  <td className="event-filter__item-detail event-filter__item-detail--elapsed">
                    {event.elapsed}
                    {event.extraTime ? `+${event.extraTime}` : ''}
                  </td>
                  <td className="event-filter__item-detail event-filter__item-detail--type">
                    {translateEventType(event.type, event.detail)}
                  </td>
                  <td className="event-filter__item-detail event-filter__item-detail--team">
                    {event.team.name}
                  </td>
                  <td className="event-filter__item-detail event-filter__item-detail--player">
                    {getSubstDisplayText(event)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FixtureEventList;
