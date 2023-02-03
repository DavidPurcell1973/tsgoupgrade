import dotProp from 'dot-prop-immutable';
import Config from 'react-native-config';
import {has, get, isString, isArray} from 'lodash';
import * as types from '../../actions/quickQuery/quickQueryActions';
import initialState from '../initialState';
import {displayApiErrorToast, displayToast} from '../../helpers/utils';
import {playBadSound, playGoodSound} from '../../components/common/playSound';

export const apiGetTaskActions = (apiUrl, apiToken, quickQueryId = 0) => ({
  type: types.QUICKQUERY_GET_TASK_ACTIONS,
  payload: {apiUrl, apiToken, quickQueryId},
  meta: {
    offline: {
      effect: {
        url: `${
          apiUrl || Config.API_URL
        }/api/quick-query/${quickQueryId}/actions`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'QUICKQUERY_GET_TASK_ACTIONS_SUCCESS',
        meta: {apiUrl, apiToken, quickQueryId},
      },
      rollback: {
        type: 'QUICKQUERY_GET_TASK_ACTIONS_ERROR',
        meta: {apiUrl, apiToken, quickQueryId},
      },
    },
  },
});

export const apiGetTasks = (apiUrl, apiToken, quickQueryId = 0) => ({
  type: types.QUICKQUERY_GET_TASKS,
  payload: {apiUrl, apiToken, quickQueryId},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl || Config.API_URL}/api/quick-query${
          quickQueryId > 0 ? '/' + quickQueryId : ''
        }`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'QUICKQUERY_GET_TASKS_SUCCESS',
        meta: {apiUrl, apiToken, quickQueryId},
      },
      rollback: {
        type: 'QUICKQUERY_GET_TASKS_ERROR',
        meta: {apiUrl, apiToken, quickQueryId},
      },
    },
  },
});

export const apiSendRequest = (apiUrl, apiToken, payload) => ({
  type: types.QUICKQUERY_SEND_REQUEST,
  payload,
  meta: {
    offline: {
      effect: {
        url: `${apiUrl || Config.API_URL}/api/quick-query/${
          payload.quickQueryId
        }/send`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
        json: {
          ...payload,
        },
      },
      commit: {
        type: 'QUICKQUERY_SEND_REQUEST_SUCCESS',
        meta: {...payload},
      },
      rollback: {
        type: 'QUICKQUERY_SEND_REQUEST_ERROR',
        meta: {...payload},
      },
    },
  },
});

export const apiSendActionRequest = (apiUrl, apiToken, payload) => ({
  type: types.QUICKQUERY_SEND_ACTION_REQUEST,
  payload,
  meta: {
    offline: {
      effect: {
        url: `${apiUrl || Config.API_URL}/api/quick-query/${
          payload.quickQueryId
        }/send/${payload.actionId}`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
        json: {
          ...payload,
        },
      },
      commit: {
        type: 'QUICKQUERY_SEND_ACTION_REQUEST_SUCCESS',
        meta: {...payload},
      },
      rollback: {
        type: 'QUICKQUERY_SEND_ACTION_REQUEST_ERROR',
        meta: {...payload},
      },
    },
  },
});

export const clearResult = (task) => ({
  type: types.QUICKQUERY_CLEAR_RESULT,
});

export const clearContext = (task) => ({
  type: types.QUICKQUERY_CLEAR_CONTEXT,
});

export const clearResultAction = (task) => ({
  type: types.QUICKQUERY_CLEAR_RESULT_ACTION,
});

export default function QuickQueryReducer(
  state = initialState.quickQueryStore,
  action,
) {
  switch (action.type) {
    case types.QUICKQUERY_SEND_REQUEST_SUCCESS: {
      console.log('QUICKQUERY_SEND_REQUEST_SUCCESS');
      const {meta, payload} = action;
      // const {quickQueryId, barcode, uuid} = meta;
      // const {
      //   complete,
      //   hasError,
      //   actions,
      //   dataType,
      //   data,
      //   quickQueryId: replyQuickQueryId,
      //   uuid: replyUuid,
      // } = payload;
      console.log(action.payload);
      return {...state, resultSet: action.payload, resultContext: action.meta};
    }
    case types.QUICKQUERY_CLEAR_RESULT_ACTION: {
      console.log('QUICKQUERY_CLEAR_RESULT_ACTION');
      return {
        ...state,
        resultAction: initialState.quickQueryStore.resultAction,
      };
    }
    case types.QUICKQUERY_CLEAR_RESULT: {
      console.log('QUICKQUERY_CLEAR_RESULT');
      return {...state, resultSet: initialState.quickQueryStore.resultSet};
    }
    case types.QUICKQUERY_CLEAR_CONTEXT: {
      console.log('QUICKQUERY_CLEAR_CONTEXT');
      return {
        ...state,
        resultContext: initialState.quickQueryStore.resultContext,
      };
    }
    case types.QUICKQUERY_SEND_REQUEST_ERROR: {
      console.log('QUICKQUERY_SEND_REQUEST_ERROR');
      playBadSound();
      displayApiErrorToast(action.payload, 'Unable to query data...');
      return state;
    }
    case types.QUICKQUERY_SEND_ACTION_REQUEST_SUCCESS: {
      console.log('QUICKQUERY_SEND_ACTION_REQUEST_SUCCESS');
      const {meta, payload} = action;
      // const {quickQueryId, barcode, uuid} = meta;
      // const {
      //   complete,
      //   hasError,
      //   actions,
      //   dataType,
      //   data,
      //   quickQueryId: replyQuickQueryId,
      //   uuid: replyUuid,
      // } = payload;
      // console.log(action.payload);
      return {...state, resultSet: action.payload};
    }
    case types.QUICKQUERY_SEND_ACTION_REQUEST_ERROR: {
      console.log('QUICKQUERY_SEND_ACTION_REQUEST_ERROR');
      playBadSound();
      displayApiErrorToast(action.payload, 'Unable to send action data...');
      return state;
    }
    case types.QUICKQUERY_GET_TASKS_SUCCESS: {
      console.log('QUICKQUERY_GET_TASKS_SUCCESS');
      return {...state, tasks: action.payload};
    }
    case types.QUICKQUERY_GET_TASKS_ERROR: {
      console.log(action.payload);
      console.log('QUICKQUERY_GET_TASKS_ERROR');
      return state;
    }
    case types.QUICKQUERY_GET_TASK_ACTIONS_SUCCESS: {
      console.log('QUICKQUERY_GET_TASK_ACTIONS_SUCCESS');
      return {...state, resultSet: action.payload};
    }
    case types.QUICKQUERY_GET_TASK_ACTIONS_ERROR: {
      console.log('QUICKQUERY_GET_TASKACTIONS_ERROR');
      return state;
    }
    default:
      return state;
  }
}
