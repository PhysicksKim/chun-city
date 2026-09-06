import React, { forwardRef } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { format, addDays, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FixtureByLeagueResponse } from '@app/v1/types/api';
import FixtureItem from './FixtureItem';
import { FixtureMode } from '@app/v1/api/endpoints';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fetchFixtureDatesByLeague } from '@app/v1/api/endpoints';
import { getCalendarDateRange } from '@app/v1/utils/date';
import {
  faChevronLeft,
  faChevronRight,
  faCalendarDays,
  faCircleNotch,
} from '@fortawesome/free-solid-svg-icons';

// Register Korean locale
registerLocale('ko', ko);

interface FixtureListProps {
  fixtures: FixtureByLeagueResponse[];
  leagueUid?: string;
  selectedDate: string; // YYYY-MM-DD
  timezone: string;
  loading: boolean;
  onRequestFetch: (date: string, mode: FixtureMode) => void;
}

const FixtureList = ({
  fixtures,
  leagueUid,
  selectedDate,
  timezone,
  loading,
  onRequestFetch,
}: FixtureListProps) => {
  // 내부적으로 표시할 날짜 상태 관리
  const [internalDate, setInternalDate] = React.useState(selectedDate);
  const [fixtureDates, setFixtureDates] = React.useState<Set<string> | null>(
    null
  );

  const listBoxRef = React.useRef<HTMLDivElement>(null);

  // 스크롤 상태 관리용 ref들
  const savedScrollTopRef = React.useRef<number>(0);
  const isRestoringScrollRef = React.useRef<boolean>(false);
  const prevDateRef = React.useRef<string>(selectedDate);
  const prevLoadingRef = React.useRef<boolean>(loading);

  /**
   * selectedDate prop 변경 시:
   *  - 내부 날짜 상태 동기화
   *  - 실제로 날짜가 바뀐 경우에만 스크롤 상태 초기화
   */
  React.useEffect(() => {
    setInternalDate(selectedDate);

    if (prevDateRef.current !== selectedDate) {
      prevDateRef.current = selectedDate;
      savedScrollTopRef.current = 0;

      if (listBoxRef.current) {
        listBoxRef.current.scrollTop = 0;
      }
    }
  }, [selectedDate]);

  React.useEffect(() => {
    setFixtureDates(null);
  }, [leagueUid]);

  /**
   * 사용자가 스크롤할 때 현재 위치 저장
   * - loading 중이거나, 우리가 복원 중일 때는 무시
   */
  const handleScroll = React.useCallback(() => {
    if (!listBoxRef.current) return;
    if (loading) return;
    if (isRestoringScrollRef.current) return;

    savedScrollTopRef.current = listBoxRef.current.scrollTop;
  }, [loading]);

  /**
   * loading 상태 변화를 감지하여,
   * true -> false 전환 시 스크롤 복원
   */
  React.useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = loading;

    // 로딩이 끝난 시점에만 복원 시도
    if (
      wasLoading &&
      !loading &&
      listBoxRef.current &&
      savedScrollTopRef.current > 0
    ) {
      const target = savedScrollTopRef.current;
      isRestoringScrollRef.current = true;

      // DOM 업데이트 후 스크롤 복원
      requestAnimationFrame(() => {
        if (listBoxRef.current) {
          listBoxRef.current.scrollTop = target;
        }

        // 복원으로 인해 발생하는 scroll 이벤트가 한 번 더 돌 수 있으므로,
        // 한 프레임 더 넘긴 다음에 restoring 플래그 해제
        requestAnimationFrame(() => {
          isRestoringScrollRef.current = false;
        });
      });
    }
  }, [loading]);

  const handlePrevious = () => {
    const prevDate = format(addDays(parseISO(selectedDate), -1), 'yyyy-MM-dd');
    onRequestFetch(prevDate, 'previous');
  };

  const handleNext = () => {
    const nextDate = format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd');
    onRequestFetch(nextDate, 'nearest');
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const newDate = format(date, 'yyyy-MM-dd');
      setInternalDate(newDate);
      onRequestFetch(newDate, 'exact');
    }
  };

  const loadFixtureDates = React.useCallback(
    async (month: Date) => {
      if (!leagueUid) return;

      const { startDate, endDate } = getCalendarDateRange(month);
      try {
        const { dates } = await fetchFixtureDatesByLeague({
          leagueUid,
          startDate,
          endDate,
          timezone,
        });
        setFixtureDates(new Set(dates));
      } catch (error) {
        console.error('Failed to fetch fixture dates', error);
      }
    },
    [leagueUid, timezone]
  );

  const fixtureDateClassName = React.useCallback(
    (date: Date) => {
      if (!fixtureDates) return '';
      return fixtureDates.has(format(date, 'yyyy-MM-dd'))
        ? 'fixture-date--has-match'
        : 'fixture-date--no-match';
    },
    [fixtureDates]
  );

  const formattedDate = parseISO(internalDate);
  const yearMonth = format(formattedDate, 'yyyy.MM');
  const dayOfWeek = format(formattedDate, 'dd EEE', { locale: ko }) + '요일';
  const dayName = format(formattedDate, 'EEE', { locale: ko });

  const getDayColor = () => {
    if (dayName === '토') return '#5a4fff';
    if (dayName === '일') return '#e85a5a';
    return '#cccccc';
  };

  // Custom input component for DatePicker
  // eslint-disable-next-line react/display-name
  const CustomDateInput = forwardRef<HTMLDivElement, any>(
    ({ onClick }, ref) => (
      <DateDisplay onClick={onClick} ref={ref} $dayColor={getDayColor()}>
        <DateText>{dayOfWeek}</DateText>
        <CalendarIcon icon={faCalendarDays} />
      </DateDisplay>
    )
  );

  // 정렬 로직 메모이제이션
  const sortedFixtures = React.useMemo(
    () =>
      [...fixtures].sort((a, b) => {
        // 1. kickoff 빠른 순 (시간 순서)
        const kickoffA = new Date(a.kickoff).getTime();
        const kickoffB = new Date(b.kickoff).getTime();
        if (kickoffA !== kickoffB) {
          return kickoffA - kickoffB;
        }
        // 2. uid 오름차순
        return a.uid.localeCompare(b.uid);
      }),
    [fixtures]
  );

  return (
    <Container>
      <DatePickerStyles />
      <Header>
        <YearMonth>{yearMonth}</YearMonth>
        <ControlBar>
          <NavButton onClick={handlePrevious}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </NavButton>

          <DatePickerWrapper>
            <DatePicker
              selected={formattedDate}
              onChange={handleDateChange}
              customInput={<CustomDateInput />}
              locale="ko"
              dateFormat="yyyy-MM-dd"
              popperPlacement="bottom"
              enableTabLoop={false}
              dayClassName={fixtureDateClassName}
              onCalendarOpen={() => void loadFixtureDates(formattedDate)}
              onMonthChange={(month) => void loadFixtureDates(month)}
            />
          </DatePickerWrapper>

          <NavButton onClick={handleNext}>
            <FontAwesomeIcon icon={faChevronRight} />
          </NavButton>
        </ControlBar>
      </Header>

      <ListBox ref={listBoxRef} onScroll={handleScroll}>
        {loading ? (
          <Message>
            <LoadingIcon icon={faCircleNotch} spin />
            경기 정보를 불러오는 중...
          </Message>
        ) : fixtures.length === 0 ? (
          <Message>경기가 없습니다.</Message>
        ) : (
          sortedFixtures.map((fixture) => (
            <FixtureItem key={fixture.uid} fixture={fixture} />
          ))
        )}
      </ListBox>
    </Container>
  );
};

