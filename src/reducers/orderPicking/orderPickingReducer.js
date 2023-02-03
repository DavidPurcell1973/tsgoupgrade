import dotProp from 'dot-prop-immutable';
import isArray from 'lodash/isArray';
import get from 'lodash/get';
import logger from '../../helpers/logger';
import * as types from '../../actions/orderPicking/orderPickingActions';
import initialState from '../initialState';
import {playGoodSound, playBadSound} from '../../components/common/playSound';
import {displayToast, displayApiErrorToast} from '../../helpers/utils';

export const loadOrders = (apiUrl, apiToken) => ({
  type: types.ORDERPICKING_GET_ORDERS,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/OrderPicking/Orders`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {type: 'ORDERPICKING_GET_ORDERS_SUCCESS', meta: {}},
      rollback: {type: 'ORDERPICKING_GET_ORDERS_ERROR', meta: {}},
    },
  },
});

export const loadOrderItems = (payload) => ({
  type: types.ORDERPICKING_GET_ORDERITEMS,
  payload: {payload},
  meta: {
    offline: {
      effect: {
        url: `${payload.apiUrl}/api/OrderPicking/Orders/${payload.orderNo}/OrderItems`,
        headers: {Authorization: `Bearer ${payload.apiToken}`},
      },
      commit: {type: 'ORDERPICKING_GET_ORDERITEMS_SUCCESS', meta: {payload}},
      rollback: {type: 'ORDERPICKING_GET_ORDERITEMS_ERROR', meta: {payload}},
    },
  },
});

export const loadOrderItemItems = (apiUrl, apiToken, orderNo, orderItem) => ({
  type: types.ORDERPICKING_GET_ORDERITEMITEMS,
  payload: {
    apiUrl,
    apiToken,
    orderNo,
    orderItem,
  },
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/OrderPicking/Orders/${orderNo}/OrderItems/${orderItem}`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'ORDERPICKING_GET_ORDERITEMITEMS_SUCCESS',
        meta: {
          apiUrl,
          apiToken,
          orderNo,
          orderItem,
        },
      },
      rollback: {
        type: 'ORDERPICKING_GET_ORDERITEMITEMS_ERROR',
        meta: {
          apiUrl,
          apiToken,
          orderNo,
          orderItem,
        },
      },
    },
  },
});

export const loadOrderNoOrderItemReservedPacks = (
  apiUrl,
  apiToken,
  orderNo,
  orderItem,
) => ({
  type: types.ORDERPICKING_GET_ORDERRESERVEDPACKS,
  payload: {orderNo, orderItem},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/OrderPicking/Orders/${orderNo}/OrderItems/${orderItem}/ReservedPacks`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'ORDERPICKING_GET_ORDERRESERVEDPACKS_SUCCESS',
        meta: {orderNo, orderItem},
      },
      rollback: {
        type: 'ORDERPICKING_GET_ORDERRESERVEDPACKS_ERROR',
        meta: {orderNo, orderItem},
      },
    },
  },
});

export const loadOrderNoOrderItemPacks = (
  apiUrl,
  apiToken,
  orderNo,
  orderItem,
) => ({
  type: types.ORDERPICKING_GET_ORDERPACKS,
  payload: {orderNo, orderItem},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/OrderPicking/Orders/${orderNo}/OrderItems/${orderItem}/Packs`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'ORDERPICKING_GET_ORDERPACKS_SUCCESS',
        meta: {orderNo, orderItem},
      },
      rollback: {
        type: 'ORDERPICKING_GET_ORDERPACKS_ERROR',
        meta: {orderNo, orderItem},
      },
    },
  },
});

