import dotProp from 'dot-prop-immutable';
import get from 'lodash/get';
import {isArray, compact} from 'lodash';
import * as types from '../../actions/loadPlanning/loadPlanningActions';
import initialState from '../initialState';
import {playBadSound, playGoodSound} from '../../components/common/playSound';
import {
  displayApiErrorToast,
  displayToast,
  getApiErrorMessage,
} from '../../helpers/utils';
import logger from '../../helpers/logger';
import { Alert } from 'react-native';

export const getWorkSplitFromBin = (
  apiUrl,
  apiToken,
  consignmentID,
  packNo,
) => ({
  type: types.LOADPLANNING_GET_WORKSPLITFORMBIN,
  payload: {
    apiUrl,
    apiToken,
    consignmentID,
    packNo,
  },
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/LoadPlanning/Consignments/${consignmentID}/WorkSplitFromBin/${packNo}`,
        method: 'GET',
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'LOADPLANNING_GET_WORKSPLITFORMBIN_SUCCESS',
        meta: {
          apiUrl,
          apiToken,
          consignmentID,
          packNo,
        },
      },
      rollback: {
        type: 'LOADPLANNING_GET_WORKSPLITFORMBIN_ERROR',
        meta: {
          apiUrl,
          apiToken,
          consignmentID,
          packNo,
        },
      },
    },
  },
});

export const addToWorkSplitFromBin = (
  apiUrl,
  apiToken,
  consignmentID,
  packNo,
  tallyLength,
  quantity,
) => ({
  type: types.LOADPLANNING_ADD_WORKSPLITFORMBIN,
  payload: {
    apiUrl,
    apiToken,
    consignmentID,
    packNo,
    tallyLength,
    quantity,
  },
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/LoadPlanning/Consignments/${consignmentID}/AddToWorkSplitFromBin/${packNo}/Length/${tallyLength}/Qty/${quantity}`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'LOADPLANNING_ADD_WORKSPLITFORMBIN_SUCCESS',
        meta: {
          apiUrl,
          apiToken,
          consignmentID,
          packNo,
          tallyLength,
          quantity,
        },
      },
      rollback: {
        type: 'LOADPLANNING_ADD_WORKSPLITFORMBIN_ERROR',
        meta: {
          apiUrl,
          apiToken,
          consignmentID,
          packNo,
          tallyLength,
          quantity,
        },
      },
    },
  },
});

export const deleteFromWorkSplitFromBin = (
  apiUrl,
  apiToken,
  consignmentID,
  packNo,
  splitFromBinID,
) => ({
  type: types.LOADPLANNING_DELETE_WORKSPLITFORMBIN,
  payload: {
    apiUrl,
    apiToken,
    consignmentID,
    packNo,
    splitFromBinID,
  },
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/LoadPlanning/Consignments/${consignmentID}/DeleteFromWorkSplitFromBin/${packNo}/BinID/${splitFromBinID}`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'LOADPLANNING_DELETE_WORKSPLITFORMBIN_SUCCESS',
        meta: {
          apiUrl,
          apiToken,
          consignmentID,
          packNo,
          splitFromBinID,
        },
      },
      rollback: {
        type: 'LOADPLANNING_DELETE_WORKSPLITFORMBIN_ERROR',
        meta: {
          apiUrl,
          apiToken,
          consignmentID,
          packNo,
          splitFromBinID,
        },
      },
    },
  },
});

export const loadLoads = (apiUrl, apiToken) => ({
  type: types.LOADPLANNING_GET_LOADS,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/LoadPlanning/Loads`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {type: 'LOADPLANNING_GET_LOADS_SUCCESS', meta: {}},
      rollback: {type: 'LOADPLANNING_GET_LOADS_ERROR', meta: {}},
    },
  },
});

export const refreshVerifyPacks = (payload) => ({
  type: types.LOADPLANNING_GET_VERIFY_PACKS,
  payload: {payload},
  meta: {
    offline: {
      effect: {
        url: `${payload.apiUrl}/api/LoadPlanning/Loads/${payload.loadId}/VerifyPacks`,
        headers: {Authorization: `Bearer ${payload.apiToken}`},
      },
      commit: {
        type: 'LOADPLANNING_GET_VERIFY_PACKS_SUCCESS',
        meta: {payload},
      },
      rollback: {
        type: 'LOADPLANNING_GET_VERIFY_PACKS_ERROR',
        meta: {payload},
      },
    },
  },
});

