import dotProp from 'dot-prop-immutable';
import * as types from '../../actions/moistureCollector/moistureCollectorActions';
import Config from 'react-native-config';
import initialState from '../initialState';
import logger from '../../helpers/logger';
import {displayApiErrorToast, displayToast, getApiErrorMessage} from '../../helpers/utils';
import {get, isArray, isString} from 'lodash';
import {playBadSound, playGoodSound} from '../../components/common/playSound';

export const loadProcessesSuccess = (processes, offlineProcessesLastUpdate) => ({
    type: types.MOISTURECOLLECTOR_LOAD_OFFLINE_PROCESSES_SUCCESS,
    processes,
    offlineProcessesLastUpdate,
  });

export const apiGetProcesses = (apiUrl, apiToken) => ({
    type: types.MOISTURECOLLECTOR_GET_PROCESSES,
    payload: {},
    meta: {
      offline: {
        effect: {
          url: `${apiUrl || Config.API_URL}/api/MoistureCollector/Processes`,
          headers: {Authorization: `Bearer ${apiToken}`},
        },
        commit: {type: 'MOISTURECOLLECTOR_GET_PROCESSES_SUCCESS', meta: {}},
        rollback: {type: 'MOISTURECOLLECTOR_GET_PROCESSES_ERROR', meta: {}},
      },
    },
  });

  export const apiGetKilns = (apiUrl, apiToken) => ({
    type: types.MOISTURECOLLECTOR_GET_KILNS,
    payload: {},
    meta: {
      offline: {
        effect: {
          url: `${apiUrl || Config.API_URL}/api/MoistureCollector/Kilns`,
          headers: {Authorization: `Bearer ${apiToken}`},
        },
        commit: {type: 'MOISTURECOLLECTOR_GET_KILNS_SUCCESS', meta: {}},
        rollback: {type: 'MOISTURECOLLECTOR_GET_KILNS_ERROR', meta: {}},
      },
    },
  });

  export const apiGetPositions = (apiUrl, apiToken) => ({
    type: types.MOISTURECOLLECTOR_GET_POSITIONS,
    payload: {},
    meta: {
      offline: {
        effect: {
          url: `${apiUrl || Config.API_URL}/api/MoistureCollector/Positions`,
          headers: {Authorization: `Bearer ${apiToken}`},
        },
        commit: {type: 'MOISTURECOLLECTOR_GET_POSITIONS_SUCCESS', meta: {}},
        rollback: {type: 'MOISTURECOLLECTOR_GET_POSITIONS_ERROR', meta: {}},
      },
    },
  });

  export const addMoistureToArray = (data) => ({
    type: types.MOISTURECOLLECTOR_ADD_MOISTURE_TO_ARRAY,
    data,
  });


  export const deleteMoistureFromArray = (localID) => ({
    type: types.MOISTURECOLLECTOR_DELETE_MOISTURE_FROM_ARRAY,
    localID,
  });

  export const updateMoistureArrayElement = (localID,data) => ({
    type: types.MOISTURECOLLECTOR_UPDATE_MOISTURE_ARRAY_ELEMENT,
    localID,data
  });

  export const updateDeviceName = (deviceName) => ({
    type: types.MOISTURECOLLECTOR_SET_DEVICE_NAME,
    deviceName,
  });

  export const updateDeviceOwner = (deviceOwner) => ({
    type: types.MOISTURECOLLECTOR_SET_DEVICE_OWNER,
    deviceOwner,
  });

  export const updateBranchID = (branchID) => ({
    type: types.MOISTURECOLLECTOR_SET_BRANCH_ID,
    branchID,
  });

  export const updateBranchName = (branchName) => ({
    type: types.MOISTURECOLLECTOR_SET_BRANCH_NAME,
    branchName,
  });

  export const updateLocationID = (locationID) => ({
    type: types.MOISTURECOLLECTOR_SET_LOCATION_ID,
    locationID,
  });

  export const updateLocationName = (locationName) => ({
    type: types.MOISTURECOLLECTOR_SET_LOCATION_NAME,
    locationName,
  });

  export const updateMeanHighLimit = (meanHighLimit) => ({
    type: types.MOISTURECOLLECTOR_SET_MEAN_HIGH_LIMIT,
    meanHighLimit,
  });

  export const updateMeanLowLimit = (meanLowLimit) => ({
    type: types.MOISTURECOLLECTOR_SET_MEAN_LOW_LIMIT,
    meanLowLimit,
  });

  export const updateStdDevHighLimit = (stdDevHighLimit) => ({
    type: types.MOISTURECOLLECTOR_SET_STD_DEV_HIGH_LIMIT,
    stdDevHighLimit,
  });

  export const updateStdDevLowLimit = (stdDevLowLimit) => ({
    type: types.MOISTURECOLLECTOR_SET_STD_DEV_LOW_LIMIT,
    stdDevLowLimit,
  });

  export const replaceMoistureArray = (replacementMoistureArray) => ({
    type: types.MOISTURECOLLECTOR_REPLACE_MOISTURE_ARRAY,
    replacementMoistureArray,
  });

  export const apiSendItem = (moisture, apiUrl, apiToken) => ({
    type: types.MOISTURECOLLECTOR_SEND_ITEM_REQUEST,
    payload: {
      apiUrl,
      apiToken,
      moisture,
    },
    meta: {
      offline: {
        effect: {
          url: `${apiUrl || Config.API_URL}/api/MoistureCollector/Moistures`,
          method: 'POST',
          headers: {Authorization: `Bearer ${apiToken}`},
          json: {
            packetNo: moisture.packetNo,
            moistureId: moisture.moistureId,
            moistureReading: moisture.moisture,
            stdDev: moisture.stdDev,
            measuredBy: moisture.measuredBy,
            position:  moisture.positionId,
            kilnNo: moisture.kilnId,
            processID: moisture.processId,
          },
        },
        commit: {
          type: 'MOISTURECOLLECTOR_SEND_ITEM_SUCCESS',
          moisture,
          meta: {
            apiUrl,
            apiToken,
            ...moisture,
          },
        },
        rollback: {
          type: 'MOISTURECOLLECTOR_SEND_ITEM_ERROR',
          moisture,
          meta: {...moisture, apiUrl, apiToken},
        },
      },
    },
  });

  export default function moistureCollectorReducer(
    state = initialState.moistureCollectorStore,
    action,
  ) {
    switch (action.type) {
      case types.MOISTURECOLLECTOR_GET_PROCESSES_SUCCESS: {
        logger.debug(`[STEP CHECK MOISTURECOLLECTOR_GET_PROCESSES_SUCCESS]: Payload is found`);
        const now = new Date();
        const processes = Array.isArray(action.payload)
          ? action.payload
          : [action.payload];
        return {
          ...state,
          offlineProcessesLastUpdate: now,
          onlineProcessesLastUpdate: now,
          processes,
        };
      }
      case types.MOISTURECOLLECTOR_GET_PROCESSES_ERROR: {
        logger.debug(`[STEP CHECK MOISTURECOLLECTOR_GET_PROCESSES_ERROR]: Payload NOT found`);
        displayApiErrorToast(action.payload, 'Unable to load Processes');
        const loadProcessErrorPath = 'loadProcessError';
        return dotProp.set(state, loadProcessErrorPath, true);
      }
      case types.MOISTURECOLLECTOR_GET_KILNS_SUCCESS: {
        logger.debug(`[STEP CHECK MOISTURECOLLECTOR_GET_KILNS_SUCCESS]: Payload is found`);
        const now = new Date();
        const kilns = Array.isArray(action.payload)
          ? action.payload
          : [action.payload];
        return {
          ...state,
          offlineProcessesLastUpdate: now,
          onlineProcessesLastUpdate: now,
          kilns,
        };
      }
      case types.MOISTURECOLLECTOR_GET_KILNS_ERROR: {
        logger.debug(`[STEP CHECK MOISTURECOLLECTOR_GET_KILNS_ERROR]: Payload NOT found`);
        displayApiErrorToast(action.payload, 'Unable to load Kilns');
        const loadKilnsErrorPath = 'loadKilnsError';
        return dotProp.set(state, loadKilnsErrorPath, true);
      }
      case types.MOISTURECOLLECTOR_GET_POSITIONS_SUCCESS: {
        logger.debug(`[STEP CHECK MOISTURECOLLECTOR_GET_POSITIONS_SUCCESS]: Payload is found`);
        const now = new Date();
        const positions = Array.isArray(action.payload)
          ? action.payload
          : [action.payload];
        return {
          ...state,
          offlinePositionsLastUpdate: now,
          onlinePositionsLastUpdate: now,
          positions,
        };
      }
      case types.MOISTURECOLLECTOR_GET_POSITIONS_ERROR: {
        logger.debug(`[STEP CHECK MOISTURECOLLECTOR_GET_POSITIONS_ERROR]: Payload NOT found`);
        displayApiErrorToast(action.payload, 'Unable to load positions');
        const loadPositionsErrorPath = 'loadPositionsError';
        return dotProp.set(state, loadPositionsErrorPath, true);
      }
      case types.MOISTURECOLLECTOR_ADD_MOISTURE_TO_ARRAY: {
        return {...state, moistureArrayData: [action.data, ...state.moistureArrayData]};
      }
      case types.MOISTURECOLLECTOR_UPDATE_MOISTURE_ARRAY_ELEMENT: {
        logger.debug('update id: ' + action.localID);
        logger.debug('update original array: ' + JSON.stringify(action.data));
        const elementsToFound = state.moistureArrayData.filter(      
          (e) => e.localID == action.localID,
        );  //making a new array
        let elementToUpdate = elementsToFound[0];
        logger.debug('update element: ' + JSON.stringify(elementToUpdate));
        let index = state.moistureArrayData.indexOf(elementToUpdate);
        logger.debug('index of elemnt: ' + index);
        state.moistureArrayData[index] = action.data//changing value in the new array
        
        return { ...state, moistureArrayData: state.moistureArrayData, }
      }
      case types.MOISTURECOLLECTOR_DELETE_MOISTURE_FROM_ARRAY: {
        logger.debug('MOISTURECOLLECTOR_DELETE_MOISTURE_FROM_ARRAY');
        logger.debug('id: ' +action.localID)
        logger.debug('moisturearra: ' +JSON.stringify(state.moistureArrayData))        
      
        let newArray = state.moistureArrayData

        let localID = Number(action.localID)

        var index = newArray.indexOf(action.localID)
        logger.debug('ninex' +index)

        newArray.splice(2, 1);
        logger.debug('newArray' +JSON.stringify(newArray))
        return {
          ...state,
          moistureArrayData: state.moistureArrayData.filter(
            moisture => moisture.localID !== localID,
          ),
        };
      }
      case types.MOISTURECOLLECTOR_SET_DEVICE_NAME:
      return {
        ...state,
        deviceName: action.deviceName,
      };
      case types.MOISTURECOLLECTOR_SET_DEVICE_OWNER:
      return {
        ...state,
        deviceOwner: action.deviceOwner,
      };
      case types.MOISTURECOLLECTOR_SET_BRANCH_ID:
      return {
        ...state,
        branchID: action.branchID,
      };
      case types.MOISTURECOLLECTOR_SET_BRANCH_NAME:
      return {
        ...state,
        branchName: action.branchName,
      };
      case types.MOISTURECOLLECTOR_SET_LOCATION_ID:
      return {
        ...state,
        locationID: action.locationID,
      };
      case types.MOISTURECOLLECTOR_SET_LOCATION_NAME:
      return {
        ...state,
        locationName: action.locationName,
      };
      case types.MOISTURECOLLECTOR_SET_MEAN_HIGH_LIMIT:
      return {
        ...state,
        meanHighLimit: action.meanHighLimit,
      };
      case types.MOISTURECOLLECTOR_SET_MEAN_LOW_LIMIT:
      return {
        ...state,
        meanLowLimit: action.meanLowLimit,
      };
      case types.MOISTURECOLLECTOR_SET_STD_DEV_HIGH_LIMIT:
      return {
        ...state,
        stdDevHighLimit: action.stdDevHighLimit,
      };
      case types.MOISTURECOLLECTOR_SET_STD_DEV_LOW_LIMIT:
      return {
        ...state,
        stdDevLowLimit: action.stdDevLowLimit,
      };
      case types.MOISTURECOLLECTOR_REPLACE_MOISTURE_ARRAY:
      return { 
        ...state,
        moistureArrayData: action.replacementMoistureArray,
      };
      case types.MOISTURECOLLECTOR_LOAD_OFFLINE_PROCESSES_SUCCESS: {
        if (
          action.offlineProcessesLastUpdate < state.onlineProcessesLastUpdate ||
          state.onlineProcessesLastUpdate === undefined
        ) {
          return {
            ...state,
            offlineProcessesLastUpdate: action.offlineProcessesLastUpdate,
            tasks: action.tasks,
          };
        }
        return state;
      }
      case types.MOISTURECOLLECTOR_SEND_ITEM_SUCCESS: {
        console.log('MOISTURECOLLECTOR_SEND_ITEM_SUCCESS');        
        const elementsToFound = state.moistureArrayData.filter(      
         (e) => e.localID == action.moisture.localID,
        );  //making a new array
        let elementToUpdate = elementsToFound[0];
        // // logger.debug('update element: ' + JSON.stringify(elementToUpdate));
        let index = state.moistureArrayData.indexOf(elementToUpdate);
        logger.debug('index of elemnt: ' + index);
        state.moistureArrayData[index].uploaded = true; //changing value in the new array
            
        return state;
      }
      case types.MOISTURECOLLECTOR_SEND_ITEM_ERROR: {
        displayApiErrorToast(action.payload, 'Error uploading moisture');
        console.log('MOISTURECOLLECTOR_SEND_ITEM_ERROR'); 
        console.log(JSON.stringify(action.moisture));

        const {message: errorMessage} = getApiErrorMessage(action.payload);
        logger.debug("the error to record on moisture: " + errorMessage);
        
        const elementsToFound = state.moistureArrayData.filter(      
          (e) => e.localID == action.moisture.localID,
        );  //making a new array
        let elementToUpdate = elementsToFound[0];
        // logger.debug('update element: ' + JSON.stringify(elementToUpdate));
        let index = state.moistureArrayData.indexOf(elementToUpdate);
        logger.debug('index of elemnt: ' + index);
        state.moistureArrayData[index].uploadFailed = true; 
        state.moistureArrayData[index].uploadError = errorMessage;      
        return state;
      }
       default:
         return state;
    }
  }

  export function loadProcesses(apiUrl, apiToken) {
    return (dispatch) => dispatch(apiGetProcesses(apiUrl, apiToken));
  }

  export function loadKilns(apiUrl, apiToken) {
    return (dispatch) => dispatch(apiGetKilns(apiUrl, apiToken));
  }

  export function loadPositions(apiUrl, apiToken) {
      return (dispatch) => dispatch(apiGetPositions(apiUrl, apiToken));      
}
export function sendMoisture(moistureToSend, apiUrl, apiToken) {
  logger.debug("apie " + apiUrl)
  logger.debug("reducer moisture " + JSON.stringify(moistureToSend))
  return (dispatch) => dispatch(apiSendItem(moistureToSend, apiUrl, apiToken));
}
