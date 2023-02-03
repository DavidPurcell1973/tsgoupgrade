export const orderNotesSelector = (state, props) => {
  const [item] = state.orderItems.filter(
    (e) => e.orderItemId === props.route.params.id,
  );
  return item ? item.notes : null;
};

export const orderInternalNotesSelector = (state, props) => {
  const [item] = state.orderItems.filter(
    (e) => e.orderItemId === props.route.params.id,
  );
  return item ? item.internalNotes : null;
};

export const orderProductDescriptionSelector = (state, props) => {
  const [item] = state.orderItems.filter(
    (e) => e.orderItemId === props.route.params.id,
  );
  return item ? item.productDescription : null;
};

export const binPackNoSelector = (state, props) => {
  const [item] = state.orderItems.filter(
    (e) => e.orderItemId === props.route.params.id,
  );
  return item ? item.bin : null;
};

export const isBinSelector = (state, props) => {
  const [item] = state.orderItems.filter(
    (e) => e.orderItemId === props.route.params.id,
  );
  return item ? item.isBin : null;
};

export const reservedSelector = (state, props) => {
  const [item] = state.orderItems.filter(
    (e) => e.orderItemId === props.route.params.id,
  );
  return item ? item.reserved : null;
};

export const oldestSelector = (state, props) => {
  const [item] = state.orderItems.filter(
    (e) => e.orderItemId === props.route.params.id,
  );
  return item ? item.oldest : null;
};

export const isPickedSelector = (state, props) => {
  const [item] = state.orderItems.filter(
    (e) => e.orderItemId === props.route.params.id,
  );
  return item ? item.isPicked : null;
};

export const orderTallySelector = (state, props) => {
  const [item] = state.orderItems.filter(
    (e) => e.orderItemId === props.route.params.id,
  );
  return item ? item.orderTally : null;
};

export const orderPickedSelector = (state, props) => {
  const [item] = state.orderItems.filter(
    (e) => e.orderItemId === props.route.params.id,
  );
  return item ? item.picked.toString() : null;
};

export const orderToPickSelector = (state, props) => {
  const [item] = state.orderItems.filter(
    (e) => e.orderItemId === props.route.params.id,
  );
  return item ? item.qty.toString() : '0';
};
