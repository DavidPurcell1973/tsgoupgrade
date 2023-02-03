import dotProp from 'dot-prop-immutable';
import differenceBy from 'lodash/differenceBy';
import * as types from '../../actions/processing/processingActions';
import initialState from '../initialState';
import { playBadSound, playGoodSound } from '../../components/common/playSound';
import { displayToast } from '../../helpers/utils';

export const updatePackNoInput = (packNo) => ({
  type: types.PROCESSING_UPDATE_INPUT,
  packNo,
});

// export const updatePackNoInput = packNo => ({
//   type: types.PROCESSING_UPDATE_PACKNO,
//   packNo,
// });

export const clearAllDetails = () => ({
  type: types.PROCESSING_CLEAR_MERGEPACKDETAILS,
});

export const getMergePackDetails = (apiUrl, apiToken, packNo) => ({
  type: types.PROCESSING_GET_MERGEPACKDETAILS,
  payload: { packNo },
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/Processing/MergePackDetails/${packNo}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${apiToken}` },
      },
      commit: {
        type: 'PROCESSING_GET_MERGEPACKDETAILS_SUCCESS',
        meta: { packNo },
      },
      rollback: {
        type: 'PROCESSING_GET_MERGEPACKDETAILS_ERROR',
        meta: { packNo },
      },
    },
  },
});

export const apiMergePackToBin = (apiUrl, apiToken, packNo, binPacketNo) => ({
  type: types.PROCESSING_MERGEPACKTOBIN,
  payload: { packNo, binPacketNo },
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/Processing/MergePackToBin/${packNo}/BinPacket/${binPacketNo}`,
        method: 'POST',
        headers: { Authorization: `Bearer ${apiToken}` },
      },
      commit: {
        type: 'PROCESSING_MERGEPACKTOBIN_SUCCESS',
        meta: { packNo, binPacketNo },
      },
      rollback: {
        type: 'PROCESSING_MERGEPACKTOBIN_ERROR',
        meta: { packNo, binPacketNo },
      },
    },
  },
});

export default function processingReducer(
  state = initialState.processingStore,
  action,
) {
  switch (action.type) {
    case types.PROCESSING_UPDATE_INPUT: {
      return {
        ...state,
        input: action.packNo,
      };
    }
    case types.PROCESSING_GET_MERGEPACKDETAILS_ERROR:
      return {
        ...state,
        input: '',
        packNo: '',
        productCode: '',
        location: '',
        binSuffix: '',
        transactionDate: '',
        binPacketNo: '',
      };
    case types.PROCESSING_CLEAR_MERGEPACKDETAILS:
      return {
        ...state,
        input: '',
        packNo: '',
        productCode: '',
        location: '',
        binSuffix: '',
        transactionDate: '',
        binPacketNo: '',
      };
    case types.PROCESSING_GET_MERGEPACKDETAILS_SUCCESS:
      return {
        ...state,
        input: '',
        packNo: state.input.toUpperCase(),
        productCode: action.payload.ProductCode,
        location: action.payload.Location,
        binSuffix: action.payload.BinSuffix,
        transactionDate: new Date()
          .toISOString()
          .slice(0, 19)
          .replace('T', ' '),
        binPacketNo: action.payload.BinPacketNo,
      };
    case types.PROCESSING_MERGEPACKTOBIN_SUCCESS:
      playGoodSound();
      displayToast('Successfully merge pack to Bin');
      return {
        ...state,
        input: '',
        packNo: '',
        productCode: '',
        location: '',
        binSuffix: '',
        transactionDate: '',
        binPacketNo: '',
      };
    case types.PROCESSING_MERGEPACKTOBIN_ERROR:
      if (
        action.payload.response !== undefined
        && action.payload.response.IsError
      ) {
        displayToast(action.payload.response.Error);
      } else {
        displayToast('Unable to merge pack to Bin');
      }
      playBadSound();
      return {
        ...state,
        input: '',
        packNo: '',
        productCode: '',
        location: '',
        binSuffix: '',
        transactionDate: '',
        binPacketNo: '',
      };
    default:
      return state;
  }
}

// export function callDeleteStocktake(data) {
//   return dispatch => dispatch(deleteStocktake(data));
// }
