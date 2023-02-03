import dotProp from 'dot-prop-immutable';
import Config from 'react-native-config';
import isArray from 'lodash/isArray';
import get from 'lodash/get';
import {shallowEqual, useSelector} from 'react-redux';
import * as types from '../../actions/quickScan/quickScanActions';
import initialState from '../initialState';
import { displayApiErrorToast, displayToast } from '../../helpers/utils';
import { playBadSound, playGoodSound } from '../../components/common/playSound';
import store from '../../store/configureStore';
import {apiUrlSelector} from '../../selectors/common/commonSelector';

export const apiSendItem = (apiUrl, apiToken, task, pack) => ({
  type: types.QUICKSCAN_SEND_ITEM,
  payload: {
    task,
    pack,
  },
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/SmartScan/Tasks`,
        method: 'POST',
        headers: { Authorization: `Bearer ${apiToken}` },
        json: {
          updateTaskItemProcedure: task.updateTaskItemProcedure,
          taskItemGuid: pack.uuid,
          taskGuid: task.taskGuid,
          value: pack.packNo,
          valueGuid: pack.uuid,
          taskCategoryGuid: pack.taskCategoryGuid || null,
          quantity: 1,
          scannedOn: pack.scannedOn,
          scannedBy: pack.scannedBy,
        },
      },
      commit: { type: 'QUICKSCAN_SEND_ITEM_SUCCESS', meta: { ...pack } },
      rollback: { type: 'QUICKSCAN_SEND_ITEM_ERROR', meta: { ...pack } },
    },
  },
});

export const apiGetTaskCategories = (apiUrl, apiToken) => ({
  type: types.QUICKSCAN_GET_TASK_CATEGORIES,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl || Config.API_URL}/api/SmartScan/TaskCategories`,
        headers: { Authorization: `Bearer ${apiToken}` },
      },
      commit: { type: 'QUICKSCAN_GET_TASK_CATEGORIES_SUCCESS', meta: {} },
      rollback: { type: 'QUICKSCAN_GET_TASK_CATEGORIES_ERROR', meta: {} },
    },
  },
});

