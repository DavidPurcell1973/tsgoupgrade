import dotProp from 'dot-prop-immutable';
import Config from 'react-native-config';
import * as types from '../../actions/smartScan/smartScanActions';
import initialState from '../initialState';
import logger from '../../helpers/logger';
import {displayApiErrorToast, displayToast} from '../../helpers/utils';
import {get, isArray, isString} from 'lodash';
import {playBadSound, playGoodSound} from '../../components/common/playSound';

export const updateUserInput = (data) => ({
  type: types.SMARTSCAN_UPDATE_INPUT,
  data,
});

export const updateDropdownInput = (data) => ({
  type: types.SMARTSCAN_UPDATE_DROPDOWN,
  data,
});

export const clearItems = (task) => ({
  type: types.SMARTSCAN_CLEAR_ITEMS,
  task,
});

export const addPackToTask = (data) => ({
  type: types.SMARTSCAN_ADD_PACK_SUCCESS,
  data,
});

export const setCurrentlyOpenSwipeableItem = (data) => ({
  type: types.SMARTSCAN_SET_CURRENT_SWIPABLE_ITEM_SUCCESS,
  data,
});

export const sendItemSuccess = (data) => ({
  type: types.SMARTSCAN_SEND_ITEM_SUCCESS,
  data,
});

export const apiGetTasks = (apiUrl, apiToken) => ({
  type: types.SMARTSCAN_GET_TASKS,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl || Config.API_URL}/api/SmartScan/Tasks`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {type: 'SMARTSCAN_GET_TASKS_SUCCESS', meta: {}},
      rollback: {type: 'SMARTSCAN_GET_TASKS_ERROR', meta: {}},
    },
  },
});

export const loadTasksSuccess = (tasks, offlineTasksLastUpdate) => ({
  type: types.SMARTSCAN_LOAD_OFFLINE_TASKS_SUCCESS,
  tasks,
  offlineTasksLastUpdate,
});

export const refreshTaskCategories = (payload) => ({
  type: types.SMARTSCAN_GET_TASKCATEGORIES,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${payload.apiUrl || Config.API_URL}/api/SmartScan/TaskCategories`,
        headers: {Authorization: `Bearer ${payload.apiToken}`},
      },
      commit: {type: 'SMARTSCAN_GET_TASKCATEGORIES_SUCCESS', meta: {payload}},
      rollback: {type: 'SMARTSCAN_GET_TASKCATEGORIES_ERROR', meta: {payload}},
    },
  },
});

