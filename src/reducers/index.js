import {combineReducers} from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage'; // RN >= 59
import stateReconciler from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import {persistReducer} from 'redux-persist';
import appStore from './app/appStoreReducer';
// import enhancedOfflineStore from './app/offlineEnhancedReducer';
import smartScanStore from './smartScan/smartScanReducer';
import quickScanStore from './quickScan/quickScanReducer';
import FilesystemStorage from 'redux-persist-filesystem-storage';
import dynaFormStore from './dynaForm/dynaFormReducer';
import stocktakeStore from './stocktake/stocktakeReducer';
import itiConsignmentStocktakeStore from './itiConsignmentStocktake/itiConsignmentStocktakeReducer';
import loadPlanningStore from './loadPlanning/loadPlanningReducer';
import orderPickingStore from './orderPicking/orderPickingReducer';
import quickQueryStore from './quickQuery/quickQueryReducer';
import fs from 'react-native-fs';
import processingStore from './processing/processingReducer';
import podStore from './pod/podReducer';
import * as types from '../actions/rootActions';
import {writeFailHandler} from '../store/configureStore';
import moistureCollectorStore from './moistureCollector/moistureCollectorReducer';

FilesystemStorage.config({
  storagePath: `${fs.DownloadDirectoryPath}/com.timbersmart.tsgo/store`,
  encoding: 'utf8',
  toFileName: (name) => name.split(':').join('-'),
  fromFileName: (name) => name.split('-').join(':'),
});

const appStorePersistConfig = {
  key: 'appStore',
  storage: FilesystemStorage,
  blacklist: ['isLoading'],
  debug: true,
  stateReconciler,
  writeFailHandler,
};

const allReducers = combineReducers({
  smartScanStore,
  stocktakeStore,
  loadPlanningStore,
  orderPickingStore,
  quickScanStore,
  dynaFormStore,
  itiConsignmentStocktakeStore,
  processingStore,
  quickQueryStore,
  moistureCollectorStore,
  podStore,
  appStore,
  appStore: persistReducer(appStorePersistConfig, appStore),
});

const rootReducer = (state, action) => {
  switch (action.type) {
    case types.RESET_STORE:
      {
        const {appStore: _appStore} = state;
        state = {appStore: _appStore};
      }
      return allReducers(state, action);
    default:
      return allReducers(state, action);
  }
};

export const resetReduxStore = () => ({
  type: types.RESET_STORE,
});

export default rootReducer;
