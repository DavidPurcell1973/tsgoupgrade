import uniqBy from 'lodash/uniqBy';
import isArray from 'lodash/isArray';
import has from 'lodash/has';
import * as dotProp from 'dot-prop-immutable';

export const getDistinctloads = (state, props) =>
  (state.podStore.loads
    ? uniqBy(
        state.podStore.loads.map((l) => ({
          id: l.loadId,
          'Load#': l.loadId,
          // 'Assigned to': l.driversName,
          Customers: l.combinedCustomerName.trim(),
          'Delivery Zone': l.deliveryZone,
        })),
        'id',
      )
    : []
  ).map((e) => ({
    ...e,
    'Completed?':
      state.podStore.loads.filter((el) => el.loadId === e.id && !el.hasPod)
        .length > 0
        ? 'No'
        : 'Yes', // .filter((el) => el.loadId === e.id).length,
  }));

export const getOrderFileName = (state, loadId, despatchId) =>
  dotProp.get(state, `podStore.captures.${loadId}.${despatchId}.fileName`);

export const getOrderEncodedSignature = (state, loadId, despatchId) => {
  const encodedSignature = dotProp.get(
    state,
    `podStore.captures.${loadId}.${despatchId}.encodedSignature`,
  );
  return encodedSignature;
};

export const getOrderReceivedOn = (state, loadId, despatchId) =>
  dotProp.get(state, `podStore.captures.${loadId}.${despatchId}.receivedOn`);

export const getOrderSentStatus = (state, loadId, despatchId) =>
  dotProp.get(state, `podStore.captures.${loadId}.${despatchId}.sent`)
    ? 'Yes'
    : 'No';

export const getOrderReceivedBy = (state, loadId, despatchId) => {
  const signer = state.signers.filter(
    (signer) => signer.loadId === loadId && signer.despatchId === despatchId,
  );
  if (signer.length > 0) return signer[0].receivedBy;
  return '';
};

export const getOrderComments = (state, loadId, despatchId) => {
  const signer = state.signers.filter(
    (signer) => signer.loadId === loadId && signer.despatchId === despatchId,
  );
  if (signer.length > 0) return signer[0].comments;
  return '';
};

export const getLoadDespatches = (state, props) =>
  state.podStore.loads
    .filter((l) => l.loadId === props.route.params.id)
    .map((e) => ({
      ...e,
      hasSignature: !!(
        has(
          state,
          `podStore.captures.${e.loadId}.${e.despatchId}.receivedOn`,
        ) ||
        state.podStore.photos.filter(
          (photo) =>
            photo.loadId === e.loadId && photo.despatchId === e.despatchId,
        ).length > 0
      ),
      // Check if server has received POD and all signature and photos are sent to the server
      isComplete: !!(
        e.hasPod &&
        dotProp.get(
          state,
          `podStore.captures.${e.loadId}.${e.despatchId}.sent`,
        ) &&
        state.podStore.photos
          .filter(
            (photo) =>
              photo.loadId === e.loadId && photo.despatchId === e.despatchId,
          )
          .filter((photo) => !photo.sent).length === 0
      ),
    }));

export const getCarrierName = (state, props) =>
  isArray(state.podStore.loads) &&
  state.podStore.loads[0] &&
  state.podStore.loads[0].contractorName
    ? state.podStore.loads[0].contractorName
    : '';

export const getDriverName = (state, props) =>
  isArray(state.podStore.loads) &&
  state.podStore.loads[0] &&
  state.podStore.loads[0].driversName
    ? state.podStore.loads[0].driversName
    : '';

export const getOrderSignature = (state, loadId, despatchId) => {
  const signaturePath = `captures.${loadId}.${despatchId}`;
  const signature = dotProp.get(state, signaturePath);
  if (signature && signature.fileName) {
    return {...signature, encodedSignature: null};
  }
  return null;
};

export const getOrderPhotos = (state, loadId, despatchId) =>
  state.photos.filter(
    (photo) => photo.loadId === loadId && photo.despatchId === despatchId,
  );
