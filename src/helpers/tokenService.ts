import {differenceInSeconds} from 'date-fns';
import {isNaN, isNumber} from 'lodash';
import {displayToast} from './utils';
import {
  scheduleTickInSeconds,
  updateCurrentUser,
  updateIsRenewingToken,
  doLogout,
} from '../reducers/app/appStoreReducer';
import logger from './logger';
import PayloadSource from './PayloadSource';
import PayloadAction from './PayloadAction';
import store from '../store/configureStore';

export const renewTokenService = async (forceRenew = false) => {
  const {
    username,
    password,
    token,
    refreshToken,
    apiUrl,
    selectedSiteEndpoint,
    isRenewingToken,
    lastRenewingTokenTimestamp,
    deviceInfo,
  } = store.getState().appStore;

  const differenceInSecondsLastRenewalAction = lastRenewingTokenTimestamp
    ? differenceInSeconds(new Date(), lastRenewingTokenTimestamp)
    : 0;

  logger.debug(
    `differenceInSecondsLastRenewalAction ${differenceInSecondsLastRenewalAction}`,
  );

  if (isRenewingToken && differenceInSecondsLastRenewalAction >= 30) {
    logger.warn(`Detected renewTokenService stuck - forcing a token renewal! `);
    forceRenew = true;
  } else if (isNaN(differenceInSecondsLastRenewalAction)) {
    logger.warn(`NaN detected - forcing a token renewal! `);
    forceRenew = true;
  }

  if (!isRenewingToken || forceRenew) {
    store.dispatch(updateIsRenewingToken(true));

    console.log('renewTokenService START');

    const renewOptions = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        refreshToken,
      }),
    };

    try {
      const response = await fetch(
        `${selectedSiteEndpoint || apiUrl}/api/auth/renew`,
        renewOptions,
      );

      const json = await response.json();

      console.log('Response received... ');

      if (json.token) {
        logger.debug(
          `Old token ${token.slice(-10)}; New token ${json.token.slice(
            -10,
          )} expires at ${json.tokenExpireAt.toLocaleString()}`,
          {source: PayloadSource.Token, action: PayloadAction.Renew},
        );
        const newUser = {
          username,
          password,
          newToken: json.token,
          newRefreshToken: json.refreshToken,
          newTokenExpireAt: json.tokenExpireAt,
          tokenExpiryMinutes: json.tokenExpiryMinutes,
        };
        logger.debug(JSON.stringify(newUser));
        store.dispatch(updateCurrentUser(newUser));
        const message = 'Session renewed - Have a nice day!';
        displayToast(message, 10000);
        logger.info('Token renew successful', {
          source: PayloadSource.Token,
          action: PayloadAction.RenewOK,
        });
      } else {
        displayToast('User session has expired. Please re-login.');
        console.log('User session has expired. Please re-login.');
        logger.warn(
          `Token has already expired? Forcing ${username} (${deviceInfo.deviceName}: ${deviceInfo.androidId}) log out...`,
          {
            source: PayloadSource.Token,
            action: PayloadAction.Fatal,
          },
        );
        store.dispatch(doLogout());
        // displayDialog('Error', `User session has expired! Please re-login.`);
      }

      console.log('renewTokenService END');
      store.dispatch(updateIsRenewingToken(false));
    } catch (err) {
      const errorMessage = 'Error when renewing token!';
      console.error(err);
      displayToast(errorMessage);
      logger.warn(errorMessage, {
        source: PayloadSource.Token,
        action: PayloadAction.Catch,
      });
      logger.error(err);
    }

    store.dispatch(updateIsRenewingToken(false));
    console.log('renewTokenService schedule TICKs');
    setTimeout(() => store.dispatch(scheduleTickInSeconds(2)), 2000);
    setTimeout(() => store.dispatch(scheduleTickInSeconds(5)), 5000);
  } else {
    console.log('renewTokenService IN PROGRESS');
    logger.debug('Renewal in progress... Skip auto token renewal', {
      source: PayloadSource.Token,
      action: PayloadAction.SkipRenew,
    });
  }
};

// export const refreshAccessToken = () => {
//   const {
//     enforceStrictTokenExpiry, // Only renew token if it's enabled on the server side or keep using the same token
//     username,
//     password,
//     token,
//     refreshToken,
//     isRenewingToken,
//   } = store.getState().appStore;
//
//   const apiUrl = apiUrlSelector(store.getState());
//
//   if (enforceStrictTokenExpiry && !isRenewingToken) {
//     logger.debug('Can renew token now...');
//     // const refreshThreshold =
//     //   Date.parse(tokenExpireAt !== undefined ? tokenExpireAt : moment()) -
//     //   180000; // 3 minutes
//     // const currentTime = Date.parse(moment().format());
//     // const okToRenewToken = currentTime > refreshThreshold;
//     let status = null;
//     const okToRenewToken = true;
//     if (refreshToken && okToRenewToken) {
//       logger.debug('Sending request to renew token...', { source: PayloadSource.Token, action: PayloadAction.None });
//
//       store.dispatch(updateIsRenewingToken(true));
//
//       fetch(`${apiUrl || Config.API_URL}/api/auth/renew`, {
//         method: 'POST',
//         headers: {
//           Accept: 'application/json',
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           refreshToken,
//         }),
//       })
//           .then((response) => response.json())
//           .then((responseJson) => {
//             if (
//                 responseJson
//                 && responseJson.token !== undefined
//                 && responseJson.tokenExpireAt !== undefined
//                 && responseJson.token.length > 0
//                 && responseJson.tokenExpireAt.toString().length > 0
//             ) {
//               store.dispatch(
//                   updateCurrentUser({
//                     username,
//                     password,
//                     newToken: responseJson.token,
//                     newTokenExpireAt: responseJson.tokenExpireAt,
//                   }),
//               );
//               status = responseJson.token;
//             }
//           })
//           .catch((error) => {
//             logger.error(error, { source: PayloadSource.Token, action: PayloadAction.Catch });
//             // logger.notify(new Error(error));
//           })
//           .finally(() => {
//             store.dispatch(updateIsRenewingToken(false));
//             return status;
//           });
//     }
//   }
// };
