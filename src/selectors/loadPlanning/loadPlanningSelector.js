export const consignmentNotesSelector = (state, props) => {
  const [item] = state.loadItems.filter(
    (e) => e.loadConsignmentId === props.route.params.id,
  );
  return item ? item.notes : null;
};

export const consignmentInternalNotesSelector = (state, props) => {
  const [item] = state.loadItems.filter(
    (e) => e.loadConsignmentId === props.route.params.id,
  );
  return item ? item.internalNotes : null;
};

export const consignmentCustomerSelector = (state, props) => {
  const [item] = state.loadItems.filter(
    (e) => e.loadConsignmentId === props.route.params.id,
  );
  return item ? item.customerName : null;
};

export const consignmentProductDescriptionSelector = (state, props) => {
  const [item] = state.loadItems.filter(
    (e) => e.loadConsignmentId === props.route.params.id,
  );
  return item ? item.productDescription : null;
};

export const consignmentUomSelector = (state, props) => {
  const [item] = state.loadItems.filter(
    (e) => e.loadConsignmentId === props.route.params.id,
  );
  return item ? item.orderUom : null;
};

export const binPackNoSelector = (state, props) => {
  const [item] = state.loadItems.filter(
    (e) => e.loadConsignmentId === props.route.params.id,
  );
  return item ? item.binPacketNo : null;
};

export const isBinSelector = (state, props) => {
  const [item] = state.loadItems.filter(
    (e) => e.loadConsignmentId === props.route.params.id,
  );
  return item ? item.isBin : null;
};

export const reservedSelector = (state, props) => {
  const [item] = state.loadItems.filter(
    (e) => e.loadConsignmentId === props.route.params.id,
  );
  return item ? item.reserved : null;
};

export const oldestSelector = (state, props) => {
  const [item] = state.loadItems.filter(
    (e) => e.loadConsignmentId === props.route.params.id,
  );
  return item ? item.oldest : null;
};

export const isPickedSelector = (state, props) => {
  const [item] = state.loadItems.filter(
    (e) => e.loadConsignmentId === props.route.params.id,
  );
  return item ? item.isPicked : null;
};

export const consignmentTallySelector = (state, props) => {
  const [item] = state.loadItems.filter(
    (e) => e.loadConsignmentId === props.route.params.id,
  );
  return item ? item.consignmentTally : null;
};

export const loadIdSelector = (state, props) => {
  const [item] = state.loadItems.filter(
    (e) => e.loadConsignmentId === props.route.params.id,
  );
  return item ? item.loadId : null;
};

export const consignmentPickedSelector = (state, props) => {
  const [item] = state.loadItems.filter(
    (e) => e.loadConsignmentId === props.route.params.id,
  );
  return item ? item.packsPicked : null;
};

export const consignmentToPickSelector = (state, props) => {
  const [item] = state.loadItems.filter(
    (e) => e.loadConsignmentId === props.route.params.id,
  );
  return item ? item.packs : '0';
};
