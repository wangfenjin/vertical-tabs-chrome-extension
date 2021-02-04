import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Media from 'react-media';

import Sidebar from './Sidebar';
import './index.css';

import DarkModeContext from './context/dark-mode-context';

const App = () => {
  const [isDark, setIsDark] = useState(false);
  const [mediaQueryDark, setMediaQueryDark] = useState(false);
  const [darkModeSetting, setDarkModeSetting] = useState(null);

  const setDarkStatus = (dark) => {
    setIsDark(dark);
    if (dark) {
      document.body.classList.add('Dark');
    } else {
      document.body.classList.remove('Dark');
    }
  };

  useEffect(() => {
    chrome.storage.sync.get(['darkMode'], (result) => {
      if (result.darkMode !== undefined) {
        setDarkModeSetting(result.darkMode);
      } else {
        setDarkModeSetting('auto');
      }
    });

    // sync settings across tabs
    // chrome.runtime.onMessage.addListener((request, sender, response) => {
    //   if (
    //     request.from === 'background' &&
    //     request.msg === 'UPDATE_DARK_MODE_STATUS'
    //   ) {
    //     const { toStatus } = request;
    //     setDarkModeSetting(toStatus);
    //   }
    // });
  }, []);

  if (darkModeSetting === null) {
    return null;
  }

  return (
    <React.Fragment>
      <DarkModeContext.Provider
        value={{ mediaQueryDark, isDark, setDarkStatus }}
      >
        <Media
          query="(prefers-color-scheme: dark)"
          onChange={(dark) => {
            setMediaQueryDark(dark);
            if (darkModeSetting === 'auto') {
              setDarkStatus(dark);
            }
          }}
        />
        <DndProvider backend={HTML5Backend}>
          <Sidebar />
        </DndProvider>
      </DarkModeContext.Provider>
    </React.Fragment>
  );
};

render(<App />, window.document.querySelector('#app-container'));
