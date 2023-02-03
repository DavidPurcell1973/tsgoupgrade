import Config from 'react-native-config';
import moment from 'moment';
import isArray from 'lodash/isArray';
import {orderBy, uniqBy, uniqWith} from 'lodash';
import * as types from '../../actions/appStore/appStoreActions';
import initialState from '../initialState';
import {
  displayApiErrorToast,
  displayToast,
  resetStoreAsync,
} from '../../helpers/utils';
import logger from '../../helpers/logger';

export const appSelector = (state) => state.appStore;

export const completeLoading = () => ({
  type: types.LOADING_COMPLETE,
});

export const updateDrawerTitle = (title) => ({
  type: types.UPDATE_DRAWER_TITLE,
  title,
});

export const updateSiteEndpoints = (endpoints) => ({
  type: types.GET_SITE_ENDPOINTS_SUCCESS,
  endpoints,
});

export const updateSelectedSiteEndpoint = (endpointName, endpoint) => ({
  type: types.UPDATE_SELECTED_SITE_ENDPOINT,
  endpointName,
  endpoint,
});

export const sendSystemAlert = (message, messageType = 'verbose') => ({
  type: types.SEND_SYSTEM_ALERT,
  message,
  messageType,
});

export const updateIsRenewingToken = (isRenewing) => ({
  type: types.IS_RENEWING_TOKEN,
  isRenewingToken: isRenewing,
});

export const updateCurrentUser = (app) => ({
  type: types.UPDATE_CURRENT_USER,
  username: app.username,
  password: app.password,
  token: app.newToken,
  refreshToken: app.newRefreshToken,
  tokenExpireAt: app.newTokenExpireAt,
  tokenExpiryMinutes: app.tokenExpiryMinutes,
});

export const renewToken = (apiUrl, apiToken, refreshToken) => ({
  type: types.RENEW_TOKEN,
  meta: {
    offline: {
      effect: {
        method: 'POST',
        url: `${apiUrl || Config.API_URL}/api/auth/renew`,
        headers: {Authorization: `Bearer ${apiToken}`},
        body: JSON.stringify({
          refreshToken,
        }),
      },
      commit: {type: 'RENEW_TOKEN_SUCCESS', meta: {}},
      rollback: {type: 'RENEW_TOKEN_ERROR', meta: {}},
    },
  },
});