export default FixtureList;

const DatePickerStyles = createGlobalStyle`
  .react-datepicker {
    font-family: inherit !important;
    background-color: #21252b !important;
    border: 1px solid #3e4451 !important;
    border-radius: 12px !important;
    color: #fff !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5) !important;
  }

  .react-datepicker__header {
    background-color: #21252b !important;
    border-bottom: 1px solid #3e4451 !important;
    border-top-left-radius: 12px !important;
    border-top-right-radius: 12px !important;
    padding: 4px 0;
  }

  .react-datepicker__current-month {
    color: #fff !important;
    font-weight: 600 !important;
    margin-top: 5px !important;
    margin-bottom: 2px !important;
    font-size: 15px !important;
  }

  .react-datepicker__day-name {
    color: #abb2bf !important;
    width: 32px !important;
    line-height: 28px !important;
    margin: 0.166rem !important;
    
    &:first-child {
      color: #e85a5a !important;
    }
    
    &:last-child {
      color: #5a4fff !important;
    }
  }

  .react-datepicker__day {
    color: #fff !important;
    width: 32px !important;
    line-height: 28px !important;
    margin: 0.166rem !important;
    border-radius: 6px !important;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.1) !important;
      border-radius: 6px !important;
    }

    &.fixture-date--has-match {
      color: #fff !important;
    }

    &.fixture-date--no-match {
      color: #777786 !important;
    }
  }

  .react-datepicker__day--selected, 
  .react-datepicker__day--keyboard-selected {
    background-color: #3b77d1 !important;
    border-radius: 6px !important;
    color: #fff !important;
    font-weight: 600 !important;
    
    &:hover {
      background-color: #2a5cb3 !important;
    }
  }

  .react-datepicker__day--disabled {
    color: #5c6370 !important;
    cursor: not-allowed !important;
    
    &:hover {
      background-color: transparent !important;
    }
  }
  
  .react-datepicker__day--outside-month {
    color: #4b5263 !important;
  }

  .react-datepicker__navigation-icon::before {
    border-color: #abb2bf !important;
    border-width: 2px 2px 0 0 !important;
    width: 5px !important;
    height: 5px !important;
    top: 8px !important;
  }

  .react-datepicker__navigation:hover *::before {
    border-color: #fff !important;
  }
  
  .react-datepicker__triangle {
    display: none !important;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  flex: 1;
  min-height: 0;
  overflow: visible;
  padding-left: 30px;
  padding-right: 20px;
  box-sizing: border-box;
  margin-top: 30px;
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
`;

const YearMonth = styled.div`
  font-size: 18px;
  font-weight: 400;
  padding-bottom: 1px;
  color: white;
`;

const ControlBar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 400px;
  margin-top: 1px;
`;

const NavButton = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
`;

const DatePickerWrapper = styled.div`
  position: relative;
  z-index: 10;
`;

const DateDisplay = styled.div<{ $dayColor: string }>`
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 8px;
  position: relative;
  color: ${({ $dayColor }) => $dayColor};
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid transparent;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const DateText = styled.span``;

const CalendarIcon = styled(FontAwesomeIcon)`
  font-size: 14px;
  opacity: 0.7;
`;

const ListBox = styled.div`
  flex: 1;
  min-height: 0;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.05);
  padding: 17px 20px;
  box-sizing: border-box;
  border-radius: 10px;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #3e4451;
    border-radius: 5px;
  }
  &::-webkit-scrollbar-track {
    background-color: #282c34;
    border-radius: 5px;
  }
`;

const Message = styled.div`
  width: 100%;
  text-align: center;
  color: #9d9d9d;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const LoadingIcon = styled(FontAwesomeIcon)`
  font-size: 16px;
  color: #9d9d9d;
`;
