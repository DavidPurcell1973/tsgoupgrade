import dotProp from 'dot-prop-immutable';
import Config from 'react-native-config';
import {isString, isArray} from 'lodash';
import get from 'lodash/get';
import * as types from '../../actions/dynaForm/dynaFormActions';
import initialState from '../initialState';
import {displayApiErrorToast, displayToast} from '../../helpers/utils';
import {playBadSound, playGoodSound} from '../../components/common/playSound';

export const apiSendItem = (apiUrl, apiToken, payload) => ({
  type: types.DYNAFORM_SEND_ITEM,
  payload: {
    payload,
  },
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/DynaForm/SendData`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
        json: {
          payload,
        },
      },
      commit: {type: 'DYNAFORM_SEND_ITEM_SUCCESS', meta: {...payload}},
      rollback: {type: 'DYNAFORM_SEND_ITEM_ERROR', meta: {...payload}},
    },
  },
});

export const apiGetForms = (apiUrl, apiToken) => ({
  type: types.DYNAFORM_GET_FORMS,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl || Config.API_URL}/api/DynaForm/GetForms`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {type: 'DYNAFORM_GET_FORMS_SUCCESS', meta: {}},
      rollback: {type: 'DYNAFORM_GET_FORMS_ERROR', meta: {}},
    },
  },
});

export const doAddPayload = (payload) => ({
  type: types.DYNAFORM_ADD_PAYLOAD,
  payload,
});

// export const setIsSyncing = (flag) => ({
//   type: types.DYNAFORM_UPDATE_IS_SYNCING,
//   flag,
// });

export const doClearQueue = (dynaFormId) => ({
  type: types.DYNAFORM_CLEAR_QUEUE,
  dynaFormId,
});

export const doRemovePayload = (uuid) => ({
  type: types.DYNAFORM_REMOVE_PAYLOAD,
  uuid,
});

