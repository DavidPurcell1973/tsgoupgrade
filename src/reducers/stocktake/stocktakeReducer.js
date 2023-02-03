import 'react-native-get-random-values';
import {v4 as uuid} from 'uuid';
import {isNil, isObject, differenceBy, isArray, isEmpty} from 'lodash';
import * as types from '../../actions/stocktake/stocktakeActions';
import initialState from '../initialState';
import {displayApiErrorToast, displayToast} from '../../helpers/utils';
import {playBadSound, playGoodSound} from '../../components/common/playSound';
import logger from '../../helpers/logger';

export const apiDeleteRow = (apiUrl, apiToken, row) => ({
  type: types.STOCKTAKE_DELETE_ROW,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/Stocktake/Rows`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
        json: {
          deviceName: row.deviceName,
          stocktakeId: row.stocktakeId,
          rowName: row.rowName,
          locationId: row.locationId,
          preCount: row.preCount,
        },
      },
      commit: {type: 'STOCKTAKE_DELETE_ROW_SUCCESS', meta: {...row}},
      rollback: {type: 'STOCKTAKE_DELETE_ROW_ERROR', meta: {...row}},
    },
  },
});

export const apiCreateRows = (apiUrl, apiToken, rows) => ({
  type: types.STOCKTAKE_CREATE_ROWS,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/Stocktake/BulkRows`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
        json: rows,
      },
      commit: {type: 'STOCKTAKE_CREATE_ROWS_SUCCESS', meta: {rows}},
      rollback: {type: 'STOCKTAKE_CREATE_ROWS_ERROR', meta: {rows}},
    },
  },
});

export const apiCreateRow = (apiUrl, apiToken, row) => ({
  type: types.STOCKTAKE_CREATE_ROW,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/Stocktake/Rows`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
        json: {
          rowName: row.rowName,
          deviceName: row.deviceName,
          stocktakeId: row.stocktakeId,
          locationId: row.locationId,
          preCount: row.preCount,
        },
      },
      commit: {type: 'STOCKTAKE_CREATE_ROW_SUCCESS', meta: {...row}},
      rollback: {type: 'STOCKTAKE_CREATE_ROW_ERROR', meta: {...row}},
    },
  },
});

export const apiUpdatePacks = (apiUrl, apiToken, packs) => ({
  type: types.STOCKTAKE_UPDATE_PACKS,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/Stocktake/BulkPacks`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
        json: packs,
      },
      commit: {type: 'STOCKTAKE_UPDATE_PACKS_SUCCESS', meta: {packs}},
      rollback: {type: 'STOCKTAKE_UPDATE_PACKS_ERROR', meta: {packs}},
    },
  },
});