export const getSplitPackDetails = (
  apiUrl,
  apiToken,
  orderNo,
  orderItem,
  packNo,
) => ({
  type: types.ORDERPICKING_GET_SPLITPACKDETAILS,
  payload: {orderNo, orderItem, packNo},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/OrderPicking/Orders/${orderNo}/OrderItems/${orderItem}/Packs/${packNo}`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'ORDERPICKING_GET_SPLITPACKDETAILS_SUCCESS',
        meta: {
          orderNo,
          orderItem,
          packNo,
          then: updateSplitCountInput,
        },
      },
      rollback: {
        type: 'ORDERPICKING_GET_SPLITPACKDETAILS_ERROR',
        meta: {orderNo, orderItem, packNo},
      },
    },
  },
});

export const reservePack = (apiUrl, apiToken, orderNo, orderItem, packNo) => ({
  type: types.ORDERPICKING_RESERVE_PACK,
  payload: {
    apiUrl,
    apiToken,
    orderNo,
    orderItem,
    packNo,
  },
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/OrderPicking/Orders/${orderNo}/OrderItems/${orderItem}/Reserve/${packNo}`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'ORDERPICKING_RESERVE_PACK_SUCCESS',
        meta: {
          then: loadOrderItems,
          apiUrl,
          apiToken,
          orderNo,
          orderItem,
          packNo,
        },
      },
      rollback: {
        type: 'ORDERPICKING_RESERVE_PACK_ERROR',
        meta: {
          apiUrl,
          apiToken,
          orderNo,
          orderItem,
          packNo,
        },
      },
    },
  },
});

export const splitPack = (apiUrl, apiToken, orderNo, orderItem, packNo) => ({
  type: types.ORDERPICKING_SPLIT_PACK,
  payload: {
    apiUrl,
    apiToken,
    orderNo,
    orderItem,
    packNo,
  },
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/OrderPicking/Orders/${orderNo}/OrderItems/${orderItem}/Split/${packNo}`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'ORDERPICKING_SPLIT_PACK_SUCCESS',
        meta: {
          then: loadOrderItems,
          apiUrl,
          apiToken,
          orderNo,
          orderItem,
          packNo,
        },
      },
      rollback: {
        type: 'ORDERPICKING_SPLIT_PACK_ERROR',
        meta: {
          apiUrl,
          apiToken,
          orderNo,
          orderItem,
          packNo,
        },
      },
    },
  },
});

export const getWorkSplitFromBin = (
  apiUrl,
  apiToken,
  orderNo,
  orderItem,
  packNo,
) => ({
  type: types.ORDERPICKING_GET_WORKSPLITFORMBIN,
  payload: {
    apiUrl,
    apiToken,
    orderNo,
    orderItem,
    packNo,
  },
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/OrderPicking/Orders/${orderNo}/OrderItems/${orderItem}/WorkSplitFromBin/${packNo}`,
        method: 'GET',
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'ORDERPICKING_GET_WORKSPLITFORMBIN_SUCCESS',
        meta: {
          apiUrl,
          apiToken,
          orderNo,
          orderItem,
          packNo,
        },
      },
      rollback: {
        type: 'ORDERPICKING_GET_WORKSPLITFORMBIN_ERROR',
        meta: {
          apiUrl,
          apiToken,
          orderNo,
          orderItem,
          packNo,
        },
      },
    },
  },
});

