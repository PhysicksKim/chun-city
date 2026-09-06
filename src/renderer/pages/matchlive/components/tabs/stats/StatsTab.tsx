import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { RootState } from '@matchlive/store/store';
import { XgEntry } from '@src/renderer/pages/app/v1/types/api';
import { getPassAccuracy } from '@app/components/processing/ViewStatisticsLogic';
import PassSuccessPieChart from './PassSuccessPieChart';
import {
  selectHomeColor,
  selectAwayColor,
  selectDisplayColor,
} from '@matchlive/utils/ColorUtils';

/**
 * XG 배열에서 가장 큰 elapsed 값의 xg를 반환합니다.
 * 숫자로 변환하여 반환합니다.
 */
const getLatestXg = (xgArray?: XgEntry[]): number | undefined => {
  if (!xgArray || xgArray.length === 0) return undefined;
  const latestEntry = xgArray.reduce((max, entry) =>
    entry.elapsed > max.elapsed ? entry : max
  );
  return parseFloat(latestEntry.xg);
};

interface StatsTabProps {
  isActive: boolean;
}

interface StatRowProps {
  label: string;
  homeValue?: number;
  awayValue?: number;
  isPercentage?: boolean;
  isDecimal?: boolean;
  homeColor: string;
  awayColor: string;
}

const StatRow = ({
  label,
  homeValue,
  awayValue,
  isPercentage,
  isDecimal,
  homeColor,
  awayColor,
}: StatRowProps) => {
  const home = homeValue ?? 0;
  const away = awayValue ?? 0;
  const total = home + away;
  const homePercent = total > 0 ? (home / total) * 100 : 50;
  const awayPercent = total > 0 ? (away / total) * 100 : 50;

  const formatValue = (value: number) => {
    if (isPercentage) return `${value}%`;
    if (isDecimal) return value.toFixed(2);
    return value;
  };

  return (
    <StatRowContainer>
      <StatValue>{formatValue(home)}</StatValue>
      <StatBarSection>
        <StatLabel>{label}</StatLabel>
        <StatBar>
          <StatBarFill $percent={homePercent} $color={homeColor} />
          <StatBarFill $percent={awayPercent} $color={awayColor} />
        </StatBar>
      </StatBarSection>
      <StatValue>{formatValue(away)}</StatValue>
    </StatRowContainer>
  );
};

