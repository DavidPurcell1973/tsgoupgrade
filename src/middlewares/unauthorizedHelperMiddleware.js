import logger from '../helpers/logger';
import { displayToast } from '../helpers/utils';

export default function unauthorizedHelperMiddleware() {
  return ({ dispatch, getState }) => (next) => (action) => {
    const { payload, meta } = action;

    if (
      meta !== undefined
      && payload !== undefined
      && payload.status === 410
      && meta.success === false
      && meta.completed === true
    ) {
      displayToast('Unauthorized access');
      // store.dispatch(doLogout());
      logger.warn('Received 410');
    }

    return next(action);
  };
}