export const apiGetTasks = (apiUrl, apiToken) => ({
  type: types.QUICKSCAN_GET_TASKS,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl || Config.API_URL}/api/SmartScan/Tasks`,
        headers: { Authorization: `Bearer ${apiToken}` },
      },
      commit: { type: 'QUICKSCAN_GET_TASKS_SUCCESS', meta: {} },
      rollback: { type: 'QUICKSCAN_GET_TASKS_ERROR', meta: {} },
    },
  },
});

export const doAddPack = (item) => ({
  type: types.QUICKSCAN_ADD_PACK,
  taskGuid: item.taskGuid,
  uuid: item.uuid,
  taskCategoryGuid: item.taskCategoryGuid,
  packNo: item.packNo,
  scannedOn: item.scannedOn,
  scannedBy: item.scannedBy,
});

export const setIsSyncing = (flag) => ({
  type: types.QUICKSCAN_UPDATE_IS_SYNCING,
  flag,
});

export const doClearPack = (taskGuid) => ({
  type: types.QUICKSCAN_CLEAR_PACK,
  taskGuid,
});

export const doRemovePack = (taskGuid, uuid, packNo) => ({
  type: types.QUICKSCAN_REMOVE_PACK,
  taskGuid,
  uuid,
  packNo,
});

export default function QuickScanReducer(
  state = initialState.quickScanStore,
  action,
) {
  switch (action.type) {
    case types.QUICKSCAN_SEND_ITEM_SUCCESS: {
      console.log('QUICKSCAN_SEND_ITEM_SUCCESS');
      const itemIndex = state.scannedPacks.findIndex(
        (e) => e.uuid.toUpperCase() === action.meta.uuid.toUpperCase(),
      );
      if (itemIndex < 0) {
        return state;
      }

      let newState = null;

      newState = dotProp.set(
        state,
        `scannedPacks.${itemIndex}.isSent`,
        true,
      );

      newState = dotProp.set(
        newState,
        `scannedPacks.${itemIndex}.isError`,
        !(get(action.payload, 'hasErrors') === false),
      );

      // console.log(action.payload);
      // if (action.payload.status !== 200) {
      //   isError = message.length > 0;
      //
      // } else {
      //   message = get(action.payload, 'response.message.message') || 'Sent';
      // }

      newState = dotProp.set(
        newState,
        `scannedPacks.${itemIndex}.status`,
        get(action.payload, 'message') || 'Error',
      );
      return newState;
    }
    case types.QUICKSCAN_SEND_ITEM_ERROR: {
      console.log('QUICKSCAN_SEND_ITEM_ERROR');
      playBadSound();
      const itemIndex = state.scannedPacks.findIndex(
        (e) => e.uuid.toUpperCase() === action.meta.uuid.toUpperCase(),
      );
      if (itemIndex < 0) {
        return state;
      }

      let isError = false;
      let message = '';
      let newState = null;

      newState = dotProp.set(
        state,
        `scannedPacks.${itemIndex}.isSent`,
        false,
      );

      message = get(action.payload, 'response.Error.message') || 'API error';
      isError = message.length > 0;

      newState = dotProp.set(
        newState,
        `scannedPacks.${itemIndex}.isError`,
        isError,
      );

      newState = dotProp.set(
        newState,
        `scannedPacks.${itemIndex}.status`,
        `Network Error - ${message}`,
      );
      return newState;
    }
    case types.QUICKSCAN_UPDATE_IS_SYNCING: {
      return {
        ...state,
        isSyncing: action.flag,
      };
    }
    case types.QUICKSCAN_CLEAR_PACK: {
      return {
        ...state,
        scannedPacks: state.scannedPacks.filter(
          (e) => e.taskGuid !== action.taskGuid,
        ),
      };
    }
    case types.QUICKSCAN_REMOVE_PACK: {
      return {
        ...state,
        scannedPacks: state.scannedPacks.filter((e) => e.uuid !== action.uuid),
      };
    }
    case types.QUICKSCAN_ADD_PACK: {
      playGoodSound();
      if (
        action.uuid.length > 0
        && action.packNo.length > 0
        && action.taskGuid.length > 0
      ) {
        const newItem = {
          uuid: action.uuid,
          packNo: action.packNo,
          taskGuid: action.taskGuid,
          taskCategoryGuid: action.taskCategoryGuid,
          isSent: false,
          isError: false,
          scannedOn: action.scannedOn,
          scannedBy: action.scannedBy,
        };

        return {
          ...state,
          scannedPacks: [...state.scannedPacks, newItem],
        };
      }
      return state;
    }
    case types.QUICKSCAN_GET_TASK_CATEGORIES_SUCCESS: {
      return {
        ...state,
        taskCategories: isArray(action.payload) ? action.payload : [action.payload],
      };
    }
    case types.QUICKSCAN_GET_TASK_CATEGORIES_ERROR: {
      displayApiErrorToast(action.payload, 'Unable to get task categories from server');
      playBadSound();
      return state;
    }
    case types.QUICKSCAN_GET_TASKS_SUCCESS: {
      return {
        ...state,
        tasks: isArray(action.payload) ? action.payload : [action.payload],
      };
    }
    case types.QUICKSCAN_GET_TASKS_ERROR: {
      displayApiErrorToast(action.payload, 'Unable to get tasks from server');
      playBadSound();
      return state;
    }
    default:
      return state;
  }
}

export const syncTask = (task) => {
  const { quickScanStore, appStore } = store.getState();
  // const task = quickScanStore.tasks.filter((e) => e.taskGuid === taskGuid);
  // console.log(quickScanStore.scannedPacks);
  const packsToSync = quickScanStore.scannedPacks
    .filter((e) => e.taskGuid === task.taskGuid && (!e.isSent || e.isError));
  const { token } = appStore;
  const apiUrl = apiUrlSelector(store.getState());
  store.dispatch(setIsSyncing(true));
  if (packsToSync.length > 0) {
    packsToSync.forEach((e) => {
      store.dispatch(apiSendItem(apiUrl, token, task, e));
    });
  }
  setTimeout(() => store.dispatch(setIsSyncing(false)), 5000);
};