export const autoSplitFromBin = (
  apiUrl,
  apiToken,
  orderNo,
  orderItem,
  packNo,
) => ({
  type: types.ORDERPICKING_ADD_WORKSPLITFORMBIN,
  payload: {
    apiUrl,
    apiToken,
    orderNo,
    orderItem,
    packNo,
  },
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/OrderPicking/Orders/${orderNo}/OrderItems/${orderItem}/AutoSplitFromBin/${packNo}`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'ORDERPICKING_ADD_WORKSPLITFORMBIN_SUCCESS',
        meta: {
          apiUrl,
          apiToken,
          orderNo,
          orderItem,
          packNo,
        },
      },
      rollback: {
        type: 'ORDERPICKING_ADD_WORKSPLITFORMBIN_ERROR',
        meta: {
          apiUrl,
          apiToken,
          orderNo,
          orderItem,
          packNo,
        },
      },
    },
  },
});

export const addToWorkSplitFromBin = (
  apiUrl,
  apiToken,
  orderNo,
  orderItem,
  packNo,
  tallyLength,
  quantity,
) => ({
  type: types.ORDERPICKING_ADD_WORKSPLITFORMBIN,
  payload: {
    apiUrl,
    apiToken,
    orderNo,
    orderItem,
    packNo,
    tallyLength,
    quantity,
  },
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/OrderPicking/Orders/${orderNo}/OrderItems/${orderItem}/AddToWorkSplitFromBin/${packNo}/Length/${tallyLength}/Qty/${quantity}`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'ORDERPICKING_ADD_WORKSPLITFORMBIN_SUCCESS',
        meta: {
          apiUrl,
          apiToken,
          orderNo,
          orderItem,
          packNo,
          tallyLength,
          quantity,
        },
      },
      rollback: {
        type: 'ORDERPICKING_ADD_WORKSPLITFORMBIN_ERROR',
        meta: {
          apiUrl,
          apiToken,
          orderNo,
          orderItem,
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
  orderNo,
  orderItem,
  packNo,
  splitFromBinID,
) => ({
  type: types.ORDERPICKING_DELETE_WORKSPLITFORMBIN,
  payload: {
    apiUrl,
    apiToken,
    orderNo,
    orderItem,
    packNo,
    splitFromBinID,
  },
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/OrderPicking/Orders/${orderNo}/OrderItems/${orderItem}/DeleteFromWorkSplitFromBin/${packNo}/BinID/${splitFromBinID}`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'ORDERPICKING_DELETE_WORKSPLITFORMBIN_SUCCESS',
        meta: {
          apiUrl,
          apiToken,
          orderNo,
          orderItem,
          packNo,
          splitFromBinID,
        },
      },
      rollback: {
        type: 'ORDERPICKING_DELETE_WORKSPLITFORMBIN_ERROR',
        meta: {
          apiUrl,
          apiToken,
          orderNo,
          orderItem,
          packNo,
          splitFromBinID,
        },
      },
    },
  },
});

export const unreservePack = (
  apiUrl,
  apiToken,
  orderNo,
  orderItem,
  packNo,
) => ({
  type: types.ORDERPICKING_UNRESERVE_PACK,
  payload: {
    apiUrl,
    apiToken,
    orderNo,
    orderItem,
    packNo,
  },
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/OrderPicking/Orders/${orderNo}/OrderItems/${orderItem}/Unreserve/${packNo}`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'ORDERPICKING_UNRESERVE_PACK_SUCCESS',
        meta: {
          then: loadOrderItems,
          apiUrl,
          apiToken,
          orderNo,
          orderItem,
          packNo,
        },
      },
      rollback: {
        type: 'ORDERPICKING_UNRESERVE_PACK_ERROR',
        meta: {
          apiUrl,
          apiToken,
          orderNo,
          orderItem,
          packNo,
        },
      },
    },
  },
});

export const updateSplitPackLengthDropdownInput = (splitPackLengthInput) => ({
  type: types.ORDERPICKING_SET_SPLITPACKLENGTHDROPDOWN_INPUT,
  splitPackLengthInput,
});

export const updateSplitCountInput = (splitCountInput) => ({
  type: types.ORDERPICKING_SET_SPLITCOUNT_INPUT,
  splitCountInput,
});

export const reservePackStub = (orderNo, orderItem, packNo) => ({
  type: types.ORDERPICKING_RESERVE_PACK_STUB,
  orderNo,
  orderItem,
  packNo,
});

export const updateOrderInput = (orderInput) => ({
  type: types.ORDERPICKING_SET_ORDER_INPUT,
  orderInput,
});

export const updateScanPackInput = (scanPackInput) => ({
  type: types.ORDERPICKING_SET_SCANPACK_INPUT,
  scanPackInput,
});

export const updatePackListOptionsInput = (packListOptionsInput) => ({
  type: types.ORDERPICKING_SET_PACKLISTOPTIONS_INPUT,
  packListOptionsInput,
});

export const updatePackOptionsInput = (packOptionsInput) => ({
  type: types.ORDERPICKING_SET_PACKOPTIONS_INPUT,
  packOptionsInput,
});

export const addToSplitPackSummary = (tallyInput) => ({
  type: types.ORDERPICKING_ADD_SPLITPACKSUMMARY,
  tallyInput,
});

export const deleteFromSplitPackSummary = (tallyInput) => ({
  type: types.ORDERPICKING_DELETE_SPLITPACKSUMMARY,
  tallyInput,
});

