import dotProp from 'dot-prop-immutable';
import moment from 'moment';
import isArray from 'lodash/isArray';
import * as types from '../../actions/pod/podActions';
import initialState from '../initialState';
import {playGoodSound, playBadSound} from '../../components/common/playSound';
import {displayToast, displayApiErrorToast} from '../../helpers/utils';
import {find, isNumber} from 'lodash';
import {act} from 'react-test-renderer';
import {current} from 'immer';

export const getLoads = (apiUrl, apiToken) => ({
  type: types.POD_GET_LOADS,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/POD/Loads`,
        headers: {Authorization: `Bearer ${apiToken}`},
      },
      commit: {type: 'POD_GET_LOADS_SUCCESS', meta: {}},
      rollback: {type: 'POD_GET_LOADS_ERROR', meta: {}},
    },
  },
});

export const refreshLoads = (payload) => ({
  type: types.POD_GET_LOADS,
  payload: {},
  meta: {
    offline: {
      effect: {
        url: `${payload.apiUrl}/api/POD/Loads`,
        headers: {Authorization: `Bearer ${payload.apiToken}`},
      },
      commit: {type: 'POD_GET_LOADS_SUCCESS', meta: {payload}},
      rollback: {type: 'POD_GET_LOADS_ERROR', meta: {payload}},
    },
  },
});

export const apiSendPhoto = (
  apiUrl,
  apiToken,
  loadId,
  despatchId,
  fileName,
  receivedOn,
  receivedBy,
  comments,
  height,
  width,
  pictureOrientation,
  encodedPhoto,
) => ({
  type: types.POD_SEND_PHOTO,
  payload: {
    apiUrl,
    apiToken,
    loadId,
    despatchId,
    fileName,
    receivedOn,
    receivedBy,
    comments,
    height,
    width,
    pictureOrientation,
    encodedPhoto,
  },
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/POD/Photo`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
        json: {
          loadId,
          despatchId,
          fileName,
          receivedOn,
          receivedBy,
          comments,
          height,
          width,
          pictureOrientation,
          encodedPhoto,
        },
      },
      commit: {
        type: 'POD_SEND_PHOTO_SUCCESS',
        meta: {
          then: refreshLoads,
          apiUrl,
          apiToken,
          loadId,
          despatchId,
          fileName,
          receivedOn,
          receivedBy,
          comments,
          height,
          width,
          pictureOrientation,
        },
      },
      rollback: {
        type: 'POD_SEND_PHOTO_ERROR',
        meta: {},
      },
    },
  },
});

export const apiSendSignature = (
  apiUrl,
  apiToken,
  loadId,
  despatchId,
  fileName,
  receivedOn,
  receivedBy,
  encodedSignature,
  filePath,
  comments,
) => ({
  type: types.POD_SEND_SIGNATURE,
  payload: {
    apiUrl,
    apiToken,
    loadId,
    despatchId,
    fileName,
    receivedOn,
    receivedBy,
    encodedSignature,
    filePath,
    comments,
  },
  meta: {
    offline: {
      effect: {
        url: `${apiUrl}/api/POD/Signature`,
        method: 'POST',
        headers: {Authorization: `Bearer ${apiToken}`},
        json: {
          loadId,
          despatchId,
          fileName,
          receivedOn,
          receivedBy,
          encodedSignature,
          filePath,
          comments,
        },
      },
      commit: {
        type: 'POD_SEND_SIGNATURE_SUCCESS',
        meta: {
          then: refreshLoads,
          loadId,
          apiUrl,
          apiToken,
          despatchId,
          fileName,
          receivedOn,
          receivedBy,
          encodedSignature,
          filePath,
          comments,
        },
      },
      rollback: {type: 'POD_SEND_SIGNATURE_ERROR', meta: {}},
    },
  },
});

export const rehydrateCaptures = (captures, capturesLastUpdate) => ({
  type: types.POD_REHYDRATE_CAPTURES,
  captures,
  capturesLastUpdate,
});

export const rehydrateLoads = (loads, offlineLoadsLastUpdate) => ({
  type: types.POD_REHYDRATE_LOADS,
  loads,
  offlineLoadsLastUpdate,
});

export const updateSignature = (metadata) => ({
  type: types.POD_UPDATE_SIGNATURE,
  metadata,
  dataType: 'signature',
});

export const deleteDespatchPhoto = (photo) => ({
  type: types.POD_DELETE_DESPATCH_PHOTO,
  photo,
});

export const addDespatchPhoto = (metadata) => ({
  type: types.POD_ADD_DESPATCH_PHOTO,
  metadata,
});

export const updateUserInput = (loadId) => ({
  type: types.POD_UPDATE_USER_INPUT,
  loadId,
});

