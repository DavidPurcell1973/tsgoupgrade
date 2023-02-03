import 'react-native-get-random-values';
import {findIndex} from 'lodash';
import * as types from '../../actions/itiConsignmentStocktake/itiConsignmentStocktakeActions';
import initialState from '../initialState';
import urlcat from 'urlcat';

export const setPurchaseOrder = (po) => ({
  type: types.ITI_CONSIGNMENT_STOCKTAKE_SET_PO,
  po,
});
export const setPackets = (packets) => ({
  type: types.ITI_CONSIGNMENT_STOCKTAKE_SET_PACKETS,
  packets,
});
export const clearScannedPacks = () => ({
  type: types.ITI_CONSIGNMENT_STOCKTAKE_CLEAR_SCANNED_PACKS,
});
export const deleteScannedPack = (packetNo) => ({
  type: types.ITI_CONSIGNMENT_STOCKTAKE_DELETE_SCANNED_PACK,
  packetNo,
});
export const addStubScannedPack = (pack) => ({
  type: types.ITI_CONSIGNMENT_STOCKTAKE_ADD_SCANNED_PACK,
  pack,
});
export const setOperations = (operations) => ({
  type: types.ITI_CONSIGNMENT_STOCKTAKE_SET_OPERATIONS,
  operations,
});
export const setSelectedOperation = (operation) => ({
  type: types.ITI_CONSIGNMENT_STOCKTAKE_SET_OPERATION,
  operation,
});
export const setSelectedSite = (site) => ({
  type: types.ITI_CONSIGNMENT_STOCKTAKE_SET_SITE,
  site,
});

export const apiGetAvailableSites = (apiUrl, apiToken, username = '') => ({
  type: types.ITI_CONSIGNMENT_STOCKTAKE_GET_SITES,
  payload: {username},
  meta: {
    offline: {
      effect: {
        url: urlcat(`${apiUrl}/api/iti/consignment-stocktake/sites`, {
          username,
        }),
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'ITI_CONSIGNMENT_STOCKTAKE_GET_SITES_SUCCESS',
        meta: {username},
      },
      rollback: {
        type: 'ITI_CONSIGNMENT_STOCKTAKE_GET_SITES_ERROR',
        meta: {username},
      },
    },
  },
});

export default function itiConsignmentStocktakeReducer(
  state = initialState.itiConsignmentStocktakeStore,
  action,
) {
  switch (action.type) {
    case types.ITI_CONSIGNMENT_STOCKTAKE_SET_PO: {
      console.log('ITI_CONSIGNMENT_STOCKTAKE_SET_PO');
      return {
        ...state,
        purchaseOrder: action.po,
      };
    }
    case types.ITI_CONSIGNMENT_STOCKTAKE_SET_PACKETS: {
      console.log('ITI_CONSIGNMENT_STOCKTAKE_SET_PACKETS');
      return {
        ...state,
        serverPackets: action.packets,
      };
    }
    case types.ITI_CONSIGNMENT_STOCKTAKE_CLEAR_SCANNED_PACKS: {
      console.log('ITI_CONSIGNMENT_STOCKTAKE_CLEAR_SCANNED_PACKS');
      return {
        ...state,
        scannedPackets: [],
      };
    }
    case types.ITI_CONSIGNMENT_STOCKTAKE_DELETE_SCANNED_PACK: {
      console.log('ITI_CONSIGNMENT_STOCKTAKE_DELETE_SCANNED_PACK');

      return {
        ...state,
        scannedPackets: state.scannedPackets.filter(
          (e) => e.packetNo !== action.packetNo,
        ),
      };
    }
    case types.ITI_CONSIGNMENT_STOCKTAKE_ADD_SCANNED_PACK: {
      console.log('ITI_CONSIGNMENT_STOCKTAKE_ADD_SCANNED_PACK');
      if (
        findIndex(
          state.scannedPackets,
          (e) => e.packetNo === action.pack.packetNo,
        ) >= 0
      ) {
        return {
          ...state,
          scannedPackets: [
            action.pack,
            ...state.scannedPackets.filter(
              (e) => e.packetNo !== action.pack.packetNo,
            ),
          ],
        };
      }
      return {
        ...state,
        scannedPackets: [action.pack, ...state.scannedPackets],
      };
    }
    case types.ITI_CONSIGNMENT_STOCKTAKE_SET_OPERATIONS: {
      console.log('ITI_CONSIGNMENT_STOCKTAKE_SET_OPERATIONS');
      return {
        ...state,
        operations: action.operations,
      };
    }

    case types.ITI_CONSIGNMENT_STOCKTAKE_SET_OPERATION: {
      console.log('ITI_CONSIGNMENT_STOCKTAKE_SET_OPERATION');
      return {
        ...state,
        selectedOperation: action.operation,
      };
    }
    case types.ITI_CONSIGNMENT_STOCKTAKE_SET_SITE: {
      console.log('ITI_CONSIGNMENT_STOCKTAKE_SET_SITE');
      return {
        ...state,
        selectedSite: action.site,
      };
    }
    case types.ITI_CONSIGNMENT_STOCKTAKE_GET_SITES_SUCCESS: {
      console.log('STOCKTAKE_GET_SITES_SUCCESS');
      return {
        ...state,
        sites: action.payload,
      };
    }
    case types.ITI_CONSIGNMENT_STOCKTAKE_GET_SITES_ERROR: {
      console.log('STOCKTAKE_GET_SITES_ERROR');
      return {
        ...state,
      };
    }
    default:
      return state;
  }
}