export default function orderPickingReducer(
  state = initialState.orderPickingStore,
  action,
) {
  switch (action.type) {
    case types.ORDERPICKING_SET_ORDER_INPUT:
      return {
        ...state,
        orderInput: action.orderInput,
      };
    case types.ORDERPICKING_GET_ORDERS_SUCCESS:
      return {
        ...state,
        orders: action.payload,
      };
    case types.ORDERPICKING_GET_ORDERPACKS_SUCCESS:
      return {
        ...state,
        orderItemPacks: action.payload,
      };
    case types.ORDERPICKING_GET_ORDERRESERVEDPACKS_SUCCESS:
      return {
        ...state,
        orderItemReservedPacks: action.payload,
      };
    case types.ORDERPICKING_GET_ORDERS_ERROR:
      displayToast('Unable to retrieve order list');
      return {
        ...state,
      };
    case types.ORDERPICKING_SET_SPLITCOUNT_INPUT:
      // Refactored to allow reading quantity value from two different JSON path
      let quantity;

      if (
        action.splitCountInput.orderPickQty !== undefined &&
        action.splitCountInput.orderPickQty.split !== undefined &&
        parseInt(action.splitCountInput.orderPickQty.split('/')[0])
      ) {
        quantity = parseInt(action.splitCountInput.orderPickQty.split('/')[0]);
      } else if (parseInt(action.splitCountInput)) {
        quantity = action.splitCountInput;
      } else {
        quantity = 0;
      }

      return {
        ...state,
        splitCountInput: quantity,
      };
    case types.ORDERPICKING_SET_SPLITPACKLENGTHDROPDOWN_INPUT:
      return {
        ...state,
        splitPackLengthInput: Number.parseFloat(action.splitPackLengthInput),
      };
    case types.ORDERPICKING_SET_SCANPACK_INPUT:
      return {
        ...state,
        scanPackInput: action.scanPackInput,
      };
    case types.ORDERPICKING_SET_PACKOPTIONS_INPUT:
      return {
        ...state,
        packOptionsInput: action.packOptionsInput,
      };
    case types.ORDERPICKING_SET_PACKLISTOPTIONS_INPUT:
      return {
        ...state,
        packListOptionsInput: action.packListOptionsInput,
      };
    case types.ORDERPICKING_RESERVE_PACK_STUB: {
      const reservePackStubPath = `orderItemItems.${action.orderNo}_${action.orderItem}`;
      const packIndex = dotProp
        .get(state, reservePackStubPath)
        .findIndex(
          (e) => e.packetNo.toLowerCase() === action.packNo.toLowerCase(),
        );
      if (packIndex === undefined || packIndex < 0) {
        return dotProp.merge(state, reservePackStubPath, {
          packetNo: action.packNo.toUpperCase(),
          status: 'New',
        });
      }
      return state;
    }
    case types.ORDERPICKING_GET_SPLITPACKDETAILS_SUCCESS: {
      return dotProp.set(state, 'splitPackDetails', action.payload);
    }
    case types.ORDERPICKING_GET_SPLITPACKDETAILS_ERROR: {
      const isError = get(action.payload, 'response.IsError');
      if (isError) {
        const errorMessage =
          get(action.payload, 'response.Error.message') || 'Unknown error';
        displayToast(errorMessage);
      }
      // NavigationService.navigate('OrderPickingOrderItemScanPack');
      return state;
    }
    case types.ORDERPICKING_RESERVE_PACK_SUCCESS: {
      const orderItemReservePackSuccessPath = `orderItemItems.${action.meta.orderNo}_${action.meta.orderItem}`;
      const packIndex = dotProp
        .get(state, orderItemReservePackSuccessPath)
        .findIndex(
          (e) => e.packetNo.toLowerCase() === action.meta.packNo.toLowerCase(),
        );
      if (packIndex < 0) {
        logger.warn(`packIndex is ${packIndex}`);
        return state;
      }
      // Insert meta data into payload for action chaining
      action.payload = Object.assign(action.payload, action.meta);
      const packReservePackSuccessPath = `orderItemItems.${action.meta.orderNo}_${action.meta.orderItem}.${packIndex}`;
      /* eslint no-param-reassign: "error" */
      playGoodSound();
      return dotProp.merge(state, packReservePackSuccessPath, {
        ...action.payload,
        status: 'Reserved',
      });
    }
    case types.ORDERPICKING_UNRESERVE_PACK_ERROR:
      // TO BE IMPLEMENTED
      displayApiErrorToast(action.payload, 'Unable to unreserve pack');
      playBadSound();
      return state;
    case types.ORDERPICKING_UNRESERVE_PACK_SUCCESS: {
      const orderItemItemsUnreservePackSucessPath = `orderItemItems.${action.meta.orderNo}_${action.meta.orderItem}`;
      const packIndex = dotProp
        .get(state, orderItemItemsUnreservePackSucessPath)
        .findIndex(
          (e) => e.packetNo.toLowerCase() === action.meta.packNo.toLowerCase(),
        );
      // Insert meta data into payload for action chaining
      action.payload = Object.assign(action.payload, action.meta);
      const packUreservePackSucessPath = `${orderItemItemsUnreservePackSucessPath}.${packIndex}`;
      playGoodSound();
      return dotProp.delete(state, packUreservePackSucessPath);
    }
    case types.ORDERPICKING_SPLIT_PACK_SUCCESS: {
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
    case types.ORDERPICKING_RESERVE_PACK_ERROR: {
      displayApiErrorToast(action.payload, 'Unable to reserve pack');
      const errorMessage =
        get(action.payload, 'response.Error.message') || 'API error';
      console.error(errorMessage);
      playBadSound();
      const orderItemReservePackErrorPath = `orderItemItems.${action.meta.orderNo}_${action.meta.orderItem}`;

      const packIndex = dotProp
        .get(state, orderItemReservePackErrorPath)
        .findIndex(
          (e) => e.packetNo.toLowerCase() === action.meta.packNo.toLowerCase(),
        );
      if (packIndex < 0) {
        logger.debug(`packIndex is ${packIndex}`);
        return state;
      }
      const statusPath = `orderItemItems.${action.meta.orderNo}_${action.meta.orderItem}.${packIndex}`;
      return dotProp.merge(state, statusPath, {
        status: errorMessage,
      });
    }
    case types.ORDERPICKING_DELETE_WORKSPLITFORMBIN_SUCCESS: {
      return dotProp.set(
        state,
        'splitPackSummary',
        isArray(action.payload) ? action.payload : [action.payload],
      );
    }
    case types.ORDERPICKING_GET_WORKSPLITFORMBIN_SUCCESS: {
      return dotProp.set(
        state,
        'splitPackSummary',
        isArray(action.payload) ? action.payload : [action.payload],
      );
    }
    case types.ORDERPICKING_ADD_WORKSPLITFORMBIN_SUCCESS: {
      return dotProp.set(
        state,
        'splitPackSummary',
        isArray(action.payload) ? action.payload : [action.payload],
      );
    }
    case types.ORDERPICKING_ADD_WORKSPLITFORMBIN_ERROR: {
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
    case types.ORDERPICKING_SPLIT_PACK_ERROR: {
      displayApiErrorToast(action.payload, 'Unable to split pack');
      playBadSound();
      return dotProp.set(state, 'splitPackSummary', []);
    }
    case types.ORDERPICKING_GET_ORDERITEMS_SUCCESS:
      console.log('ORDERPICKING_GET_ORDERITEMS_SUCCESS');
      return dotProp.set(
        state,
        'orderItems',
        isArray(action.payload) ? action.payload : [action.payload],
      );
    case types.ORDERPICKING_GET_ORDERITEMITEMS_SUCCESS: {
      const orderItemItemsPath = `orderItemItems.${action.meta.orderNo}_${action.meta.orderItem}`;
      const updated = dotProp.set(
        state,
        orderItemItemsPath,
        [].concat(action.payload),
      );
      return updated;
    }
    default:
      return state;
  }
}

export const loadOfflineOrders = (orders, offlineOrdersLastUpdate) => ({
  type: types.ORDERPICKING_GET_OFFLINE_ORDERS_SUCCESS,
  orders,
  offlineOrdersLastUpdate,
});

export const clearOrderItems = () => ({
  type: types.ORDERPICKING_CLEAR_ORDERITEMS,
});

export const loadOfflineOrderItems = (
  orderItems,
  offlineOrderItemsLastUpdate,
) => ({
  type: types.ORDERPICKING_GET_OFFLINE_ORDERITEMS_SUCCESS,
  orderItems,
  offlineOrderItemsLastUpdate,
});