export const apiGetClientApps = (apiUrl, apiToken) => ({
  type: types.GET_CLIENT_APPS,
  meta: {
    offline: {
      effect: {
        url: `${apiUrl || Config.API_URL}/api/auth/getApps`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {type: 'GET_CLIENT_APPS_SUCCESS', meta: {}},
      rollback: {type: 'GET_CLIENT_APPS_ERROR', meta: {}},
    },
  },
});

export const apiGetClientConfigs = (apiUrl, apiToken) => ({
  type: types.GET_CLIENT_CONFIGS,
  meta: {
    offline: {
      effect: {
        url: `${apiUrl || Config.API_URL}/api/auth/getConfigs`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {type: 'GET_CLIENT_CONFIGS_SUCCESS', meta: {}},
      rollback: {type: 'GET_CLIENT_CONFIGS_ERROR', meta: {}},
    },
  },
});

// export const updateClientApps = (payload) => ({
//   type: types.GET_CLIENT_APPS_SUCCESS,
//   payload,
// });

export const updateClientConfigs = (payload) => ({
  type: types.GET_CLIENT_CONFIGS_SUCCESS,
  payload,
});

export const updateDeviceInfo = (payload) => ({
  type: types.UPDATE_DEVICE_INFO,
  payload,
});

export const updateWebAppUrl = (apiUrl) => ({
  type: types.UPDATE_WEBAPP_URL,
  apiUrl,
});
export const updateApiUrl = (apiUrl) => ({
  type: types.UPDATE_API_SETTING,
  apiUrl,
});

export const toggleAutoUpdate = () => ({
  type: types.TOGGLE_AUTO_UPDATE,
});

export const toggleSeqLogging = () => ({
  type: types.UPDATE_SEQ_LOGGING,
});

export const updateSeqApi = (seqApi) => ({
  type: types.UPDATE_SEQ_API,
  seqApi,
});

export const updatePassword = (password) => ({
  type: types.UPDATE_PASSWORD_INPUT,
  password,
});

export const resetStore = () => ({
  type: types.RESET_STORE,
});

export const apiGetOfflineNetworkStatus = () => ({
  type: types.SEND_OFFLINE_NETWORK_TEST,
  meta: {
    offline: {
      effect: {
        url: 'https://jsonplaceholder.typicode.com/todos/1',
      },
      commit: {type: 'SEND_OFFLINE_NETWORK_TEST_SUCCESS', meta: {}},
      rollback: {type: 'SEND_OFFLINE_NETWORK_TEST_ERROR', meta: {}},
    },
  },
});

export const apiGetOfflineAPINetworkStatus = (apiUrl) => ({
  type: types.SEND_API_OFFLINE_NETWORK_TEST,
  meta: {
    offline: {
      effect: {
        url: `${apiUrl || Config.API_URL}/api/debug/ping`,
      },
      commit: {type: 'SEND_API_OFFLINE_NETWORK_TEST_SUCCESS', meta: {}},
      rollback: {type: 'SEND_API_OFFLINE_NETWORK_TEST_ERROR', meta: {}},
    },
  },
});

export const toggleBetaChannel = () => ({
  type: types.TOGGLE_BETA_CHANNEL,
});

export const setWebAppFullScreen = (isFullScreen) => ({
  type: types.SET_WEBAPP_FULLSCREEN,
  isFullScreen,
});

export const setWebAppRefresh = (shouldRefresh) => ({
  type: types.SET_WEBAPP_REFRESH,
  shouldRefresh,
});

export const setWebAppPrioritised = (isPrioritised) => ({
  type: types.SET_WEBAPP_PRIORITISED,
  isPrioritised,
});

export const setWebAppEnabled = (isEnabled) => ({
  type: types.SET_WEBAPP_ENABLED,
  isEnabled,
});

export const setShowWebApp = (show) => ({
  type: types.SET_SHOW_WEBAPP,
  show,
});

export const toggleDebugOption = () => ({
  type: types.TOGGLE_DEBUG_OPTION,
});

export const updateOfflineNetworkStatus = (status) => ({
  type: types.UPDATE_OFFLINE_NETWORK_STATUS,
  status,
});

export const scheduled5sTick = () => ({
  type: types.SCHEDULED_5S_TICK,
});

export const updateApiOfflineNetworkStatus = (status) => ({
  type: types.UPDATE_API_OFFLINE_NETWORK_STATUS,
  status,
});

export const updateNetworkStatus = (isConnected) => ({
  type: types.UPDATE_NETWORK_STATUS,
  isConnected,
});

export const updateUser = (username) => ({
  type: types.UPDATE_USER_INPUT,
  username,
});

export const logout = () => ({
  type: types.LOGOUT,
});

export const scheduleTickInSeconds = (seconds) => ({
  type: types.SCHEDULED_TICK,
  seconds,
});

export const apiAuthenticateUser = (apiUrl, username, password) => ({
  type: types.AUTHENTICATE_USER,
  meta: {
    offline: {
      effect: {
        url: `${apiUrl || Config.API_URL}/api/Auth/`,
        method: 'POST',
        json: {username, password},
      },
      commit: {type: 'AUTHENTICATE_USER_SUCCESS', meta: {}},
      rollback: {type: 'AUTHENTICATE_USER_ERROR', meta: {}},
    },
  },
});

export default function appStoreReducer(state = initialState.appStore, action) {
  switch (action.type) {
    case types.UPDATE_SELECTED_SITE_ENDPOINT: {
      return {
        ...state,
        selectedSiteName: action.endpointName,
        selectedSiteEndpoint: action.endpoint,
      };
    }
    case types.TOGGLE_DEBUG_OPTION: {
      return {...state, showDebugOption: !state.showDebugOption};
    }
    case types.SCHEDULED_TICK: {
      logger.debug(`SCHEDULED_TICK - ${action.seconds}s`);
      return state;
    }
    case types.UPDATE_DEVICE_INFO: {
      return {
        ...state,
        deviceInfo: {...state.deviceInfo, ...action.payload},
      };
    }
    case types.GET_SITE_ENDPOINTS_SUCCESS: {
      return {
        ...state,
        siteEndpoints: action.endpoints,
      };
    }
    case types.GET_CLIENT_APPS_ERROR: {
      console.log('GET_CLIENT_APPS_ERROR');
      displayApiErrorToast(
        action.payload,
        'Unable to retrieve application list',
      );
      return {...state, availableApps: []};
    }
    case types.GET_CLIENT_APPS_SUCCESS: {
      let apps = [];
      let authorizedApps = [];

      try {
        apps = isArray(action.payload) ? action.payload : [action.payload];
        apps = uniqBy(apps, 'app');
        if (apps.length > 0 && apps[0].sortOrder)
          apps = orderBy(apps, 'sortOrder');
        const reducer = (acc, cur) => acc.concat(cur.app);
        authorizedApps = apps.reduce(reducer, []);
        logger.info(`App list: ${JSON.stringify(authorizedApps)}`);
      } catch (error) {
        logger.error(error);
      }
      return {
        ...state,
        authorizedApps: isArray(authorizedApps) ? authorizedApps : [],
        userAppConfigs: apps,
      };
    }
    case types.GET_CLIENT_CONFIGS_SUCCESS: {
      return {...state, ...action.payload};
    }
    case types.RENEW_TOKEN_SUCCESS: {
      return {
        ...state,
        token: action.payload.token,
        refresh: action.payload.refreshToken,
        tokenExpireAt: action.payload.tokenExpireAt,
      };
    }
    case types.RENEW_TOKEN_ERROR: {
      return {...state};
    }
    case types.AUTHENTICATE_USER_SUCCESS: {
      logger.debug(`User ${state.username} logged in successfully`);
      return {
        ...state,
        token: action.payload.token,
        tokenExpireAt:
          action.payload.tokenExpireAt || moment().add(1, 'h').format(),
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
      };
    }
    case types.UPDATE_CURRENT_USER: {
      return {
        ...state,
        username: action.username,
        password: action.password,
        token: action.token,
        refreshToken: action.refreshToken || state.refreshToken,
        tokenExpireAt: action.tokenExpireAt,
        tokenExpiryMinutes:
          action.tokenExpiryMinutes || state.tokenExpiryMinutes,
        isAuthenticated: true,
      };
    }
    case types.AUTHENTICATE_USER_ERROR: {
      displayToast('Log in error');
      return {
        ...state,
        isAuthenticated: false,
        token: '',
      };
    }
    case types.UPDATE_DRAWER_TITLE: {
      return {
        ...state,
        drawerTitle: action.title,
      };
    }
    case types.LOGOUT: {
      logger.info(`User ${state.username} logged out`);
      displayToast('Logged out');
      return {
        ...state,
        password: '',
        isAuthenticated: false,
        isRenewingToken: false,
        lastRenewingTokenTimestamp: null,
      };
    }
    case types.SEND_SYSTEM_ALERT: {
      let messageKey = 'verboseMessage';
      let sentKey = 'verboseSent';
      switch (action.messageType) {
        case 'error':
          messageKey = 'errorMessage';
          sentKey = 'errorSent';
          break;
        case 'warning':
          messageKey = 'warningMessage';
          sentKey = 'warningSent';
          break;
        default:
      }

      return {
        ...state,
        alerts: {
          ...state.alerts,
          [messageKey]: action.message,
          [sentKey]: new Date(),
        },
      };
    }
    case types.SCHEDULED_5S_TICK: {
      console.log('SCHEDULED_5S_TICK');
      return state;
    }
    case types.IS_RENEWING_TOKEN: {
      return {
        ...state,
        isRenewingToken: action.isRenewingToken,
        lastRenewingTokenTimestamp: action.isRenewingToken ? new Date() : null,
      };
    }
    case types.UPDATE_USER_INPUT: {
      return {
        ...state,
        username: action.username,
      };
    }
    case types.UPDATE_PASSWORD_INPUT:
      return {
        ...state,
        password: action.password,
      };
    case types.UPDATE_NETWORK_STATUS:
      return {
        ...state,
        isConnected: action.isConnected,
      };
    case types.UPDATE_DIRECT_NETWORK_STATUS:
      return {
        ...state,
        directNetworkStatus: action.status,
      };
    case types.SEND_OFFLINE_NETWORK_TEST_SUCCESS:
      return {
        ...state,
        offlineNetworkStatus: action.payload,
      };
    case types.SEND_OFFLINE_NETWORK_TEST_ERROR:
      return {
        ...state,
        offlineNetworkStatus: 'error',
      };
    case types.UPDATE_OFFLINE_NETWORK_STATUS:
      return {
        ...state,
        offlineNetworkStatus: {},
      };
    case types.LOADING_COMPLETE:
      return {
        ...state,
        isLoading: false,
      };
    case types.UPDATE_API_OFFLINE_NETWORK_STATUS:
      return {
        ...state,
        apiOfflineNetworkStatus: {},
      };
    case types.SEND_API_OFFLINE_NETWORK_TEST_SUCCESS:
      return {
        ...state,
        apiOfflineNetworkStatus: action.payload,
      };
    case types.SEND_API_OFFLINE_NETWORK_TEST_ERROR: {
      displayToast(JSON.stringify(action));
      return {
        ...state,
        apiOfflineNetworkStatus: action.payload,
      };
    }
    case types.TOGGLE_BETA_CHANNEL:
      return {
        ...state,
        isBetaEnabled: !state.isBetaEnabled,
      };
    case types.TOGGLE_AUTO_UPDATE:
      return {
        ...state,
        isAutoUpdateEnabled: !state.isAutoUpdateEnabled,
      };
    case types.UPDATE_SEQ_LOGGING:
      return {
        ...state,
        seqLoggingEnabled: !state.seqLoggingEnabled,
      };
    case types.UPDATE_SEQ_API:
      return {
        ...state,
        seqApi: action.seqApi,
      };
    case types.SET_WEBAPP_REFRESH:
      return {
        ...state,
        shouldWebAppRefresh: action.shouldRefresh,
      };
    case types.SET_WEBAPP_FULLSCREEN:
      return {
        ...state,
        isWebAppFullScreen: action.isFullScreen,
      };
    case types.SET_WEBAPP_PRIORITISED:
      return {
        ...state,
        isWebAppPrioritised: action.isPrioritised,
      };
    case types.SET_WEBAPP_ENABLED:
      return {
        ...state,
        isWebAppEnabled: action.isEnabled,
      };
    case types.SET_SHOW_WEBAPP:
      // return state;
      return {
        ...state,
        isWebAppVisible: action.show,
      };
    case types.UPDATE_WEBAPP_URL:
      return {
        ...state,
        webAppUrl: action.apiUrl,
      };
    case types.UPDATE_API_SETTING:
      return {
        ...state,
        apiUrl: action.apiUrl,
      };
    case types.RESET_STORE:
      // Only clears the AsyncStorage
      resetStoreAsync().done();
      // Not clearing the redux store
      return state;
    default:
      return state;
  }
}

export function doLogout() {
  return (dispatch) => dispatch(logout());
}

export function authenticateUser(apiUrl, username, password) {
  return (dispatch) =>
    dispatch(apiAuthenticateUser(apiUrl, username, password));
}

export const scheduleTick = (seconds) => (dispatch) => {
  setTimeout(
    () => dispatch(scheduleTickInSeconds(seconds * 1000)),
    seconds * 1000,
  );
};
