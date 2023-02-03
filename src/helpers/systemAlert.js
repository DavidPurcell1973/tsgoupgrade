import store from '../store/configureStore';
import logger from './logger';
import PayloadSource from './PayloadSource';
import PayloadAction from './PayloadAction';
import {sendSystemAlert} from '../reducers/app/appStoreReducer';
import {differenceInSeconds} from 'date-fns';

export const sendAlertService = async () => {
  const {alerts} = store.getState().appStore;
  const {message, type} = alerts;
  let duration = 0;
  const durationLimit = 300;

  switch (type) {
    case 'warning':
      duration = differenceInSeconds(new Date(), alerts.warningSent);
      if (message !== alerts.warningMessage && duration > durationLimit) {
        logger
          .warn(message, {
            source: PayloadSource.Alert,
            action: PayloadAction.Warning,
          })
          .catch();
        store.dispatch(sendSystemAlert(message, type));
      }
      break;
    case 'error':
      duration = differenceInSeconds(new Date(), alerts.errorSent);
      if (message !== alerts.errorMessage && duration > durationLimit) {
        logger
          .error(message, {
            source: PayloadSource.Alert,
            action: PayloadAction.Error,
          })
          .catch();
        store.dispatch(sendSystemAlert(message, type));
      }
      break;
    default:
      duration = differenceInSeconds(new Date(), alerts.verboseSent);
      if (message !== alerts.verboseMessage && duration > durationLimit) {
        logger
          .info(message, {
            source: PayloadSource.Alert,
            action: PayloadAction.Info,
          })
          .catch();
        store.dispatch(sendSystemAlert(message, type));
      }
  }
};