export const apiUpdatePack = (apiUrl, apiToken, pack) => ({
  type: types.STOCKTAKE_UPDATE_PACK,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/Stocktake/Packs`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
        json: {
          deviceName: pack.scannedBy,
          stocktakeId: pack.stocktakeId,
          rowName: pack.rowName,
          locationId: pack.locationId,
          packNo: pack.packNo,
          scannedOn: pack.scannedOn,
          scannedPackGuid: pack.uuid,
        },
      },
      commit: {type: 'STOCKTAKE_UPDATE_PACK_SUCCESS', meta: {...pack}},
      rollback: {type: 'STOCKTAKE_UPDATE_PACK_ERROR', meta: {...pack}},
    },
  },
});

export const clearPacksByStocktakeId = (stocktakeId) => ({
  type: types.STOCKTAKE_CLEAR_PACKS_BY_STOCKTAKE,
  stocktakeId,
});

export const clearRowByStocktakeId = (stocktakeId) => ({
  type: types.STOCKTAKE_CLEAR_ROW_BY_STOCKTAKE,
  stocktakeId,
});

export const addRowToStocktake = (data) => ({
  type: types.STOCKTAKE_ADD_ROW_TO_STOCKTAKE,
  data,
});

export const updateNewRowInput = (data) => ({
  type: types.STOCKTAKE_UPDATE_NEWROWINPUT,
  data,
});

export const updatePreCountInput = (data) => ({
  type: types.STOCKTAKE_UPDATE_PRECOUNTINPUT,
  data,
});

export const deleteRowFromStocktake = (data) => ({
  type: types.STOCKTAKE_DELETE_ROW_FROM_STOCKTAKE,
  data,
});

export const deletePackFromRow = (data) => ({
  type: types.STOCKTAKE_DELETE_PACK_FROM_ROW,
  data,
});

export const addPacksToRow = (data) => ({
  type: types.STOCKTAKE_ADD_PACKS_TO_ROW,
  data,
});

export const addPackToRowThunk = (dispatch, getState) =>
  dispatch(addPackToRow(data));

export const addPackToRow = (data) => ({
  type: types.STOCKTAKE_ADD_PACK_TO_ROW,
  data,
});

export const initiateStocktakePacksExport = (stocktakeId) => ({
  type: types.STOCKTAKE_EXPORT_PACKS,
  stocktakeId,
});

export const markStocktakeExportClear = () => ({
  type: types.STOCKTAKE_EXPORT_CLEAR,
});

export const markStocktakeExportDone = (stocktakeId) => ({
  type: types.STOCKTAKE_EXPORT_DONE,
  stocktakeId,
});

export const initiateStocktakeRowExport = (stocktakeId) => ({
  type: types.STOCKTAKE_EXPORT_ROWS,
  stocktakeId,
});

export const updateNewLocationInput = (location) => ({
  type: types.STOCKTAKE_UPDATE_NEWLOCATIONINPUT,
  selectedLocation: location,
});

export const updateUserInput = (data) => ({
  type: types.STOCKTAKE_UPDATE_INPUT,
  data,
});

export const updateBranch = (branchId) => ({
  type: types.STOCKTAKE_SET_BRANCH,
  branchId,
});

export const updateLocation = (locationId) => ({
  type: types.STOCKTAKE_SET_LOCATION,
  locationId,
});

export const loadStocktakes = (apiUrl, apiToken) => ({
  type: types.STOCKTAKE_GET_STOCKTAKES,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/stocktake/Stocktakes`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {type: 'STOCKTAKE_GET_STOCKTAKES_SUCCESS', meta: {}},
      rollback: {type: 'STOCKTAKE_GET_STOCKTAKES_ERROR', meta: {}},
    },
  },
});

export const loadLocations = (apiUrl, apiToken) => ({
  type: types.STOCKTAKE_GET_LOCATIONS,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/stocktake/Locations`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {type: 'STOCKTAKE_GET_LOCATIONS_SUCCESS', meta: {}},
      rollback: {type: 'STOCKTAKE_GET_LOCATIONS_ERROR', meta: {}},
    },
  },
});

export const loadOptions = (apiUrl, apiToken) => ({
  type: types.STOCKTAKE_GET_OPTIONS,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/stocktake/Options`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {type: 'STOCKTAKE_GET_OPTIONS_SUCCESS', meta: {}},
      rollback: {type: 'STOCKTAKE_GET_OPTIONS_ERROR', meta: {}},
    },
  },
});

export const loadRows = (apiUrl, apiToken, stocktakeId) => ({
  type: types.STOCKTAKE_GET_ROWS,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/stocktake/Rows?StocktakeID=${stocktakeId}`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {type: 'STOCKTAKE_GET_ROWS_SUCCESS', meta: {stocktakeId}},
      rollback: {type: 'STOCKTAKE_GET_ROWS_ERROR', meta: {stocktakeId}},
    },
  },
});

export const loadLocationsByStocktake = (apiUrl, apiToken, stocktakeId) => ({
  type: types.STOCKTAKE_GET_LOCATIONS_BY_STOCKTAKEID,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/stocktake/stocktakes/${stocktakeId}/locations`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'STOCKTAKE_GET_LOCATIONS_BY_STOCKTAKEID_SUCCESS',
        meta: {stocktakeId},
      },
      rollback: {
        type: 'STOCKTAKE_GET_LOCATIONS_BY_STOCKTAKEID_ERROR',
        meta: {stocktakeId},
      },
    },
  },
});

