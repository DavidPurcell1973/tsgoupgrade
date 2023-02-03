import uniqBy from 'lodash/uniqBy';
import isArray from 'lodash/isArray';
import has from 'lodash/has';
import * as dotProp from 'dot-prop-immutable';

export const getMoistures = (state, props) =>
  state.moistureCollectorStore.moistures
    .filter((m) => m.moistureId === props.route.params.id)
    .map((e) => ({
      ...e,
      
      // Check if server has received POD and all signature and photos are sent to the server
      
    }));