export default function DynaFormReducer(
  state = initialState.dynaFormStore,
  action,
) {
  switch (action.type) {
    case types.DYNAFORM_SEND_ITEM_SUCCESS: {
      console.log('DYNAFORM_SEND_ITEM_SUCCESS');
      const currentItems = state.queues.filter(
        (e) => e.uuid.toUpperCase() === action.meta.uuid.toUpperCase(),
      );
      const newItem = currentItems.length > 0 ? {...currentItems[0]} : null;
      if (newItem === null) return state;

      const payload = isArray(action.payload)
        ? action.payload[0]
        : action.payload;
      newItem.isSent = true;
      newItem.hasError = get(payload, 'hasError');
      newItem.Status = get(payload, 'status') || 'Unknown status';
      newItem.Message = get(payload, 'message') || 'Unknown message';

      const toastMessage = get(payload, 'toastMessage');
      const toastMessageDelaySeconds = get(payload, 'toastMessageDelaySeconds');

      if (
        toastMessage !== undefined &&
        toastMessageDelaySeconds !== undefined &&
        isString(toastMessage) &&
        toastMessage.length > 0 &&
        parseInt(toastMessageDelaySeconds, 10) > 1000
      ) {
        displayToast(toastMessage, parseInt(toastMessageDelaySeconds, 10));
      }

      if (newItem.hasError) playBadSound();

      return {
        ...state,
        queues: [
          newItem,
          ...state.queues.filter(
            (e) => e.uuid.toUpperCase() !== action.meta.uuid.toUpperCase(),
          ),
        ],
      };
    }
    case types.DYNAFORM_SEND_ITEM_ERROR: {
      console.log('DYNAFORM_SEND_ITEM_ERROR');
      playBadSound();

      const currentItems = state.queues.filter(
        (e) => e.uuid.toUpperCase() === action.meta.uuid.toUpperCase(),
      );
      const newItem = currentItems.length > 0 ? {...currentItems[0]} : null;
      if (newItem === null) return state;
      newItem.isSent = false;
      newItem.hasError = true;
      const payload = isArray(action.payload)
        ? action.payload[0]
        : action.payload;
      const errorMessage = get(payload, 'response.Error.message');
      if (
        get(action.payload, 'status').toString() === '400' &&
        errorMessage.length > 0
      )
        newItem.Message = get(payload, 'response.Error.message');
      else newItem.Message = get(payload, 'name');

      displayApiErrorToast(action.payload, 'Unable to send payload to server');
      return {
        ...state,
        queues: [
          ...state.queues.filter(
            (e) => e.uuid.toUpperCase() !== action.meta.uuid.toUpperCase(),
          ),
          newItem,
        ],
      };
    }
    case types.DYNAFORM_UPDATE_IS_SYNCING: {
      return {
        ...state,
        isSyncing: action.flag,
      };
    }
    case types.DYNAFORM_CLEAR_QUEUE: {
      return {
        ...state,
        queues: state.queues.filter((e) => e.dynaFormId !== action.dynaFormId),
      };
    }
    case types.DYNAFORM_REMOVE_PAYLOAD: {
      console.log('DYNAFORM_REMOVE_PAYLOAD');
      return {
        ...state,
        queues: state.queues.filter((e) => e.uuid !== action.uuid),
      };
    }
    case types.DYNAFORM_ADD_PAYLOAD: {
      console.log('DYNAFORM_ADD_PAYLOAD');
      playGoodSound();

      return dotProp.merge(state, 'queues', action.payload);
      // return {
      //   ...state,
      //   queues: [...state.queues, action.payload],
      // };
    }
    case types.DYNAFORM_GET_FORMS_SUCCESS: {
      console.log('DYNAFORM_GET_FORMS_SUCCESS');
      let payload = isArray(action.payload) ? action.payload : [action.payload];

      payload = payload.map((e) => ({
        dynaFormId: e.dynaFormId,
        dynaFormName: e.dynaFormName,
        dynaFormDescription: e.dynaFormDescription,
        operationTypeName: e.operationTypeName,
        dynaFormSchemaName: e.dynaFormSchemaName,
        dynaFormSchemaItemId: e.dynaFormSchemaItemId,
        schemaItemName: e.schemaItemName,
        schemaItemDescription: e.schemaItemDescription,
        schemaItemTypeName: e.schemaItemTypeName,
        insertProcedure: e.insertProcedure,
        updateProcedure: e.updateProcedure,
        deleteProcedure: e.deleteProcedure,
        schemaItemGroupValue: e.schemaItemGroupValue,
        defaultFocus: e.defaultFocus,
        keyboardType: e.keyboardType,
        isPrimary: e.isPrimary,
        isHidden: e.isHidden,
        isOptional: e.isOptional,
        isUnique: e.isUnique,
        autoClearOnFocus: e.autoClearOnFocus,
        autoClearOnSubmit: e.autoClearOnSubmit,
        shouldHideValue: e.shouldHideValue,
        validationRules: e.validationRules,
        formHasLayoutDefined: e.formHasLayoutDefined,
        formLayout: e.formLayout,
        defaultValue: e.defaultValue,
      }));

      return {
        ...state,
        forms: payload,
      };
    }
    case types.DYNAFORM_GET_FORMS_ERROR: {
      displayApiErrorToast(action.payload, 'Unable to get forms from server');
      playBadSound();
      return state;
    }
    default:
      return state;
  }
}

// export const syncTask = (task) => {
//   const { quickScanStore, appStore } = store.getState();
//   // const task = quickScanStore.tasks.filter((e) => e.taskGuid === taskGuid);
//   // console.log(quickScanStore.scannedPacks);
//   const packsToSync = quickScanStore.scannedPacks
//     .filter((e) => e.taskGuid === task.taskGuid && (!e.isSent || e.isError));
//   const { token } = appStore;
//   const apiUrl = apiUrlSelector(store.getState());
//   store.dispatch(setIsSyncing(true));
//   if (packsToSync.length > 0) {
//     packsToSync.forEach((e) => {
//       store.dispatch(apiSendItem(apiUrl, token, task, e));
//     });
//   }
//   setTimeout(() => store.dispatch(setIsSyncing(false)), 5000);
// };