export const loadPacks = (apiUrl, apiToken, stocktakeId) => ({
  type: types.STOCKTAKE_GET_PACKS,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/stocktake/Packs?StocktakeID=${stocktakeId}`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'STOCKTAKE_GET_PACKS_SUCCESS',
        meta: {stocktakeId},
      },
      rollback: {
        type: 'STOCKTAKE_GET_PACKS_ERROR',
        meta: {stocktakeId},
      },
    },
  },
});

export const loadExistingBins = (apiUrl, apiToken, stocktakeId) => ({
  type: types.STOCKTAKE_GET_EXISTING_BINS,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/stocktake/ExistingBins?StocktakeID=${stocktakeId}`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'STOCKTAKE_GET_EXISTING_BINS_SUCCESS',
        meta: {stocktakeId},
      },
      rollback: {
        type: 'STOCKTAKE_GET_EXISTING_BINS_ERROR',
        meta: {stocktakeId},
      },
    },
  },
});

export const loadProducts = (apiUrl, apiToken, stocktakeId) => ({
  type: types.STOCKTAKE_GET_PRODUCT_GCS,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/stocktake/Products?StocktakeID=${stocktakeId}`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'STOCKTAKE_GET_PRODUCT_GCS_SUCCESS',
        meta: {stocktakeId},
      },
      rollback: {
        type: 'STOCKTAKE_GET_PRODUCT_GCS_ERROR',
        meta: {stocktakeId},
      },
    },
  },
});

export const loadPacketTally = (apiUrl, apiToken, stocktakeId) => ({
  type: types.STOCKTAKE_GET_PACKET_TALLY,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/stocktake/PacketTallies?StocktakeID=${stocktakeId}`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {
        type: 'STOCKTAKE_GET_PACKET_TALLY_SUCCESS',
        meta: {stocktakeId},
      },
      rollback: {
        type: 'STOCKTAKE_GET_PACKET_TALLY_ERROR',
        meta: {stocktakeId},
      },
    },
  },
});

