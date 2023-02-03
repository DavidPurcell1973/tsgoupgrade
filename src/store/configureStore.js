import {createStore, compose, applyMiddleware} from 'redux';
import fs from 'react-native-fs';
import {createLogger} from 'redux-logger';
import thunk from 'redux-thunk';
import {offline} from '@redux-offline/redux-offline';
import offlineConfig from '@redux-offline/redux-offline/lib/config';
// import logSlowReducers from 'redux-log-slow-reducers';
import {persistStore, persistReducer} from 'redux-persist';
import stateReconciler from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import includes from 'lodash/includes';
import offlineChain from 'redux-offline-chain';
import FilesystemStorage from 'redux-persist-filesystem-storage';
import defaultEffect from '@redux-offline/redux-offline/src/defaults/effect';
import rollbarMiddleware from 'rollbar-redux-middleware';
import rootReducer from '../reducers';
import logger, {rollbar} from '../helpers/logger';
import renewBearerTokenMiddleware, {
  hasTokenExpired,
} from '../middlewares/renewBearerTokenMiddleware';
import {displayToast, isValidUrl} from '../helpers/utils';
import PayloadSource from '../helpers/PayloadSource';
import PayloadAction from '../helpers/PayloadAction';
import {renewTokenService} from '../helpers/tokenService';

// const sagaMiddleware = createSagaMiddleware();
const rollbarRedux = rollbarMiddleware(rollbar);

const middlewares = [
  // sagaMiddleware,
  thunk,
  offlineChain,
  renewBearerTokenMiddleware(),
  rollbarRedux,
  // loggerMiddleware,
  // unauthorizedHelperMiddleware(),
];

if (process.env.NODE_ENV === 'development') {
  const logger = createLogger({
    // predicate: (getState, action) => action.type !== AUTH_REMOVE_TOKEN, // if specified this function will be called before each action is processed with this middleware.
    collapsed: (getState, action, logEntry) => !logEntry.error, // takes a Boolean or optionally a Function that receives `getState` function for accessing current store state and `action` object as parameters. Returns `true` if the log group should be collapsed, `false` otherwise.
    duration: true, // print the duration of each action?
    timestamp: true, // print the timestamp with each action?
    level: 'console', // 'log' | 'console' | 'warn' | 'error' | 'info', // console's level
    // colors: ColorsObject, // colors for title, prev state, action and next state: https://github.com/LogRocket/redux-logger/blob/master/src/defaults.js#L12-L18
    // titleFormatter, // Format the title used when logging actions.
    // stateTransformer, // Transform state before print. Eg. convert Immutable object to plain JSON.
    // actionTransformer, // Transform action before print. Eg. convert Immutable object to plain JSON.
    // errorTransformer, // Transform error before print. Eg. convert Immutable object to plain JSON.
    logger: console, // implementation of the `console` API.
    logErrors: true, // should the logger catch, log, and re-throw errors?
    diff: false, // (alpha) show diff between states?
    // diffPredicate // (alpha) filter function for showing states diff, similar to `predicate`
  });

  // middlewares.push(logger);
}

// These are all the config options, with their default values
FilesystemStorage.config({
  storagePath: `${fs.DownloadDirectoryPath}/com.timbersmart.tsgo/store`,
  encoding: 'utf8',
  toFileName: (name) => name.split(':').join('-'),
  fromFileName: (name) => name.split('-').join(':'),
});

export const writeFailHandler = (err) => {
  console.error(err);
  logger.error(err);
};

const rootPersistConfig = {
  key: 'root',
  storage: FilesystemStorage,
  stateReconciler,
  debug: true,
  blacklist: ['appStore'],
  writeFailHandler,
};

// const loggingReducers = logSlowReducers(rootReducers);

const middlewareEnhancer = applyMiddleware(...middlewares);

// eslint-disable-next-line no-undef
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const effect = (_effect, _action) => {
  if (_action?.meta?.offline?.effect?.headers) 
  {
    const lastToken = _action.meta.offline.effect.headers.Authorization;
    const newToken = `Bearer ${store.getState().appStore.token}`;
    if (newToken !== lastToken && newToken.length > 0) {
      // eslint-disable-next-line no-param-reassign
      _action.meta.offline.effect.headers.Authorization = newToken;
      logger.info('New token detected - this request will use new token', {
        source: PayloadSource.Token,
        action: PayloadAction.Success,
      });
    }
  }
  if (_action?.meta?.offline?.effect)
    logger.debug(`Sending request to ${_action.meta.offline.effect.url}`);
  else logger.debug(`ACTION ${JSON.stringify(_action)}`);
  return defaultEffect(_effect, _action);
};

const discard = async (error, _action, _retries) => {
  const {request, response} = error;

  const actionUrl = _action?.meta?.offline?.effect?.url;
  if (actionUrl.length > 0 && !isValidUrl(actionUrl)) {
    displayToast('Warning: Discarding payload with invalid URL');
    logger.warn(
      `Discarding action with invalid URL ${JSON.stringify(_action)}`,
      {source: PayloadSource.Queue, action: PayloadAction.Discard},
    );
    return true;
  }

  if (!error.status) {
    return false;
  }

  if (error.status === 401) {
    const {
      // Only renew token if it's enabled on the server side or keep using the same token
      enforceStrictTokenExpiry,
      refreshToken,
      tokenExpireAt,
    } = store.getState().appStore;

    if (
      enforceStrictTokenExpiry &&
      hasTokenExpired(tokenExpireAt) &&
      refreshToken
    ) {
      logger.info('401 detected - renewing token via fetch...', {
        source: PayloadSource.Queue,
        action: PayloadAction.Check,
      });

      await renewTokenService();

      return false;
    }
  }

  const goodErrors = [401, 410, 404, 429, 500, 502, 503, 504];

  if (error.status === 429) {
    displayToast('Rate limit exceeded - please wait');
  }

  if (includes(goodErrors, error.status)) {
    logger.info(`Error ${error.status}: Action enqueued`, {
      source: PayloadSource.Queue,
      action: PayloadAction.DoNotDiscard,
    });
    return false;
  }

  logger.warn(
    `Error ${error.status}: Discarding action ${JSON.stringify(_action)}`,
    {
      source: PayloadSource.Queue,
      action: PayloadAction.Discard,
    },
  );
  return true;
};

const decaySchedule = [
  1000, // After 1 seconds
  1000 * 2, // After 2 seconds
  1000 * 3, // After 3 seconds
  1000 * 4, // After 4 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 1, // After 1 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 10, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 1, // After 1 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 10, // After 10 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 2, // After 2 seconds
  1000 * 5, // After 5 seconds
  1000 * 10, // After 10 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 10, // After 10 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 30, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 10, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 5, // After 5 seconds
  1000 * 60, // After 1 minutes
  1000 * 5, // After 5 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
  1000 * 2, // After 2 seconds
];

const retry = (action, retries) => {
  logger.info(
    `Attempt #${retries} in ${
      decaySchedule[retries] / 1000
    }s: Action -> ${JSON.stringify(action)} `,
  );
  return decaySchedule[retries] || null;
};

const offlineConfigOverride = {
  ...offlineConfig,
  // persist: undefined,
  discard,
  effect,
  retry,
};
const enhancers = [offline(offlineConfigOverride), middlewareEnhancer];
const composedEnhancers = composeEnhancers(...enhancers);

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

const store = createStore(persistedReducer, undefined, composedEnhancers);

export const persistor = persistStore(store);

// initSagas(sagaMiddleware);

export default store;