export const loadVerifyPacks = (apiUrl, apiToken, loadId) => ({
  type: types.LOADPLANNING_GET_VERIFY_PACKS,
  payload: {loadId},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/LoadPlanning/Loads/${loadId}/VerifyPacks`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'LOADPLANNING_GET_VERIFY_PACKS_SUCCESS',
        meta: {loadId},
      },
      rollback: {
        type: 'LOADPLANNING_GET_VERIFY_PACKS_ERROR',
        meta: {loadId},
      },
    },
  },
});

export const postVerifyPack = (
  apiUrl,
  apiToken,
  loadId,
  consignmentId,
  packNo,
) => ({
  type: types.LOADPLANNING_POST_VERIFY_PACK,
  payload: {apiUrl, apiToken, loadId, consignmentId, packNo},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/LoadPlanning/Consignments/${consignmentId}/VerifyPack/${packNo}`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'LOADPLANNING_POST_VERIFY_PACK_SUCCESS',
        meta: {
          then: refreshVerifyPacks,
          apiUrl,
          apiToken,
          loadId,
          consignmentId,
          packNo,
        },
      },
      rollback: {
        type: 'LOADPLANNING_POST_VERIFY_PACK_ERROR',
        meta: {
          apiUrl,
          apiToken,
          loadId,
          consignmentId,
          packNo,
        },
      },
    },
  },
});

export const loadConsignmentPacks = (apiUrl, apiToken, consignmentID) => ({
  type: types.LOADPLANNING_GET_CONSIGNMENTPACKS,
  payload: {consignmentID},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/LoadPlanning/Consignments/${consignmentID}/Packs`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'LOADPLANNING_GET_CONSIGNMENTPACKS_SUCCESS',
        meta: {consignmentID},
      },
      rollback: {
        type: 'LOADPLANNING_GET_CONSIGNMENTPACKS_ERROR',
        meta: {consignmentID},
      },
    },
  },
});

export const loadConsignmentReservedPacks = (
  apiUrl,
  apiToken,
  consignmentID,
) => ({
  type: types.LOADPLANNING_GET_CONSIGNMENTRESERVEDPACKS,
  payload: {consignmentID},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/LoadPlanning/Consignments/${consignmentID}/ReservedPacks`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'LOADPLANNING_GET_CONSIGNMENTRESERVEDPACKS_SUCCESS',
        meta: {consignmentID},
      },
      rollback: {
        type: 'LOADPLANNING_GET_CONSIGNMENTRESERVEDPACKS_ERROR',
        meta: {consignmentID},
      },
    },
  },
});

export const loadConsignmentItems = (apiUrl, apiToken, consignmentID) => ({
  type: types.LOADPLANNING_GET_CONSIGNMENTITEMS,
  payload: {consignmentID},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/LoadPlanning/Consignments/${consignmentID}`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'LOADPLANNING_GET_CONSIGNMENTITEMS_SUCCESS',
        meta: {consignmentID},
      },
      rollback: {
        type: 'LOADPLANNING_GET_CONSIGNMENTITEMS_ERROR',
        meta: {consignmentID},
      },
    },
  },
});

export const getSplitPackDetails = (
  apiUrl,
  apiToken,
  consignmentID,
  packNo,
) => ({
  type: types.LOADPLANNING_GET_SPLITPACKDETAILS,
  payload: {consignmentID, packNo},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/LoadPlanning/Consignments/${consignmentID}/Packs/${packNo}`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'LOADPLANNING_GET_SPLITPACKDETAILS_SUCCESS',
        meta: {consignmentID, packNo},
      },
      rollback: {
        type: 'LOADPLANNING_GET_SPLITPACKDETAILS_ERROR',
        meta: {consignmentID, packNo},
      },
    },
  },
});

export const loadLoadItems = (payload) => ({
  type: types.LOADPLANNING_GET_LOADITEMS,
  payload: {payload},
  meta: {
    offline: {
      effect: {
        url: `${payload.apiUrl}/api/LoadPlanning/LoadItems?LoadID=${payload.loadID}`,
        headers: {Authorization: `Bearer ${payload.apiToken}`},
      },
      commit: {type: 'LOADPLANNING_GET_LOADITEMS_SUCCESS', meta: {payload}},
      rollback: {type: 'LOADPLANNING_GET_LOADITEMS_ERROR', meta: {payload}},
    },
  },
});

