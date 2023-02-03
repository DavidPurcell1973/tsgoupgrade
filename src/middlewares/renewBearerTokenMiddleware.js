import moment from 'moment';
import {isAfter} from 'date-fns';
import logger from '../helpers/logger';
import {displayToast} from '../helpers/utils';
import PayloadAction from '../helpers/PayloadAction';
import PayloadSource from '../helpers/PayloadSource';
import {renewTokenService} from '../helpers/tokenService';
import {sendAlertService} from '../helpers/systemAlert';

export const hasTokenExpired = (tokenExpiresAt) => {
  const currentTime = moment().format();
  const currentTimeInMs = Date.parse(currentTime);
  const refreshThreshold =
    Date.parse(tokenExpiresAt !== undefined ? tokenExpiresAt : moment()) -
    180000; // 3 minutes
  const okToRenewToken = currentTimeInMs > refreshThreshold;
  if (okToRenewToken) {
    logger.info(`Current device time: ${currentTime.toLocaleString()}`, {
      source: PayloadSource.Token,
      action: PayloadAction.Check,
    });
    logger.info(
      `Current token expires at: ${tokenExpiresAt.toLocaleString()}`,
      {
        source: PayloadSource.Token,
        action: PayloadAction.Check,
      },
    );
    logger.info(`Token expired? ${okToRenewToken.toLocaleString()}`, {
      source: PayloadSource.Token,
      action: PayloadAction.Check,
    });
  }
  return okToRenewToken;
};

export default function renewBearerTokenMiddleware() {
  return ({dispatch, getState}) =>
    (next) =>
    async (action) => {
      const {meta} = action;
      const {
        // Only renew token if enabled on the server side or keep using the same token
        enforceStrictTokenExpiry,
        tokenExpireAt,
      } = getState().appStore;

      sendAlertService().catch();

      if (
        enforceStrictTokenExpiry &&
        meta !== undefined &&
        meta.offline !== undefined &&
        meta.offline.effect.url &&
        hasTokenExpired(tokenExpireAt)
      ) {
        displayToast('Token expired. Renewing...', 1000);
        // logger.debug('Token expired. Renewing...', { source: PayloadSource.Token, action: PayloadAction.Renew });

        renewTokenService().catch();
      }

      return next(action);
    };
}
