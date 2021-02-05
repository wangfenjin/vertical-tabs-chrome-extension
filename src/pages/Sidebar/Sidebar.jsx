import React, { Component } from 'react';
import classNames from 'classnames';
import update from 'immutability-helper';
import DarkModeContext from './context/dark-mode-context';
import { sortBy } from 'lodash';

import Title from './containers/Title/Title';
import TabsList from './containers/TabsList/TabsList';

import { getFavicon, getAltFavicon } from '../../shared/utils';

// import UpdateNotice from '../Content/modules/UpdateNotice/UpdateNotice';

import './Sidebar.css';

class Sidebar extends Component {
  state = {
    tabOrders: [],
    activeTab: {},
    tabsDict: {},

    displayTabInFull: true,
  };

  constructor(props) {
    super(props);

    this.interval = null;
    this.sidebarOpen = true;
    // this.tabCreatedHandler = this.handleTabCreated.bind(this);
    // this.tabRemovedHandler = this.handleTabRemoved.bind(this);
    // this.tabUpdatedHandler = this.handleTabUpdated.bind(this);
    // this.tabMovedHandler = this.handleTabMoved.bind(this);
    // this.tabActivatedHandler = this.handleTabActivated.bind(this);
    // this.tabHighlightedHandler = this.handleTabHighlighted.bind(this);

    // chrome.tabs.onCreated.addListener(this.tabCreatedHandler);
    // chrome.tabs.onRemoved.addListener(this.tabRemovedHandler);
    // chrome.tabs.onUpdated.addListener(this.tabUpdatedHandler);
    // chrome.tabs.onMoved.addListener(this.tabMovedHandler);
    // chrome.tabs.onActivated.addListener(this.tabActivatedHandler);
    // chrome.tabs.onHighlighted.addListener(this.tabHighlightedHandler);
  }

  componentDidMount() {
    this.retrieveTabs();

    this.interval = setInterval(this.retrieveTabs, 1000); // <- time in ms

    // window.addEventListener('keydown', (event) => {
    //   if (
    //     (event.ctrlKey && event.key === '`') ||
    //     (event.ctrlKey && event.key === 'Escape') ||
    //     (event.metaKey && event.key === 'Escape') ||
    //     (event.altKey && event.key === '`') ||
    //     (event.altKey && event.key === 'Escape')
    //   ) {
    //     chrome.runtime.sendMessage({
    //       from: 'content',
    //       msg: 'REQUEST_TOGGLE_SIDEBAR',
    //     });
    //   }
    // });

    // sync scroll positions
    // window.addEventListener('scroll', this.handleScroll, false);
    // chrome.runtime.sendMessage(
    //   {
    //     from: 'sidebar',
    //     msg: 'REQUEST_SIDEBAR_SCROLL_POSITION',
    //   },
    //   (response) => {
    //     window.scroll(response.scrollPositionX, response.scrollPositionY);
    //   }
    // );

    // safari.self.addEventListener("message", handleMessage, false);
    // function handleMessage(msgEvent) {
    //   console.log("receive msg, ", msgEvent);
    // }

    // chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    //   if (request.from === 'background') {
    //     if (request.msg === 'UPDATE_SIDEBAR_SCROLL_POSITION') {
    //       window.scroll(request.scrollPositionX, request.scrollPositionY);
    //     } else if (request.msg === 'TABS_ONCREATED') {
    //       this.handleTabCreated(request.tabId);
    //     }
    //   }
    // });
  }

  componentWillUnmount() {
    // chrome.tabs.onCreated.removeListener(this.tabCreatedHandler);
    // chrome.tabs.onRemoved.removeListener(this.tabRemovedHandler);
    // chrome.tabs.onUpdated.removeListener(this.tabUpdatedHandler);
    // chrome.tabs.onMoved.removeListener(this.tabMovedHandler);
    // chrome.tabs.onActivated.removeListener(this.tabActivatedHandler);
    // chrome.tabs.onHighlighted.removeListener(this.tabHighlightedHandler);

    // window.removeEventListener('scroll', this.handleScroll);

    console.log('componentWillUnmount');
    clearInterval(this.interval);
  }

