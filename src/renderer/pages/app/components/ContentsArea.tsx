import React from 'react';
import { Route, Routes } from 'react-router-dom';

import SelectFixtureTab from './tabs/fixture/SelectFixtureTab';
import MatchliveControlTab from './tabs/control/MatchliveControlTab';
import DebugTab from './tabs/debug/DebugTab';

import '@app/styles/ContentsArea.scss';
import SettingsTab from './tabs/settings/SettingsTab';

const ContentsArea = () => {
  return (
    <div className="content-area-container">
      <Routes>
        <Route path="/" element={<SelectFixtureTab />} />
        <Route path="/debug-tool" element={<DebugTab />} />
        <Route path="/matchlive-control" element={<MatchliveControlTab />} />
        <Route path="/settings" element={<SettingsTab />} />
      </Routes>
    </div>
  );
};

export default ContentsArea;