export const reservePack = (
  apiUrl,
  apiToken,
  loadID,
  consignmentID,
  packNo,
) => ({
  type: types.LOADPLANNING_RESERVE_PACK,
  payload: {
    apiUrl,
    apiToken,
    loadID,
    consignmentID,
    packNo,
  },
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/LoadPlanning/Consignments/${consignmentID}/Reserve/${packNo}`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'LOADPLANNING_RESERVE_PACK_SUCCESS',
        meta: {
          then: loadLoadItems,
          apiUrl,
          apiToken,
          loadID,
          consignmentID,
          packNo,
        },
      },
      rollback: {
        type: 'LOADPLANNING_RESERVE_PACK_ERROR',
        meta: {
          apiUrl,
          apiToken,
          loadID,
          consignmentID,
          packNo,
        },
      },
    },
  },
});

export const splitPack = (apiUrl, apiToken, loadID, consignmentID, packNo) => ({
  type: types.LOADPLANNING_SPLIT_PACK,
  payload: {
    apiUrl,
    apiToken,
    loadID,
    consignmentID,
    packNo,
  },
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/LoadPlanning/Consignments/${consignmentID}/Split/${packNo}`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'LOADPLANNING_SPLIT_PACK_SUCCESS',
        meta: {
          then: loadLoadItems,
          apiUrl,
          apiToken,
          loadID,
          consignmentID,
          packNo,
        },
      },
      rollback: {
        type: 'LOADPLANNING_SPLIT_PACK_ERROR',
        meta: {
          apiUrl,
          apiToken,
          loadID,
          consignmentID,
          packNo,
        },
      },
    },
  },
});

