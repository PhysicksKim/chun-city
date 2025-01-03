import { BrowserWindow, Menu, app } from 'electron';
import path from 'path';
import log from 'electron-log';

import { AppState } from './AppState';
import {
  setupMainWindowIpcMainHandlers,
  setupMatchliveIpcMainHandlers,
} from './ipcManager';
import { resolveHtmlPath } from './util';
import { getMatchliveWindowSize } from './store/DefaultSettingData';

type AppWindow = BrowserWindow | null;

/**
 * 각 윈도우는 싱글톤으로 관리합니다.
 * create___Window 메서드를 통해 윈도우를 생성하거나 이전에 생성된 윈도우를 focus 합니다.
 */
class WindowManager {
  static instance: WindowManager;

  mainWindow: AppWindow = null;
  matchliveWindow: AppWindow = null;
  updatecheckerWindow: AppWindow = null;

  static getInstance() {
    if (!WindowManager.instance) {
      WindowManager.instance = new WindowManager();
    }
    return WindowManager.instance;
  }

  /**
   * App window 를 생성하고 열거나, 이전에 생성되어 있다면 창을 focus 합니다.
   * @returns BrowserWindow 객체
   */
  async createMainWindow() {
    if (this.mainWindow) {
      this.mainWindow.focus();
      return this.mainWindow;
    }

    this.mainWindow = new BrowserWindow({
      show: false,
      width: 800,
      height: 600,
      minWidth: 800,
      minHeight: 600,
      icon: this.getAssetPath('icon.png'),
      frame: false,
      webPreferences: {
        contextIsolation: true,
        backgroundThrottling: false,
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
      },
      movable: true,
    });

    this.mainWindow.menuBarVisible = false;
    Menu.setApplicationMenu(null);
    this.mainWindow.loadURL(resolveHtmlPath('index.html'));

    this.mainWindow.on('ready-to-show', () => {
      if (process.env.START_MINIMIZED === 'false') {
        this.mainWindow?.minimize();
      } else {
        this.mainWindow?.show();
      }
    });

    this.mainWindow.on('closed', () => {
      if (AppState.isUpdateInProgress) {
        AppState.isQuitInitiated = true;
        this.mainWindow?.webContents.send('to-app', {
          type: 'UPDATE_IN_PROGRESS',
        });
      } else {
        app.quit();
      }
      this.mainWindow = null;
    });

    setupMainWindowIpcMainHandlers(this.mainWindow);
    return this.mainWindow;
  }

  /**
   * Matchlive window 를 생성하고 열거나, 이전에 생성되어 있다면 창을 focus 합니다.
   * @returns BrowserWindow 객체
   */
  async createMatchliveWindow() {
    if (this.matchliveWindow) {
      this.matchliveWindow.focus();
      return this.matchliveWindow;
    }

    const { height, width } = await getMatchliveWindowSize();
    this.matchliveWindow = new BrowserWindow({
      width,
      height,
      resizable: true,
      transparent: true,
      frame: false,
      webPreferences: {
        contextIsolation: true,
        backgroundThrottling: false,
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
      },
      movable: true,
    });

    this.matchliveWindow.loadURL(resolveHtmlPath('matchlive.html'));

    this.matchliveWindow.on('ready-to-show', () => {
      this.matchliveWindow?.show();
    });

    this.matchliveWindow.on('closed', () => {
      this.matchliveWindow = null;
      this.mainWindow?.webContents.send('to-app', {
        type: 'MATCHLIVE_WINDOW_CLOSED',
      });
    });

    setupMatchliveIpcMainHandlers(this.matchliveWindow);
    return this.matchliveWindow;
  }

  /**
   * Update checker window 를 생성하고 열거나, 이전에 생성되어 있다면 창을 focus 합니다.
   * @returns BrowserWindow 객체
   */
  async createUpdatecheckerWindow() {
    if (this.updatecheckerWindow) {
      this.updatecheckerWindow.focus();
      return this.updatecheckerWindow;
    }

    if (!this.mainWindow) {
      log.error('Main window is required for update checker window');
      throw new Error('Main window is required for update checker window');
    }

    this.updatecheckerWindow = new BrowserWindow({
      width: 300,
      height: 200,
      resizable: false,
      parent: this.mainWindow,
      frame: false,
      transparent: true,
      webPreferences: {
        contextIsolation: true,
        backgroundThrottling: false,
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
      },
      movable: true,
    });

    this.updatecheckerWindow.loadURL(resolveHtmlPath('updatechecker.html'));

    this.updatecheckerWindow.on('ready-to-show', () => {
      this.updatecheckerWindow?.show();
    });

    this.updatecheckerWindow.on('closed', () => {
      this.updatecheckerWindow = null;
      this.mainWindow?.webContents.send('to-app', {
        type: 'AUTO_UPDATER_WINDOW_CLOSED',
      });
    });

    return this.updatecheckerWindow;
  }

  /**
   * Asset 폴더 내의 파일 경로를 반환합니다. dev 환경과 packaged 환경에 따라 적절한 경로를 반환합니다.
   * @param paths 얻고자 하는 파일의 경로 (예: 'icon.png')
   * @returns 파일의 절대 경로.
   */
  private getAssetPath(...paths: string[]) {
    const RESOURCES_PATH = app.isPackaged
      ? path.join(process.resourcesPath, 'assets')
      : path.join(__dirname, '../../assets');
    return path.join(RESOURCES_PATH, ...paths);
  }
}

export default WindowManager;