  retrieveTabs = () => {
    if (document.hidden) {
      return;
    }
    // check before query tabs...
    if (this.state.tabOrders.length > 0) {
      chrome.storage.sync.get(['sidebarOpen'], (result) => {
        if (result.sidebarOpen !== undefined) {
          this.sidebarOpen = result.sidebarOpen === true;
        }
      });
      if (!this.sidebarOpen) {
        return;
      }
    }
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      const tabsDict = {};
      let tabOrders = [];
      tabs.forEach((tab) => {
        tab.faviconUrl = getFavicon(tab.url);
        const faviconAltUrl = getAltFavicon(tab.url);
        tabsDict[tab.id] = {
          faviconUrl: tab.faviconUrl,
          faviconAltUrl: faviconAltUrl,
          title: tab.title,
          url: tab.url,
          pinned: tab.pinned,
          status: 'complete',
          combinedText: [
            tab.title, // title
            tab.url !== '' ? new URL(tab.url).hostname.replace('www.', '') : '', // hostname
          ]
            .join(' ')
            .toLowerCase(),
          mutedInfo: tab.mutedInfo,
          audible: tab.audible,
          openerTabId: tab.openerTabId,
        };

        tabOrders.push({
          id: tab.id,
          index: tab.index,
          active: tab.active,
        });
        if (tab.active) {
          this.setState({
            activeTab: {
              id: tab.id,
              index: tab.index,
              active: tab.active,
            },
          });
        }
      });
      tabOrders = sortBy(tabOrders, ['index']);
      this.setState({ tabOrders, tabsDict });
    });
  };

  // handleScroll = (event) => {
  //   // https://gomakethings.com/detecting-when-a-visitor-has-stopped-scrolling-with-vanilla-javascript/
  //   // Clear our timeout throughout the scroll
  //   window.clearTimeout(this.isScrolling);

  //   // Set a timeout to run after scrolling ends
  //   this.isScrolling = setTimeout(function () {
  //     chrome.runtime.sendMessage({
  //       from: 'sidebar',
  //       msg: 'SIDEBAR_SCROLL_POSITION_CHANGED',
  //       scrollPositionX: window.pageXOffset,
  //       scrollPositionY: window.pageYOffset,
  //     });
  //   }, 66);
  // };

  updateTabsDictWithTab = (
    tab,
    favicon = getFavicon('https://www.google.com')
  ) => {
    let tabsDict = { ...this.state.tabsDict };
    tabsDict[tab.id] = {
      faviconUrl: favicon,
      title: tab.title,
      url: tab.url,
      pinned: tab.pinned,
      status: tab.status,
      combinedText: [
        tab.title, // title
        tab.url !== '' ? new URL(tab.url).hostname.replace('www.', '') : '', // hostname
      ]
        .join(' ')
        .toLowerCase(),
      mutedInfo: tab.mutedInfo,
      audible: tab.audible,
      openerTabId: tab.openerTabId,
    };
    this.setState({ tabsDict });
  };

  setTabAsLoading = (tabId) => {
    let tabsDict = { ...this.state.tabsDict };
    let targetTab = tabsDict[tabId];
    tabsDict[tabId] = {
      ...targetTab,
      status: 'loading',
    };
    this.setState({ tabsDict });
  };

  updateTabOrders = () => {
    chrome.tabs.query({ currentWindow: true }, (tabs) => {
      let tabOrders = [];
      tabs.forEach((tab) => {
        let tabObj = {
          id: tab.id,
          index: tab.index,
          active: tab.active,
        };
        tabOrders.push(tabObj);
        if (tab.active) {
          this.setState({ activeTab: tabObj });
        }
      });
      tabOrders = sortBy(tabOrders, ['index']);
      this.setState({ tabOrders });
    });
  };

  handleTabCreated = (tab) => {
    this.updateTabsDictWithTab(tab);
    this.updateTabOrders();
  };

  handleTabUpdated = (tabId, changes, tab) => {
    if (
      changes.status === 'complete' ||
      changes.title ||
      changes.pinned === true ||
      changes.pinned === false ||
      changes.mutedInfo ||
      changes.audible !== undefined
    ) {
      this.updateTabsDictWithTab(tab, getFavicon(tab.url));
      if (changes.status === 'complete') {
        setTimeout(() => {
          this.updateTabsDictWithTab(tab, getFavicon(tab.url));
        }, 5000);
      }
    }
  };

  handleTabRemoved = (tabId) => {
    this.setState((prevState) => {
      let tabsDict = { ...prevState.tabsDict };
      delete tabsDict[tabId];
      return {
        tabsDict,
      };
    });

    this.updateTabOrders();
  };

  handleTabMoved = (tabId) => {
    this.updateTabOrders();
  };

  handleTabActivated = (activeInfo) => {
    this.updateTabOrders();
  };

  handleTabHighlighted = (highlightInfo) => {};

  moveTab = (dragIndex, hoverIndex) => {
    const dragTab = this.state.tabOrders[dragIndex];
    this.setState({
      tabOrders: update(this.state.tabOrders, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragTab],
        ],
      }),
    });
  };

  setDisplayTabInFull = (toStatus) => {
    this.setState({ displayTabInFull: toStatus });
  };

  render() {
    const { tabOrders, activeTab, tabsDict, displayTabInFull } = this.state;

    return (
      <DarkModeContext.Consumer>
        {(darkModeContext) => {
          return (
            <div
              className={classNames({
                SidebarContainer: true,
                Dark: darkModeContext.isDark,
              })}
            >
              <Title setDisplayTabInFull={this.setDisplayTabInFull} />
              <TabsList
                displayTabInFull={displayTabInFull}
                tabOrders={tabOrders}
                activeTab={activeTab}
                tabsDict={tabsDict}
                moveTab={this.moveTab}
                setTabAsLoading={this.setTabAsLoading}
              />
              {/* <UpdateNotice /> */}
            </div>
          );
        }}
      </DarkModeContext.Consumer>
    );
  }
}

export default Sidebar;