export default function stocktakeReducer(
  state = initialState.stocktakeStore,
  action,
) {
  switch (action.type) {
    case types.STOCKTAKE_SET_BRANCH:
      return {
        ...state,
        selectedBranchId: action.branchId,
        selectedLocationId: null,
      };
    case types.STOCKTAKE_SET_LOCATION:
      return {
        ...state,
        selectedLocationId: action.locationId,
      };
    case types.STOCKTAKE_GET_ROWS_ERROR: {
      console.log('STOCKTAKE_GET_ROWS_ERROR');
      displayApiErrorToast(action.payload, 'Unable to download Stocktake Rows');
      playBadSound();
      return state;
    }
    case types.STOCKTAKE_UPDATE_PACKS_SUCCESS: {
      console.log('STOCKTAKE_UPDATE_PACKS_SUCCESS');
      // displayToast(`Pack ${action.meta.packNo} uploaded successfully`);
      const firstPack = action.meta?.packs[0];
      return {
        ...state,
        rowPacks: state.rowPacks.filter(
          (pack) => pack.stocktakeId !== firstPack.stocktakeId,
        ),
      };
    }
    case types.STOCKTAKE_UPDATE_PACKS_ERROR: {
      console.log('STOCKTAKE_UPDATE_PACKS_ERROR');
      displayApiErrorToast(action.payload, 'Unable to update Packs on server.');
      return {
        ...state,
        exportStocktakeId: 0,
        exportingRows: false,
        exporting: false,
      };
    }
    case types.STOCKTAKE_UPDATE_PACK_SUCCESS: {
      console.log('STOCKTAKE_UPDATE_PACK_SUCCESS');
      // displayToast(`Pack ${action.meta.packNo} uploaded successfully`);
      return {
        ...state,
        rowPacks: state.rowPacks.filter(
          (pack) => pack.uuid !== action.meta.uuid,
        ),
      };
    }
    case types.STOCKTAKE_UPDATE_PACK_ERROR: {
      console.log('STOCKTAKE_UPDATE_PACK_ERROR');
      displayApiErrorToast(action.payload, 'Unable to update Pack on server.');
      return {
        ...state,
        exportStocktakeId: 0,
        exportingRows: false,
        exporting: false,
      };
    }
    case types.STOCKTAKE_EXPORT_CLEAR: {
      console.log('STOCKTAKE_EXPORT_CLEAR');
      return {
        ...state,
        exportStocktakeId: 0,
        exportingRows: false,
        exporting: false,
      };
    }
    case types.STOCKTAKE_EXPORT_DONE: {
      console.log('STOCKTAKE_EXPORT_DONE');
      displayToast('Export successful', 10000);
      return {
        ...state,
        exportStocktakeId: 0,
        exportingRows: false,
        exporting: false,
      };
    }
    case types.STOCKTAKE_EXPORT_PACKS: {
      console.log('STOCKTAKE_EXPORT_PACKS');
      return {
        ...state,
        exportStocktakeId: action.stocktakeId,
        exportingRows: false,
        exporting: true,
      };
    }
    case types.STOCKTAKE_GET_OPTIONS_SUCCESS: {
      console.log('STOCKTAKE_GET_OPTIONS_SUCCESS');

      let options = {};
      if (isArray(action.payload)) {
        if (action.payload.length > 0) {
          options = action.payload[0];
        }
      } else {
        if (isObject(action.payload)) {
          options = action.payload;
        }
      }

      return {
        ...state,
        options,
      };
    }
    case types.STOCKTAKE_GET_OPTIONS_ERROR: {
      console.log('STOCKTAKE_GET_OPTIONS_ERROR');
      return state;
    }
    case types.STOCKTAKE_EXPORT_ROWS: {
      console.log('STOCKTAKE_EXPORT_ROWS');
      return {
        ...state,
        exportStocktakeId: action.stocktakeId,
        exportingRows: true,
        exporting: true,
      };
    }
    case types.STOCKTAKE_GET_PACKS_ERROR: {
      console.log('STOCKTAKE_GET_PACKS_ERROR');
      displayApiErrorToast(
        action.payload,
        'Unable to download Stocktake Packs',
      );
      playBadSound();
      return state;
    }
    case types.STOCKTAKE_GET_PACKS_SUCCESS: {
      console.log('STOCKTAKE_GET_PACKS_SUCCESS');
      const otherPacks = state.packs.filter(
        (pack) => pack.stocktakeId !== action.meta.stocktakeId,
      );
      // const pendingPacks = existingPacks.filter((pack) => pack.new || pack.delete);
      const downloadedPacks = [].concat(action.payload).map((e) => ({
        ...e,
        stocktakeId: action.meta.stocktakeId,
      }));
      return {...state, packs: [...otherPacks, ...downloadedPacks]};
    }
    case types.STOCKTAKE_GET_ROWS_SUCCESS: {
      console.log('STOCKTAKE_GET_ROWS_SUCCESS');
      const otherRows = state.rows.filter(
        (row) => row.stocktakeId !== action.meta.stocktakeId,
      );
      const existingRows = state.rows.filter(
        (row) => row.stocktakeId === action.meta.stocktakeId,
      );
      const pendingRows = existingRows.filter((row) => row.new || row.delete);
      // const diffRows = differenceBy(existingRows, action.payload, 'rowName');
      // If no rows for current Stocktake, just insert them
      const downloadedRows = [].concat(action.payload).map((e) => ({
        rowName: e.rowName,
        locationId: e.locationId,
        preCount: e.preCount,
        stocktakeId: action.meta.stocktakeId,
        id: uuid(),
        type: e.type || 'pack',
      }));
      const filteredDownloadedRows = differenceBy(
        downloadedRows,
        pendingRows,
        'rowName',
      );
      // const filteredDownloadedRows = downloadedRows
      //   .filter((d) => (findIndex(pendingRows,
      //     (p) => p.locationId === d.locationId
      //       && p.stocktakeId === d.stocktakeId) >= 0 ? null : d));
      displayToast('Downloaded and merged existing rows');
      return {
        ...state,
        rows: [...otherRows, ...pendingRows, ...filteredDownloadedRows],
      };
    }
    case types.STOCKTAKE_DELETE_ROW_FROM_STOCKTAKE: {
      console.log('STOCKTAKE_DELETE_ROW_FROM_STOCKTAKE');
      const otherRows = state.rows.filter(
        (row) => row.stocktakeId !== action.data.stocktakeId,
      );
      const existingRows = state.rows.filter(
        (row) => row.stocktakeId === action.data.stocktakeId,
      );
      const existingNewRow = state.rows.filter(
        (row) =>
          row.stocktakeId === action.data.stocktakeId &&
          row.locationId === action.data.locationId &&
          row.rowName === action.data.rowName &&
          row.new,
      );
      const filteredExistingWithoutNewRow = existingRows.filter(
        (row) => !(row.rowName === action.data.rowName && row.new),
      );
      // If new role has been added, just delete it
      if (existingNewRow.length > 0) {
        return {
          ...state,
          rows: [...otherRows, ...filteredExistingWithoutNewRow],
        };
      }
      displayToast('You can only delete a NEW Row');
      return state;
    }
    case types.STOCKTAKE_ADD_ROW_TO_STOCKTAKE: {
      return {...state, rows: [action.data, ...state.rows]};
    }
    case types.STOCKTAKE_CLEAR_PACKS_BY_STOCKTAKE: {
      return {
        ...state,
        rowPacks: state.rowPacks.filter(
          (e) => e.stocktakeId !== action.stocktakeId,
        ),
      };
    }
    case types.STOCKTAKE_CLEAR_ROW_BY_STOCKTAKE: {
      return {
        ...state,
        rows: state.rows.filter((e) => e.stocktakeId !== action.stocktakeId),
      };
    }
    case types.STOCKTAKE_UPDATE_NEWROWINPUT: {
      return {
        ...state,
        newRowInput: action.data,
      };
    }
    case types.STOCKTAKE_UPDATE_PRECOUNTINPUT: {
      return {
        ...state,
        preCountInput: action.data,
      };
    }
    case types.STOCKTAKE_DELETE_PACK_FROM_ROW: {
      return {
        ...state,
        rowPacks: state.rowPacks.filter((p) => p.uuid !== action.data.uuid),
      };
    }
    case types.STOCKTAKE_ADD_PACKS_TO_ROW: {
      console.log('STOCKTAKE_ADD_PACKS_TO_ROW');
      return {...state, rowPacks: [...action.data, ...state.rowPacks]};
    }
    case types.STOCKTAKE_ADD_PACK_TO_ROW: {
      console.log('STOCKTAKE_ADD_PACK_TO_ROW');
      // const isDuplicatePack = [];

      // const currentStocktake = state.stocktakes.filter(
      //   (e) => e.stocktakeId === action.data.stocktakeId,
      // );

      const isDuplicatePack =
        action.data.type === 'pack' &&
        !isEmpty(
          state.rowPacks.find(
            (e) =>
              e.packNo.toLowerCase() === action.data.packNo.toLowerCase() &&
              e.rowName.toLowerCase() === action.data.rowName.toLowerCase() &&
              e.stocktakeId === action.data.stocktakeId,
          )
            ? true
            : false,
        );
      // const isDuplicatePack = state.rowPacks.filter(
      //   (e) =>
      //     e.packNo.toLowerCase() === action.data.packNo.toLowerCase() &&
      //     e.rowName.toLowerCase() === action.data.rowName.toLowerCase() &&
      //     e.stocktakeId === action.data.stocktakeId,
      // );

      if (isDuplicatePack) {
        displayToast(`Duplicate barcode? ${action.data.packNo}`, 10000);
        console.log(`Duplication detected in REDUCER! ${action.data.packNo}`);
        playBadSound();
        return state;
      }

      return {
        ...state,
        rowPacks: [
          action.data,
          ...state.rowPacks.filter(
            (e) =>
              !(
                e.packNo.toLowerCase() === action.data.packNo.toLowerCase() &&
                e.rowName.toLowerCase() === action.data.rowName.toLowerCase() &&
                e.stocktakeId === action.data.stocktakeId
              ),
          ),
        ],
      };
    }
    case types.STOCKTAKE_GET_EXISTING_BINS_SUCCESS: {
      console.log('STOCKTAKE_GET_EXISTING_BINS_SUCCESS');
      // return {
      //   ...state,
      //   existingBins: [],
      // };
      if (isArray(action.payload)) {
        return {
          ...state,
          existingBins: action.payload,
        };
      }
      return {
        ...state,
        existingBins: [action.payload],
      };
    }
    case types.STOCKTAKE_GET_EXISTING_BINS_ERROR: {
      console.log('STOCKTAKE_GET_EXISTING_BINS_ERROR');
      return state;
    }

    case types.STOCKTAKE_GET_PACKET_TALLY_SUCCESS: {
      console.log('STOCKTAKE_GET_PACKET_TALLY_SUCCESS');
      if (isArray(action.payload)) {
        return {
          ...state,
          packetTallies: action.payload,
        };
      }
      return {
        ...state,
        packetTallies: [action.payload],
      };
    }
    case types.STOCKTAKE_GET_PACKET_TALLY_ERROR: {
      console.log('STOCKTAKE_GET_PACKET_TALLY_ERROR');
      return state;
    }
    case types.STOCKTAKE_GET_PRODUCT_GCS_SUCCESS: {
      console.log('STOCKTAKE_GET_PRODUCT_GCS_SUCCESS');
      if (isArray(action.payload)) {
        return {
          ...state,
          products: action.payload,
        };
      }
      return {
        ...state,
        products: [action.payload],
      };
    }
    case types.STOCKTAKE_GET_PRODUCT_GCS_ERROR: {
      console.log('STOCKTAKE_GET_PRODUCT_GCS_ERROR');
      return state;
    }

    case types.STOCKTAKE_CREATE_ROW_SUCCESS: {
      console.log('STOCKTAKE_CREATE_ROW_SUCCESS');
      // displayToast(`Row ${action.meta.rowName} has been created successfully.`);
      return {
        ...state,
        rows: state.rows.filter(
          (row) =>
            row.stocktakeId !== action.meta.stocktakeId &&
            row.locationId !== action.meta.locationId &&
            row.rowName !== action.meta.rowName,
        ),
      };
    }
    case types.STOCKTAKE_CREATE_ROW_ERROR: {
      console.log('STOCKTAKE_CREATE_ROW_ERROR');
      displayApiErrorToast(action.payload, 'Unable to create Row on server.');
      playBadSound();
      return {
        ...state,
        exportStocktakeId: 0,
        exportingRows: false,
        exporting: false,
      };
    }
    case types.STOCKTAKE_CREATE_ROWS_SUCCESS: {
      console.log('STOCKTAKE_CREATE_ROWS_SUCCESS');
      const firstRow = action.meta?.rows[0];
      // displayToast(`Row ${action.meta.rowName} has been created successfully.`);
      return {
        ...state,
        rows: state.rows.filter(
          (row) =>
            row.stocktakeId !== firstRow.stocktakeId &&
            row.locationId !== firstRow.locationId &&
            row.rowName !== firstRow.rowName,
        ),
      };
    }
    case types.STOCKTAKE_CREATE_ROWS_ERROR: {
      console.log('STOCKTAKE_CREATE_ROWS_ERROR');
      displayApiErrorToast(action.payload, 'Unable to create Row on server.');
      playBadSound();
      return {
        ...state,
        exportStocktakeId: 0,
        exportingRows: false,
        exporting: false,
      };
    }
    case types.STOCKTAKE_GET_STOCKTAKES_SUCCESS: {
      displayToast('Stocktake list refreshed');
      const stocktakes = [].concat(action.payload);
      return {
        ...state,
        stocktakes,
      };
    }
    case types.STOCKTAKE_GET_LOCATIONS_BY_STOCKTAKEID_SUCCESS: {
      console.log('STOCKTAKE_GET_LOCATIONS_BY_STOCKTAKEID_SUCCESS');
      const {stocktakeId} = action.meta;
      return {
        ...state,
        locations: [
          ...state.locations.filter((l) => l.stocktakeId !== stocktakeId),
          ...action.payload.map((p) => ({...p, stocktakeId: stocktakeId})),
        ],
      };
    }
    case types.STOCKTAKE_GET_LOCATIONS_SUCCESS: {
      console.log('STOCKTAKE_GET_LOCATIONS_SUCCESS');
      return {
        ...state,
        locations: [...action.payload],
      };
    }
    default:
      return state;
  }
}