export const unreservePack = (
  apiUrl,
  apiToken,
  loadID,
  consignmentID,
  packNo,
) => ({
  type: types.LOADPLANNING_UNRESERVE_PACK,
  payload: {
    apiUrl,
    apiToken,
    loadID,
    consignmentID,
    packNo,
  },
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/LoadPlanning/Consignments/${consignmentID}/Unreserve/${packNo}`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'LOADPLANNING_UNRESERVE_PACK_SUCCESS',
        meta: {
          then: loadLoadItems,
          apiUrl,
          apiToken,
          loadID,
          consignmentID,
          packNo,
        },
      },
      rollback: {
        type: 'LOADPLANNING_UNRESERVE_PACK_ERROR',
        meta: {
          apiUrl,
          apiToken,
          loadID,
          consignmentID,
          packNo,
        },
      },
    },
  },
});

export const updateSplitPackLengthDropdownInput = (splitPackLengthInput) => ({
  type: types.LOADPLANNING_SET_SPLITPACKLENGTHDROPDOWN_INPUT,
  splitPackLengthInput,
});

export const updateSplitCountInput = (splitCountInput) => ({
  type: types.LOADPLANNING_SET_SPLITCOUNT_INPUT,
  splitCountInput,
});

export const reservePackStub = (consignmentID, packNo) => ({
  type: types.LOADPLANNING_RESERVE_PACK_STUB,
  consignmentID,
  packNo,
});

export const updateLoadInput = (loadInput) => ({
  type: types.LOADPLANNING_SET_LOAD_INPUT,
  loadInput,
});

export const updateScanPackInput = (scanPackInput) => ({
  type: types.LOADPLANNING_SET_SCANPACK_INPUT,
  scanPackInput,
});

export const updatePackListOptionsInput = (packListOptionsInput) => ({
  type: types.LOADPLANNING_SET_PACKLISTOPTIONS_INPUT,
  packListOptionsInput,
});

export const updatePackOptionsInput = (packOptionsInput) => ({
  type: types.LOADPLANNING_SET_PACKOPTIONS_INPUT,
  packOptionsInput,
});

export const addToSplitPackSummary = (tallyInput) => ({
  type: types.LOADPLANNING_ADD_SPLITPACKSUMMARY,
  tallyInput,
});

export const deleteFromSplitPackSummary = (tallyInput) => ({
  type: types.LOADPLANNING_DELETE_SPLITPACKSUMMARY,
  tallyInput,
});

export default function loadPlanningReducer(
  state = initialState.loadPlanningStore,
  action,
) {
  switch (action.type) {
    case types.LOADPLANNING_SET_LOAD_INPUT:
      return {
        ...state,
        loadInput: action.loadInput,
      };
    case types.LOADPLANNING_SET_SPLITCOUNT_INPUT:
      return {
        ...state,
        splitCountInput: action.splitCountInput,
      };
    case types.LOADPLANNING_SET_SPLITPACKLENGTHDROPDOWN_INPUT:
      return {
        ...state,
        splitPackLengthInput: Number.parseFloat(action.splitPackLengthInput),
      };
    case types.LOADPLANNING_SET_SCANPACK_INPUT:
      return {
        ...state,
        scanPackInput: action.scanPackInput,
      };
    case types.LOADPLANNING_SET_PACKOPTIONS_INPUT:
      return {
        ...state,
        packOptionsInput: action.packOptionsInput,
      };
    case types.LOADPLANNING_SET_PACKLISTOPTIONS_INPUT:
      return {
        ...state,
        packListOptionsInput: action.packListOptionsInput,
      };
    case types.LOADPLANNING_DELETE_WORKSPLITFORMBIN_SUCCESS: {
      return dotProp.set(
        state,
        'splitPackSummary',
        isArray(action.payload) ? action.payload : [action.payload],
      );
    }
    case types.LOADPLANNING_GET_WORKSPLITFORMBIN_SUCCESS: {
      return dotProp.set(
        state,
        'splitPackSummary',
        isArray(action.payload) ? action.payload : [action.payload],
      );
    }
    case types.LOADPLANNING_ADD_WORKSPLITFORMBIN_SUCCESS: {
      return dotProp.set(
        state,
        'splitPackSummary',
        isArray(action.payload) ? action.payload : [action.payload],
      );
    }
    case types.LOADPLANNING_ADD_WORKSPLITFORMBIN_ERROR: {
      const isError = get(action.payload, 'response.IsError');
      const errorMessage =
        get(action.payload, 'response.Error.message') || 'Error';
      if (isError) {
        displayToast(errorMessage);
      } else {
        displayToast('Unable to add to Bin Split');
      }
      playBadSound();
      return state;
    }
    case types.LOADPLANNING_GET_LOADS_SUCCESS:
      console.log('LOADPLANNING_GET_LOADS_SUCCESS');
      return {
        ...state,
        loads: [].concat(action.payload),
      };
    case types.LOADPLANNING_GET_LOADS_ERROR:
      displayApiErrorToast(action.payload, 'Unable to retrieve load list');
      return state;
    case types.LOADPLANNING_RESERVE_PACK_STUB: {
      logger.debug('LOADPLANNING_RESERVE_PACK_STUB');
      const consignmentPath1 = `consignmentItems.${action.consignmentID}`;
      let consignmentPacks1 = dotProp.get(state, consignmentPath1);
      if (!isArray(consignmentPacks1)) {
        logger.warn('ConsignmentPacks1 is not an array!');
        consignmentPacks1 = [];
      }
      const foundPacks = consignmentPacks1.filter(
        (e) => e.packetNo?.toLowerCase() === action.packNo?.toLowerCase(),
      );
      if (foundPacks.length > 0) {
        foundPacks[0] = {...action.payload, status: 'Duplicate?'};
      } else {
        consignmentPacks1.unshift({
          packetNo: action.packNo.toUpperCase(),
          status: 'New',
        });
      }
      return dotProp.set(state, consignmentPath1, consignmentPacks1);
      // return dotProp.set(state, consignmentPath1, {...consignmentPacks1});
    }
    case types.LOADPLANNING_GET_SPLITPACKDETAILS_SUCCESS: {
      return dotProp.set(
        state,
        'splitPackDetails',
        isArray(action.payload) && action.payload.length > 0
          ? action.payload[0]
          : action.payload,
      );
    }
    case types.LOADPLANNING_GET_SPLITPACKDETAILS_ERROR: {
      console.log('LOADPLANNING_GET_SPLITPACKDETAILS_ERROR');
      displayApiErrorToast(action.payload, 'Unable to get pack details');
      // const errorMessage =
      //   get(action.payload, 'response.Error.message') || 'API error';
      const {message: errorMessage} = getApiErrorMessage(action.payload);
      logger.error(errorMessage);
      playBadSound();
      return dotProp.set(
        state,
        'splitPackDetails',
        initialState.loadPlanningStore.splitPackDetails,
      );
    }
    case types.LOADPLANNING_RESERVE_PACK_SUCCESS: {
      logger.debug('LOADPLANNING_RESERVE_PACK_SUCCESS');
      const consignmentReservePackSuccessPath = `consignmentItems.${action.meta.consignmentID}`;
      let consignmentPacks = dotProp.get(
        state,
        consignmentReservePackSuccessPath,
      );
      if (!isArray(consignmentPacks)) {
        logger.warn('ConsignmentPacks is not an array!');
        consignmentPacks = [];
      }
      consignmentPacks = compact(consignmentPacks).filter(
        (e) => e.packetNo?.toLowerCase() !== action.meta?.packNo?.toLowerCase(),
      );
      // eslint-disable-next-line no-param-reassign
      action.payload = Object.assign(action.payload, action.meta);
      consignmentPacks.unshift(
        isArray(action.payload) ? action.payload.pop() : action.payload,
      );
      const newState = dotProp.set(
        state,
        consignmentReservePackSuccessPath,
        consignmentPacks,
      );
      playGoodSound();
      return newState;
    }
    case types.LOADPLANNING_UNRESERVE_PACK_ERROR: {
      logger.debug('LOADPLANNING_UNRESERVE_PACK_ERROR');
      displayApiErrorToast(action.payload, 'Unable to unreserve pack');
      const {message: errorMessage} = getApiErrorMessage(action.payload);
      const consignmentUnReservePackErrorPath = `consignmentItems.${action.meta.consignmentID}`;
      const consignmentPacks5 = dotProp.get(
        state,
        consignmentUnReservePackErrorPath,
      );
      if (!isArray(consignmentPacks5)) {
        logger.warn('ConsignmentPacks5 is not an array!');
        return state;
      }
      const foundPacks5 = consignmentPacks5.filter(
        (e) => e.packetNo?.toLowerCase() === action.meta?.packNo?.toLowerCase(),
      );
      if (foundPacks5.length > 0) {
        foundPacks5[0].status = errorMessage || 'Error';
      }
      playBadSound();
      return dotProp.set(
        state,
        consignmentUnReservePackErrorPath,
        consignmentPacks5,
      );
      // return state;
    }
    case types.LOADPLANNING_UNRESERVE_PACK_SUCCESS: {
      const consignmentUnreservePackSuccessPath = `consignmentItems.${action.meta.consignmentID}`;
      const consignmentPacks4 = dotProp.get(
        state,
        consignmentUnreservePackSuccessPath,
      );

      if (!isArray(consignmentPacks4)) {
        logger.warn('ConsignmentPacks3 is not an array!');
        return state;
      }
      playGoodSound();
      // eslint-disable-next-line no-param-reassign
      action.payload = Object.assign(action.payload, action.meta);
      return dotProp.set(
        state,
        consignmentUnreservePackSuccessPath,
        consignmentPacks4.filter(
          (e) =>
            e.packetNo?.toLowerCase() !== action.meta?.packNo?.toLowerCase(),
        ),
      );
    }
    case types.LOADPLANNING_POST_VERIFY_PACK_SUCCESS: {
      logger.debug('LOADPLANNING_POST_VERIFY_PACK_SUCCESS');
      // eslint-disable-next-line no-param-reassign
      action.payload = action.meta;
      return state;
    }
    case types.LOADPLANNING_POST_VERIFY_PACK_ERROR: {
      logger.debug('LOADPLANNING_POST_VERIFY_PACK_ERROR');
      return state;
    }
    case types.LOADPLANNING_SPLIT_PACK_SUCCESS: {
      const consignmentSplitPackSucessPath = `consignmentItems.${action.meta.consignmentID}`;
      // Insert meta data into payload for action chaining
      action.payload = Object.assign(action.payload, action.meta);
      playGoodSound();
      // Clear split pack summary
      const tempState = dotProp.set(state, 'splitPackSummary', []);
      // Save the new consignment details
      return dotProp.merge(
        tempState,
        consignmentSplitPackSucessPath,
        action.payload,
      );
    }
    case types.LOADPLANNING_RESERVE_PACK_ERROR: {
      logger.debug('LOADPLANNING_RESERVE_PACK_ERROR');
      displayApiErrorToast(action.payload, 'Unable to reserve pack');
      // const errorMessage =
      //   get(action.payload, 'response.Error.message') || 'API error';
      const {message: errorMessage} = getApiErrorMessage(action.payload);
      playBadSound();
      const consignmentPath2 = `consignmentItems.${action.meta.consignmentID}`;
      let consignmentPacks2 = dotProp.get(state, consignmentPath2);
      if (!isArray(consignmentPacks2)) {
        logger.warn('ConsignmentPacks2 is not an array!');
        return state;
      }

      consignmentPacks2 = consignmentPacks2.filter(
        (e) => e.packetNo?.toLowerCase() !== action.meta?.packNo?.toLowerCase(),
      );
      // const foundPacks2 = consignmentPacks2.filter(
      //   (e) => e.packetNo?.toLowerCase() === action.meta?.packNo?.toLowerCase(),
      // );
      // if (foundPacks2.length > 0) {
      //   // foundPacks2[0] = {...action.payload, status: errorMessage};
      //   foundPacks2[0].status = errorMessage;
      // }
      console.log(consignmentPacks2);
      consignmentPacks2.unshift({
        packetNo: action.meta.packNo,
        status: errorMessage,
      });
      return dotProp.set(state, consignmentPath2, consignmentPacks2);
    }
    case types.LOADPLANNING_SPLIT_PACK_ERROR: {
      displayApiErrorToast(action.payload, 'Unable to split pack');
      const {message: errorMessage} = getApiErrorMessage(action.payload);
      playBadSound();
      return dotProp.set(state, 'splitPackSummary', []);
    }
    case types.LOADPLANNING_CLEAR_LOADITEMS: {
      logger.debug('LOADPLANNING_CLEAR_LOADITEMS');
      return {
        ...state,
        loadItems: [],
      };
    }
    case types.LOADPLANNING_SAVE_LOADITEMS:
      logger.debug('LOADPLANNING_SAVE_LOADITEMS');
      return {
        ...state,
        loadItems: [].concat(action.consignments),
      };
    case types.LOADPLANNING_GET_LOADITEMS_SUCCESS:
      logger.debug('LOADPLANNING_GET_LOADITEMS_SUCCESS');
      if (isArray(action.payload))
        return {
          ...state,
          loadItems: action.payload,
        };
      return {
        ...state,
        loadItems: [].concat(action.payload),
      };
    case types.LOADPLANNING_GET_CONSIGNMENTITEMS_ERROR: {
      logger.debug('LOADPLANNING_GET_CONSIGNMENTITEMS_ERROR');
      return state;
    }
    case types.LOADPLANNING_PURGE_INVALID_CONSIGNMENTITEMS: {
      logger.debug('LOADPLANNING_PURGE_INVALID_CONSIGNMENTITEMS');
      const consignmentItemsPath = `consignmentItems.${action.consignmentID}`;
      let consignmentItemsSuccessPacks = dotProp.get(
        state,
        consignmentItemsPath,
      );
      if (!isArray(consignmentItemsSuccessPacks))
        consignmentItemsSuccessPacks = [];

      consignmentItemsSuccessPacks = consignmentItemsSuccessPacks.filter(
        (e) => e.status === undefined,
      );
      return dotProp.set(
        state,
        consignmentItemsPath,
        consignmentItemsSuccessPacks,
      );
      // if (isArray(action.payload))
      // return dotProp.set(
      //   state,
      //   consignmentItemsPath,
      //   [].concat(action.payload),
      // );
    }
    case types.LOADPLANNING_GET_CONSIGNMENTITEMS_SUCCESS: {
      logger.debug('LOADPLANNING_GET_CONSIGNMENTITEMS_SUCCESS');
      const consignmentItemsPath = `consignmentItems.${action.meta.consignmentID}`;
      let consignmentItemsSuccessPacks = dotProp.get(
        state,
        consignmentItemsPath,
      );
      // if (!isArray(consignmentItemsSuccessPacks))
      consignmentItemsSuccessPacks = [];

      // consignmentItemsSuccessPacks = compact(consignmentItemsSuccessPacks);
      // consignmentItemsSuccessPacks = consignmentItemsSuccessPacks.filter(
      //   (e) => e !== null && e.status !== undefined,
      // );
      // logger.debug(consignmentItemsSuccessPacks);
      // action.payload = isArray(action.payload)
      //   ? action.payload[0]
      //   : action.payload;
      return dotProp.set(
        state,
        consignmentItemsPath,
        consignmentItemsSuccessPacks.concat(action.payload),
      );
      // if (isArray(action.payload))
      // return dotProp.set(
      //   state,
      //   consignmentItemsPath,
      //   [].concat(action.payload),
      // );
    }
    case types.LOADPLANNING_GET_CONSIGNMENTPACKS_ERROR: {
      console.log('LOADPLANNING_GET_CONSIGNMENTPACKS_ERROR');
      return state;
    }
    case types.LOADPLANNING_GET_CONSIGNMENTPACKS_SUCCESS: {
      console.log('LOADPLANNING_GET_CONSIGNMENTPACKS_SUCCESS');
      const consignmentPacksPath = `consignmentPacks.${action.meta.consignmentID}`;
      if ([].concat(action.payload).length > 0) {
        return dotProp.set(
          state,
          consignmentPacksPath,
          [].concat(action.payload),
        );
      }
      return state;
    }
    case types.LOADPLANNING_GET_CONSIGNMENTRESERVEDPACKS_SUCCESS: {
      console.log('LOADPLANNING_GET_CONSIGNMENTRESERVEDPACKS_SUCCESS');
      const consignmentReservedPacksPath = `consignmentReservedPacks.${action.meta.consignmentID}`;
      if ([].concat(action.payload).length > 0) {
        return dotProp.set(
          state,
          consignmentReservedPacksPath,
          [].concat(action.payload),
        );
      }
      return state;
    }
    case types.LOADPLANNING_GET_LOADITEMS_ERROR:
      displayApiErrorToast(action.payload, 'Unable to retrieve load items');
      const {message: errorMessage} = getApiErrorMessage(action.payload);
      return state;
    case types.LOADPLANNING_CLEAR_UNKNOWN_PACKS: {
      return {
        ...state,
        unknownPacks: [],
      };
    }
    case types.LOADPLANNING_SAVE_UNKNOWN_PACKS: {
      logger.debug('LOADPLANNING_SAVE_UNKNOWN_PACKS');
      return {
        ...state,
        unknownPacks: action.unknownPacks,
      };
    }
    case types.LOADPLANNING_CLEAR_VERIFY_PACKS: {
      return {
        ...state,
        verifyPacks: [],
      };
    }
    case types.LOADPLANNING_SAVE_VERIFY_PACKS: {
      logger.debug('LOADPLANNING_SAVE_VERIFY_PACKS');
      return {
        ...state,
        verifyPacks: action.verifyPacks,
      };
    }
    case types.LOADPLANNING_GET_VERIFY_PACKS_SUCCESS: {
      logger.debug('LOADPLANNING_GET_VERIFY_PACKS_SUCCESS');
      return {
        ...state,
        verifyPacks: action.payload,
      };
    }
    case types.LOADPLANNING_GET_VERIFY_PACKS_ERROR: {
      logger.debug('LOADPLANNING_GET_VERIFY_PACKS_ERROR');
      return state;
    }
    default:
      return state;
  }
}

export const clearUnknownPacks = () => ({
  type: types.LOADPLANNING_CLEAR_UNKNOWN_PACKS,
});

export const saveUnknownPacks = (unknownPacks) => ({
  type: types.LOADPLANNING_SAVE_UNKNOWN_PACKS,
  unknownPacks,
});

export const clearVerifyPacks = () => ({
  type: types.LOADPLANNING_CLEAR_VERIFY_PACKS,
});

export const saveVerifyPacks = (verifyPacks) => ({
  type: types.LOADPLANNING_SAVE_VERIFY_PACKS,
  verifyPacks,
});

export const purgeInvalidConsignmentPackets = (consignmentID) => ({
  type: types.LOADPLANNING_PURGE_INVALID_CONSIGNMENTITEMS,
  consignmentID,
});

export const saveLoadItems = (consignments) => ({
  type: types.LOADPLANNING_SAVE_LOADITEMS,
  consignments,
});

export const clearLoadItems = () => ({
  type: types.LOADPLANNING_CLEAR_LOADITEMS,
});