export const apiGetTaskCategories = (apiUrl, apiToken) => ({
  type: types.SMARTSCAN_GET_TASKCATEGORIES,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl || Config.API_URL}/api/SmartScan/TaskCategories`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {type: 'SMARTSCAN_GET_TASKCATEGORIES_SUCCESS', meta: {}},
      rollback: {type: 'SMARTSCAN_GET_TASKCATEGORIES_ERROR', meta: {}},
    },
  },
});

export const loadTaskCategoriesSuccess = (
  taskCategories,
  offlineTaskCategoriesLastUpdate,
) => ({
  type: types.SMARTSCAN_LOAD_OFFLINE_TASKCATEGORIES_SUCCESS,
  taskCategories,
  offlineTaskCategoriesLastUpdate,
});

export const apiSendItem = (task, taskCategory, item, apiUrl, apiToken) => ({
  type: types.SMARTSCAN_SEND_ITEM_REQUEST,
  payload: {
    task,
    apiUrl,
    apiToken,
    taskCategory,
    item,
  },
  meta: {
    offline: {
      effect: {
        url: `${apiUrl || Config.API_URL}/api/SmartScan/Tasks`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
        json: {
          updateTaskItemProcedure: task.updateTaskItemProcedure,
          taskItemGuid: item.uuid,
          taskGuid: task.taskGuid,
          value: item.input,
          valueGuid: item.uuid,
          taskCategoryGuid:
            item.dropdownInput.length > 0 ? item.dropdownInput : null,
          quantity: 1,
          scannedOn: item.scannedOn,
          scannedBy: item.scannedBy,
        },
      },
      commit: {
        type: 'SMARTSCAN_SEND_ITEM_SUCCESS',
        meta: {
          then: refreshTaskCategories,
          apiUrl,
          apiToken,
          ...item,
        },
      },
      rollback: {
        type: 'SMARTSCAN_SEND_ITEM_ERROR',
        meta: {...item, apiUrl, apiToken},
      },
    },
  },
});

export const loadInputSuccess = (data) => ({
  type: types.SMARTSCAN_LOAD_OFFLINE_INPUT_SUCCESS,
  data,
});

export const deleteItemSuccess = (data) => ({
  type: types.SMARTSCAN_DELETE_ITEM_SUCCESS,
  data,
});

export default function smartScanReducer(
  state = initialState.smartScanStore,
  action,
) {
  switch (action.type) {
    case types.SMARTSCAN_CLEAR_ITEMS: {
      const inputPath = `input.${action.task.taskGuid}`;
      const newState = dotProp.delete(state, inputPath);
      return newState || state;
    }
    case types.SMARTSCAN_DELETE_ITEM_SUCCESS: {
      let newState = {};
      if (state.input[action.data.sourceUuid] !== undefined) {
        const itemIndex = state.input[action.data.sourceUuid].findIndex(
          (e) => e.uuid === action.data.uuid,
        );
        const itemPath = `input.${action.data.sourceUuid}.${itemIndex}`;
        if (itemIndex < 0) {
          return state;
        }
        newState = dotProp.delete(state, itemPath);
      }

      return newState || state;
    }
    case types.SMARTSCAN_ADD_PACK_SUCCESS: {
      const inputPath = `input.${action.data.sourceUuid}`;
      const inputData = dotProp.get(state, inputPath);
      let newState = state;
      if (isArray(inputData) && inputData.length >= 0) {
        const itemIndex = inputData.findIndex(
          (e) =>
            e.input === action.data.input &&
            e.status.toLowerCase() === 'pending',
        );
        if (itemIndex >= 0) {
          const itemPath = `input.${action.data.sourceUuid}.${itemIndex}`;
          newState = dotProp.delete(state, itemPath);
        }
      }
      let currentInput = dotProp.get(newState, inputPath);
      if (!isArray(currentInput) || currentInput === undefined) {
        currentInput = [action.data];
      } else {
        currentInput = [action.data].concat(currentInput);
      }
      // newState = dotProp.merge(newState, inputPath, [action.data]);
      newState = dotProp.set(newState, inputPath, currentInput);
      return newState;
    }
    case types.SMARTSCAN_UPDATE_INPUT:
      return {
        ...state,
        userInput: action.data,
      };
    case types.SMARTSCAN_UPDATE_DROPDOWN:
      return {
        ...state,
        dropdownInput: action.data,
      };
    case types.SMARTSCAN_GET_TASKS_SUCCESS: {
      const now = new Date();
      const tasks = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      return {
        ...state,
        offlineTasksLastUpdate: now,
        onlineTasksLastUpdate: now,
        tasks,
      };
    }
    case types.SMARTSCAN_GET_TASKS_ERROR: {
      displayApiErrorToast(action.payload, 'Unable to load Tasks');
      const loadTasksErrorPath = 'loadTasksError';
      return dotProp.set(state, loadTasksErrorPath, true);
    }
    case types.SMARTSCAN_GET_TASKCATEGORIES_SUCCESS: {
      const now = new Date();
      const data = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];

      return {
        ...state,
        offlineTaskCategoriesLastUpdate: now,
        onlineTaskCategoriesLastUpdate: now,
        taskCategories: data,
      };
    }
    case types.SMARTSCAN_GET_TASKCATEGORIES_ERROR: {
      displayApiErrorToast(action.payload, 'Unable to load Task Categories');
      const loadTaskCategoriesErrorPath = 'loadTaskCategoriesError';
      return dotProp.set(state, loadTaskCategoriesErrorPath, true);
    }
    case types.SMARTSCAN_LOAD_OFFLINE_TASKCATEGORIES_SUCCESS: {
      if (
        action.offlineTaskCategoriesLastUpdate <
          state.onlineTaskCategoriesLastUpdate ||
        state.onlineTaskCategoriesLastUpdate === undefined
      ) {
        return {
          ...state,
          offlineTaskCategoriesLastUpdate:
            action.offlineTaskCategoriesLastUpdate,
          taskCategories: action.taskCategories,
        };
      }
      return state;
    }
    case types.SMARTSCAN_LOAD_OFFLINE_TASKS_SUCCESS: {
      if (
        action.offlineTasksLastUpdate < state.onlineTasksLastUpdate ||
        state.onlineTasksLastUpdate === undefined
      ) {
        return {
          ...state,
          offlineTasksLastUpdate: action.offlineTasksLastUpdate,
          tasks: action.tasks,
        };
      }
      return state;
    }
    case types.SMARTSCAN_LOAD_OFFLINE_INPUT_SUCCESS:
      return {
        ...state,
        input: action.data,
      };
    case types.SMARTSCAN_SEND_ITEM_SUCCESS: {
      console.log('SMARTSCAN_SEND_ITEM_SUCCESS');
      if (isArray(action.payload) && action.payload.length > 0) {
        action.payload = action.payload[0];
      }
      const {taskGuid, taskItemGuid, message} = action.payload;
      if (!isString(taskGuid)) {
        logger.warn(
          `Invalid taskGuid returned from action.payload ${JSON.stringify(
            action.payload,
          )}`,
        );
        return state;
      }
      logger.debug(`[STEP CHECK]: Payload is found`);
      const itemIndex = state.input[taskGuid].findIndex(
        (e) => e.uuid.toUpperCase() === taskItemGuid.toUpperCase(),
      );
      if (itemIndex < 0) {
        return state;
      }
      logger.debug(`[STEP CHECK]: Payload has matching item in Redux store`);
      const hasError = get(action.payload, 'hasError');

      logger.debug(`[STEP CHECK]: ${hasError}`);
      // Insert meta data into payload for action chaining
      // eslint-disable-next-line no-param-reassign
      action.payload = {...action.payload, ...action.meta};
      const statusPath = `input.${[taskGuid]}.${itemIndex}.status`;
      logger.debug(`[STEP CHECK]: Status Path --> ${statusPath}`);
      const newState = dotProp.set(state, statusPath, message.trim());
      logger.debug(`[STEP CHECK]: ${JSON.stringify(action)}`);
      if (hasError) {
        playBadSound();
      } else playGoodSound();
      return newState;
    }
    case types.SMARTSCAN_SEND_ITEM_ERROR:
      console.log('SMARTSCAN_SEND_ITEM_ERROR');
      displayApiErrorToast(action.payload, 'Unable to send request to server');
      logger.debug(`${JSON.stringify(action)}`, action);
      playBadSound();
      return state;
    default:
      return state;
  }
}

export function loadOfflineTasks(tasks, lastUpdate) {
  return (dispatch) => dispatch(loadTasksSuccess(tasks, lastUpdate));
}

export function loadTasks(apiUrl, apiToken) {
  return (dispatch) => dispatch(apiGetTasks(apiUrl, apiToken));
}

export function sendItem(task, taskCategory, item, apiUrl, apiToken) {
  return (dispatch) =>
    dispatch(apiSendItem(task, taskCategory, item, apiUrl, apiToken));
}

export function deleteItem(item) {
  return (dispatch) => dispatch(deleteItemSuccess(item));
}

export function loadTaskCategories(apiUrl, apiToken) {
  return (dispatch) => dispatch(apiGetTaskCategories(apiUrl, apiToken));
}

export function loadInput(data) {
  return (dispatch) => dispatch(loadInputSuccess(data));
}