export default function podReducer(state = initialState.podStore, action) {
  switch (action.type) {
    case types.POD_GET_LOADS_SUCCESS:
      console.log('POD_GET_LOADS_SUCCESS');
      const loads = [].concat(action.payload);
      return {
        ...state,
        loads,
      };
    case types.POD_UPDATE_USER_INPUT:
      return {...state, userInput: action.loadId};
    case types.POD_GET_LOADS_ERROR:
      console.log('POD_GET_LOADS_ERROR');
      displayApiErrorToast(action.payload, 'Unable to retrieve load list');
      return state;
    case types.POD_DELETE_DESPATCH_PHOTO: {
      return {
        ...state,
        photos: state.photos.filter((p) => p.uuid !== action.photo.uuid),
      };
    }
    case types.POD_ADD_DESPATCH_PHOTO: {
      return {...state, photos: [...state.photos, action.metadata]};
    }
    case types.POD_SEND_PHOTO_ERROR:
      console.log('POD_SEND_PHOTO_ERROR');
      displayApiErrorToast(action.payload, 'Unable to send photo to server!');
      return state;
    case types.POD_SEND_PHOTO_SUCCESS: {
      console.log('POD_SEND_PHOTO_SUCCESS');
      // Insert meta data into payload for action chaining
      // eslint-disable-next-line no-param-reassign
      action.payload = {...action.payload, ...action.meta};
      // TODO: Clean up old captures
      const serverReply = `Sent photo for Despatch ${action.payload.despatchId}`;
      displayToast(serverReply);
      const currentPhoto = state.photos.filter(
        (photo) =>
          photo.loadId === action.meta.loadId &&
          photo.despatchId === action.meta.despatchId &&
          photo.fileName === action.meta.fileName,
      );
      if (currentPhoto.length > 0) {
        currentPhoto[0].sent = true;
        currentPhoto[0].sentDate = new Date();
        return {
          ...state,
          photos: [
            ...state.photos.filter(
              (photo) =>
                !(
                  photo.loadId === action.meta.loadId &&
                  photo.despatchId === action.meta.despatchId &&
                  photo.fileName === action.meta.fileName
                ),
            ),
            ...currentPhoto,
          ],
        };
      }
      return state;
    }
    case types.POD_SEND_SIGNATURE_ERROR:
      console.log('POD_SEND_SIGNATURE_ERROR');
      displayApiErrorToast(
        action.payload,
        'Unable to send signature to server!',
      );
      return state;
    case types.POD_SEND_SIGNATURE_SUCCESS: {
      console.log('POD_SEND_SIGNATURE_SUCCESS');
      const {loadId, despatchId} = action.meta;

      // Insert meta data into payload for action chaining
      // eslint-disable-next-line no-param-reassign
      action.payload = {...action.payload, ...action.meta};

      const currentSignature = find(
        state.signatures,
        (e) =>
          e.despatchId === despatchId &&
          e.loadId === loadId &&
          e.type === 'signature',
      );
      if (currentSignature) {
        const serverReply = `Sent signature for Despatch ${action.payload.despatchId}`;
        displayToast(serverReply);

        return {
          ...state,
          signatures: [
            ...state.signatures.filter(
              (e) =>
                !(
                  e.despatchId === despatchId &&
                  e.loadId === loadId &&
                  e.type === 'signature'
                ),
            ),
            {...currentSignature, sent: true, sentDate: new Date()},
          ],
        };
      }

      // const signatureSendStatusPath = `captures.${action.meta.loadId}.${action.meta.despatchId}.sent`;
      // const updatedState = dotProp.set(state, signatureSendStatusPath, true);

      // TODO: Clean up old captures

      return state;
    }
    case types.POD_UPDATE_SIGNATURE: {
      console.log('POD_UPDATE_SIGNATURE');
      const {loadId, despatchId} = action.metadata;
      if (isNumber(loadId) && isNumber(despatchId)) {
        const currentSignature = find(
          state.signatures,
          (e) =>
            e.despatchId === despatchId &&
            e.loadId === loadId &&
            e.type === action.dataType,
        );
        const existingSignature = state.signatures.filter(
          (e) =>
            !(
              e.despatchId === despatchId &&
              e.loadId === loadId &&
              e.type === action.dataType
            ),
        );
        if (currentSignature) {
          return {
            ...state,
            signatures: [
              ...existingSignature,
              {...currentSignature, ...action.metadata},
            ],
          };
        } else {
          return {
            ...state,
            signatures: [
              ...existingSignature,
              {...action.metadata, type: action.dataType},
            ],
          };
        }
      }
      return state;
      // const signatureCapturePath = `captures.${action.loadId}.${action.despatchId}.encodedSignature`;
      // const signatureReceivedOnPath = `captures.${action.loadId}.${action.despatchId}.receivedOn`;
      // const signatureSendStatusPath = `captures.${action.loadId}.${action.despatchId}.sent`;
      // const signatureCaptureFileNamePath = `captures.${action.loadId}.${action.despatchId}.fileName`;
      // const fileName = `${action.loadId}_${action.despatchId}.png`;

      // let updated = dotProp.set(state, signatureCaptureFileNamePath, fileName);
      // updated = dotProp.set(updated, signatureSendStatusPath, false);
      // updated = dotProp.set(
      //   updated,
      //   signatureReceivedOnPath,
      //   moment().format(),
      // );

      // return action.loadId > 0 && action.despatchId > 0
      //   ? dotProp.set(updated, signatureCapturePath, action.encodedSignature)
      //   : state;
    }
    case types.POD_REHYDRATE_LOADS:
      return {
        ...state,
        loads: action.loads,
      };
    default:
      return state;
  }
}
