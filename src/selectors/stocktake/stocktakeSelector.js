import {uniqBy, toNumber, isArray, isNumber, isEmpty} from 'lodash';
import {createSelector} from 'reselect';

export const branchesSelector = (state) => {
  const branches = uniqBy(state.stocktakeStore.locations, (e) => e.branchId);
  return branches.map((e) => ({
    value: e.branchId,
    label: e.branchName,
  }));
};

export const rowsSelector = (state, props) => {
  const rows = isArray(state.stocktakeStore.rows)
    ? state.stocktakeStore.rows.filter(
        (row) => row.stocktakeId === props.route.params.stocktakeId,
      )
    : [];
  return rows;
};

export const rowPacksByStocktakeIdSelector = (state, props) => {
  const packs = state.stocktakeStore.rowPacks.filter(
    (pack) => pack.stocktakeId === props.route.params.stocktakeId,
  );
  return packs;
};

export const allPacksSelector = (state, props) => {
  const packs = state.stocktakeStore.packs.filter(
    (pack) =>
      pack.stocktakeId === props.route.params.stocktakeId &&
      pack.locationId === props.route.params.locationId &&
      pack.rowName === props.route.params.rowName,
  );
  return packs;
};

export const rowPacksByRowNameSelector = (state, props) => {
  const packs = state.stocktakeStore.rowPacks.filter(
    (pack) =>
      pack.stocktakeId === props.route.params.stocktakeId &&
      pack.locationId === props.route.params.locationId &&
      pack.rowName === props.route.params.rowName,
  );
  return packs;
};

export const selectedBranchSelector = (state) =>
  state.stocktakeStore.selectedBranch;

export const allStocktakesSelector = (state) => state.stocktakeStore.stocktakes;

export const allLocationsSelector = (state) => state.stocktakeStore.locations;

export const locationsSelector = (state) => {
  const filteredLocations = state.stocktakeStore.locations.filter(
    (e) => e.branchId,
    // (e) => e.branchId === state.stocktakeStore.selectedBranchId,
  );
  return filteredLocations;
};

export const filteredLocationsSelector = (state) => {
  const filteredLocations = state.stocktakeStore.locations;
  // .filter((e) => e.branchId)
  // // .filter((e) => e.branchId === state.stocktakeStore.selectedBranchId)
  // .map((e) => ({
  //   value: toNumber(e.locationId),
  //   label: e.locationName,
  // }));
  // .filter((e) => isNumber(e.locationId) && isNumber(e.branchId));
  return filteredLocations;
};

export const stocktakesSelector = createSelector(
  selectedBranchSelector,
  allStocktakesSelector,
  (selectedBranchId, allStocktakes) =>
    selectedBranchId > 0
      ? allStocktakes.filter((e) => e.branchId === selectedBranchId)
      : allStocktakes,
);