const StatsTab = ({ isActive }: StatsTabProps) => {
  const statistics = useSelector(
    (state: RootState) => state.fixture.statistics
  );
  const useAlternativeColorStrategy = useSelector(
    (state: RootState) => state.colorOption.useAlternativeColorStrategy
  );

  if (!statistics || !statistics.home || !statistics.away) {
    return (
      <Container $isActive={isActive}>
        <EmptyMessage>아직 통계 데이터가 없습니다</EmptyMessage>
      </Container>
    );
  }

  // statistics.home과 statistics.away는 이미 null이 아님을 확인했지만,
  // teamStatistics가 undefined일 수 있으므로 안전하게 접근
  const homeStats = statistics.home?.teamStatistics;
  const awayStats = statistics.away?.teamStatistics;

  if (!homeStats || !awayStats) {
    return (
      <Container $isActive={isActive}>
        <EmptyMessage>아직 통계 데이터가 없습니다</EmptyMessage>
      </Container>
    );
  }

  // Get colors for charts and bars (always use alternative strategy for bars)
  // statistics.home과 statistics.away는 이미 null 체크 완료
  const homeColor = selectHomeColor(statistics.home.team?.playerColor);
  const awayColor = selectAwayColor(
    statistics.away.team?.playerColor,
    homeColor
  );

  // Get display colors for color bars (respects user option)
  const homeDisplayColor = selectDisplayColor(
    statistics.home.team?.playerColor,
    { useAlternativeStrategy: useAlternativeColorStrategy }
  );
  const awayDisplayColor = selectDisplayColor(
    statistics.away.team?.playerColor,
    {
      isAway: true,
      homeColor: homeDisplayColor || undefined,
      useAlternativeStrategy: useAlternativeColorStrategy,
    }
  );

  const homePassAccuracy = getPassAccuracy(homeStats);
  const awayPassAccuracy = getPassAccuracy(awayStats);

  // XG 값 계산 (가장 큰 elapsed의 xg)
  const homeXg = getLatestXg(homeStats.xg);
  const awayXg = getLatestXg(awayStats.xg);

  return (
    <Container $isActive={isActive}>
      <StatsContent>
        <TeamNames>
          <TeamNameWrapper>
            {homeDisplayColor && (
              <TeamColorBar $color={homeDisplayColor} $side="left" />
            )}
            <TeamName>
              {statistics.home?.team?.name || '홈팀'}
            </TeamName>
          </TeamNameWrapper>
          <TeamNameWrapper>
            <TeamName>
              {statistics.away?.team?.name || '어웨이팀'}
            </TeamName>
            {awayDisplayColor && (
              <TeamColorBar $color={awayDisplayColor} $side="right" />
            )}
          </TeamNameWrapper>
        </TeamNames>

        {/* Pass Success Pie Chart */}
        <StatsSection>
          <PassSuccessPieChart
            homePassSuccess={homePassAccuracy}
            awayPassSuccess={awayPassAccuracy}
            homeColor={homeColor}
            awayColor={awayColor}
          />
        </StatsSection>

        {/* Main Stats */}
        <StatsSection>
          <SectionTitle>주요 스텟</SectionTitle>
          <StatRow
            label="점유율"
            homeValue={homeStats.ballPossession}
            awayValue={awayStats.ballPossession}
            isPercentage
            homeColor={homeColor}
            awayColor={awayColor}
          />
          {(homeXg !== undefined || awayXg !== undefined) && (
            <StatRow
              label="xG"
              homeValue={homeXg}
              awayValue={awayXg}
              isDecimal
              homeColor={homeColor}
              awayColor={awayColor}
            />
          )}
          <StatRow
            label="전체 슈팅"
            homeValue={homeStats.totalShots}
            awayValue={awayStats.totalShots}
            homeColor={homeColor}
            awayColor={awayColor}
          />
          <StatRow
            label="유효 슈팅"
            homeValue={homeStats.shotsOnGoal}
            awayValue={awayStats.shotsOnGoal}
            homeColor={homeColor}
            awayColor={awayColor}
          />
          <StatRow
            label="코너킥"
            homeValue={homeStats.cornerKicks}
            awayValue={awayStats.cornerKicks}
            homeColor={homeColor}
            awayColor={awayColor}
          />
          <StatRow
            label="오프사이드"
            homeValue={homeStats.offsides}
            awayValue={awayStats.offsides}
            homeColor={homeColor}
            awayColor={awayColor}
          />
          <StatRow
            label="파울"
            homeValue={homeStats.fouls}
            awayValue={awayStats.fouls}
            homeColor={homeColor}
            awayColor={awayColor}
          />
          <StatRow
            label="옐로카드"
            homeValue={homeStats.yellowCards}
            awayValue={awayStats.yellowCards}
            homeColor={homeColor}
            awayColor={awayColor}
          />
          <StatRow
            label="레드카드"
            homeValue={homeStats.redCards}
            awayValue={awayStats.redCards}
            homeColor={homeColor}
            awayColor={awayColor}
          />
          <StatRow
            label="세이브"
            homeValue={homeStats.goalkeeperSaves}
            awayValue={awayStats.goalkeeperSaves}
            homeColor={homeColor}
            awayColor={awayColor}
          />
        </StatsSection>

        {/* Detail Stats */}
        <StatsSection>
          <SectionTitle>세부 스텟</SectionTitle>
          <StatRow
            label="빗나간 슈팅"
            homeValue={homeStats.shotsOffGoal}
            awayValue={awayStats.shotsOffGoal}
            homeColor={homeColor}
            awayColor={awayColor}
          />
          <StatRow
            label="차단된 슈팅"
            homeValue={homeStats.blockedShots}
            awayValue={awayStats.blockedShots}
            homeColor={homeColor}
            awayColor={awayColor}
          />
          <StatRow
            label="박스 안 슈팅"
            homeValue={homeStats.shotsInsideBox}
            awayValue={awayStats.shotsInsideBox}
            homeColor={homeColor}
            awayColor={awayColor}
          />
          <StatRow
            label="박스 밖 슈팅"
            homeValue={homeStats.shotsOutsideBox}
            awayValue={awayStats.shotsOutsideBox}
            homeColor={homeColor}
            awayColor={awayColor}
          />
          <StatRow
            label="전체 패스"
            homeValue={homeStats.totalPasses}
            awayValue={awayStats.totalPasses}
            homeColor={homeColor}
            awayColor={awayColor}
          />
          <StatRow
            label="성공한 패스"
            homeValue={homeStats.passesAccurate}
            awayValue={awayStats.passesAccurate}
            homeColor={homeColor}
            awayColor={awayColor}
          />
          {/* Goals Prevented 값은 현재 Data Provider에서 정상적으로 제공되지 않는 것으로 보입니다 */}
          {/* {(homeStats.goalsPrevented !== undefined ||
            awayStats.goalsPrevented !== undefined) && (
            <StatRow
              label="골 방지"
              homeValue={homeStats.goalsPrevented}
              awayValue={awayStats.goalsPrevented}
              homeColor={homeColor}
              awayColor={awayColor}
            />
          )} */}
        </StatsSection>
      </StatsContent>
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

const StatsContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: clamp(12px, 3vw, 24px);
`;

const TeamNames = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 clamp(4px, 2vw, 16px);
  margin-bottom: 8px;
`;

const TeamNameWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const TeamName = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  text-shadow: none;
`;

const TeamColorBar = styled.div<{ $color: string; $side: 'left' | 'right' }>`
  position: absolute;
  ${({ $side }) => ($side === 'left' ? 'left: -8px;' : 'right: -8px;')}
  width: 4px;
  height: 100%;
  background-color: ${({ $color }) => $color};
  ${({ $color }) =>
    $color && $color.toLowerCase().replace('#', '') === 'ffffff'
      ? 'box-shadow: inset 0 0 0 1px rgba(128, 128, 128, 0.5);'
      : ''}
`;

const StatsSection = styled.div`
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: clamp(8px, 3vw, 20px);
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 2vw, 16px);
`;

const SectionTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
`;

const StatRowContainer = styled.div`
  display: grid;
  grid-template-columns: minmax(30px, 60px) 1fr minmax(30px, 60px);
  align-items: center;
  gap: clamp(4px, 2vw, 16px);
`;

const StatValue = styled.div`
  font-size: clamp(12px, 2vw, 16px);
  font-weight: 700;
  color: #111;
  text-align: center;
`;

const StatBarSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: #555;
  text-align: center;
  font-weight: 600;
`;

const StatBar = styled.div`
  height: 8px;
  background: #eee;
  border-radius: 4px;
  display: flex;
  overflow: hidden;
`;

const StatBarFill = styled.div<{ $percent: number; $color: string }>`
  height: 100%;
  width: ${(props) => props.$percent}%;
  background: ${(props) => props.$color};
  transition: width 0.5s ease;
`;

export default StatsTab;
