import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

import Header from './Header';
import LineupTab from './tabs/lineup/LineupTab';
import StatsTab from './tabs/stats/StatsTab';
import EventsTab from './tabs/events/EventsTab';
import { GlobalBorderRadiusPx } from './common/StyleConstant';

export type ActiveTab = 'lineup' | 'stats' | 'events';

const Layout = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('lineup');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const activeTabRef = useRef(activeTab);

  const switchToNextTab = () => {
    setActiveTab((current) => {
      if (current === 'lineup') return 'stats';
      if (current === 'stats') return 'events';
      return 'lineup';
    });
  };

  const switchToPrevTab = () => {
    setActiveTab((current) => {
      if (current === 'lineup') return 'events';
      if (current === 'stats') return 'lineup';
      return 'stats'; // events -> stats
    });
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      if (event.shiftKey) {
        switchToPrevTab();
      } else {
        switchToNextTab();
      }
    } else if (event.key === 'Escape') {
      setActiveTab('lineup');
      setIsHelpOpen(false);
    } else if (event.key === '1') {
      setActiveTab('lineup');
    } else if (event.key === '2') {
      setActiveTab('stats');
    } else if (event.key === '3') {
      setActiveTab('events');
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  return (
    <LayoutContainer>
      {/* Lineup is always rendered in background */}
      <LineupBackground $isBlurred={activeTab !== 'lineup'}>
        <LineupTab isActive={activeTab === 'lineup'} />
      </LineupBackground>

      {/* Stats and Events tabs overlay with header */}
      {activeTab !== 'lineup' ? (
        <TabsContainer>
          <Header
            activeTab={activeTab}
            onTabChange={setActiveTab}
            $isAbsolute={false}
          />
          <TabPane
            $active={activeTab === 'stats'}
            $isActive={activeTab === 'stats'}
          >
            <StatsTab isActive={activeTab === 'stats'} />
          </TabPane>
          <TabPane
            $active={activeTab === 'events'}
            $isActive={activeTab === 'events'}
          >
            <EventsTab isActive={activeTab === 'events'} />
          </TabPane>
          <BottomShadow />
        </TabsContainer>
      ) : null}

      <OverlayControls>
        <OverlayControlButton
          type="button"
          aria-label="다음 탭으로 전환"
          title="다음 탭 (Tab)"
          onClick={switchToNextTab}
        >
          ↹
        </OverlayControlButton>
        <OverlayControlButton
          type="button"
          aria-label="단축키 도움말"
          onMouseEnter={() => setIsHelpOpen(true)}
          onMouseLeave={() => setIsHelpOpen(false)}
        >
          ?
        </OverlayControlButton>
        {isHelpOpen && (
          <HelpPopover>
            <HelpRow>
              <kbd>Tab</kbd> 다음 화면
            </HelpRow>
            <HelpRow>
              <kbd>Shift + Tab</kbd> 이전 화면
            </HelpRow>
            <HelpRow>
              <kbd>Esc</kbd> 라인업으로
            </HelpRow>
          </HelpPopover>
        )}
      </OverlayControls>
    </LayoutContainer>
  );
};

const LayoutContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  border-radius: ${GlobalBorderRadiusPx}px;
  overflow: hidden;
`;

const LineupBackground = styled.div<{ $isBlurred: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: ${GlobalBorderRadiusPx}px;
  overflow: hidden;
  filter: ${(props) => (props.$isBlurred ? 'blur(8px)' : 'blur(0px)')};
  transition: filter 0.3s ease;
`;

const TabsContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  overflow: hidden;
`;

const TabPane = styled.div<{ $active: boolean; $isActive: boolean }>`
  grid-row: 2;
  grid-column: 1;
  opacity: ${(props) => (props.$active ? 1 : 0)};
  display: flex;
  flex-direction: column;
  min-height: 0;
  visibility: ${({ $isActive }) => ($isActive ? 'visible' : 'hidden')};
  pointer-events: ${({ $isActive }) => ($isActive ? 'auto' : 'none')};
  background: rgba(0, 0, 0, 0.4);
`;

const BottomShadow = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 10px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent);
`;

const OverlayControls = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 110;
  display: flex;
  gap: 4px;
  -webkit-app-region: no-drag;
  pointer-events: all;
`;

const OverlayControlButton = styled.button`
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.65);
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
  }
`;

const HelpPopover = styled.div`
  position: absolute;
  top: 34px;
  right: 0;
  min-width: 152px;
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 7px;
  background: rgba(15, 23, 42, 0.72);
  color: rgba(255, 255, 255, 0.85);
  font-size: 11px;
  line-height: 1.7;
`;

const HelpRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;

  kbd {
    color: #fff;
    font-family: inherit;
    font-weight: 600;
  }
`;

export default Layout;