// export function callExportStocktake(apiUrl, apiToken, stocktake) {
//   const state = store.getState();
//
//   // Work on new rows
//   const rowsPath = `rows.${stocktake.stocktakeId}`;
//   const stocktakeRows = dotProp.get(state.stocktakeStore, rowsPath);
//
//   stocktakeRows
//     .filter((row) => row.isNew === true)
//     .forEach((row) => {
//       row.StocktakeID = stocktake.stocktakeId;
//       store.dispatch(apiCreateRow(apiUrl, apiToken, row));
//     });
//
//   // Work on new packs
//   const rowPacksPath = `rowPacks.${stocktake.stocktakeId}`;
//   const rowPacks = dotProp.get(state.stocktakeStore, rowPacksPath);
//   Object.entries(rowPacks).forEach((rowArray) => {
//     const key = rowArray[0];
//     const rows = rowArray[1];
//     const { locationId } = stocktakeRows.filter((row) => key === row.rowName)[0];
//     rows.forEach((pack) => {
//       pack.locationId = locationId;
//       store.dispatch(apiUpdatePack(apiUrl, apiToken, pack));
//     });
//   });
// }

// export function callDeleteStocktake(data) {
//   return dispatch => dispatch(deleteStocktake(data));
// }

export function callDeleteRow(apiUrl, apiToken, row) {
  return (dispatch) => dispatch(apiDeleteRow(apiUrl, apiToken, row));
}

export function callAddRow(apiUrl, apiToken, row) {
  return (dispatch) => dispatch(apiCreateRow(apiUrl, apiToken, row));
}

export function syncRows(apiUrl, apiToken, deltaRows) {
  // Upload Rows

  // Download Rows (if successful)
  return (dispatch) => {
    const createReducer = (acc, cur) =>
      cur.isNew || cur.new
        ? acc.concat(
            new Promise((resolve, reject) =>
              resolve(dispatch(callAddRow(apiUrl, apiToken, cur))),
            ),
          )
        : acc;
    const deleteReducer = (acc, cur) =>
      cur.delete
        ? acc.concat(
            new Promise((resolve, reject) =>
              resolve(dispatch(callDeleteRow(apiUrl, apiToken, cur))),
            ),
          )
        : acc;
    const createPromises = deltaRows.reduce(createReducer, []);
    const allPromises = deltaRows.reduce(deleteReducer, createPromises);
    console.log(allPromises.length);
    return Promise.all([allPromises]).then(() => console.log('DONE'));
  };
  // deltaRows.filter((e) => e.delete).forEach((row) => dispatch(callDeleteRow(row)));
}
