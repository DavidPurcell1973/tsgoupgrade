import storage from '@react-native-async-storage/async-storage'; // RN >= 59
import Toast from 'react-native-root-toast';
import DialogAndroid from 'react-native-dialogs';
import get from 'lodash/get';
import Config from 'react-native-config';
import {isEmpty} from './stringUtils.ts';
import logger from './logger';

export const saveDataStringAsync = async (key, data) => {
  try {
    await storage.removeItem(key);
    await storage.setItem(key, data);
  } catch (err) {
    // TODO
  }
};

export const saveDataObjectAsync = async (key, data) => {
  try {
    await storage.removeItem(key);
    await storage.setItem(key, JSON.stringify(data));
  } catch (err) {
    // TODO
  }
};

export const getDataStringAsync = async (key) => {
  try {
    const value = await storage.getItem(key);
    return value;
  } catch (e) {
    return null;
  }
};

export const getDataObjectAsync = async (key) => {
  try {
    const jsonValue = await storage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    return null;
  }
};

export const resetStoreAsync = async () => {
  try {
    await storage.clean();
    // await saveAsync('StocktakeRows', {});
    // await saveAsync('OfflineRowsLastUpdate', {});
    // await saveAsync('ConsignmentItems', {});
    // await saveAsync('Locations', {});
    // await saveAsync('OfflineLocationsLastUpdate', {});
    // await saveAsync('OrderItemItems', {});
    // await saveAsync('SmartScanInput', {});
    // await saveAsync('SmartScanTasks', {});
  } catch (err) {
    // displayDialog('Error', JSON.stringify(err)).then();
  }
};

export const getEnvStringOrDefault = async (key) => {
  let value;
  value = await getDataStringAsync(key);
  if (!value) {
    value = await Config[key.toUpperCase()];
  }
  if (isEmpty(value)) {
    console.log(`Unable to get value for key ${key}`);
  }
  return value;
};

export const displayToast = (message, duration) => {
  let toast = Toast.show(message, {
    duration: Toast.durations.LONG,
    position: Toast.positions.BOTTOM,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 0,    
  });

  setTimeout(
    () => {
      Toast.hide(toast);
    },
    duration === undefined ? 5000 : duration,
  );
};

export const getApiErrorMessage = (apiError) => {
  const isError =
    get(apiError, 'response.isError') || get(apiError, 'response.IsError');
  const message =
    get(apiError, 'response.Error.message') ||
    get(apiError, 'response.message') ||
    'API error';
  return {isError, message};
};

export const displayApiErrorToast = (apiError, defaultMessage, duration) => {
  logger.warn(apiError);
  const IsError = get(apiError, 'response.IsError');
  const isError = get(apiError, 'response.isError');
  const errorMessage =
    get(apiError, 'response.Error.message') ||
    get(apiError, 'response.message') ||
    'API error';
  if (IsError || isError) {
    displayToast(errorMessage, duration);
    console.error(errorMessage);
  } else {
    displayToast(defaultMessage || 'Unknown error', duration);
  }
};

export const displayDialogWithOptions = async (title, message, options) => {
  DialogAndroid.assignDefaults(
    options.buttons || {
      positiveText: 'OK',
      negativeText: null,
    },
  );
  if (options.type === 'prompt') {
    const {action, text} = await DialogAndroid.prompt(
      title,
      message,
      options.input,
    );

    switch (action) {
      case DialogAndroid.actionPositive:
        if (options.success) options.success(text);
        break;
      case DialogAndroid.actionNeutral:
        if (options.neutral) options.neutral(text);
        break;
      case DialogAndroid.actionNegative:
        if (options.negative) options.negative(text);
        break;
      case DialogAndroid.actionDismiss:
        if (options.dismiss) options.dismiss();
        break;
      default:
        if (options.default) options.default(text);
        break;
    }
  } else {
    const {action} = await DialogAndroid.alert(title, message);

    switch (action) {
      case DialogAndroid.actionPositive:
        if (options.success) options.success();
        break;
      case DialogAndroid.actionDismiss:
        if (options.dismiss) options.dismiss();
        break;
      case DialogAndroid.actionNeutral:
        if (options.neutral) options.neutral();
        break;
      case DialogAndroid.actionNegative:
        if (options.negative) options.negative();
        break;
      default:
        if (options.default) options.default();
        break;
    }
  }
};

export const displayDialog = async (
  title,
  message,
  input,
  succcessCallback,
  buttons,
  type,
) => {
  DialogAndroid.assignDefaults(
    buttons || {
      positiveText: 'OK',
      negativeText: null,
    },
  );
  if (type === 'prompt') {
    const {action, text} = await DialogAndroid.prompt(title, message, input);

    switch (action) {
      case DialogAndroid.actionPositive:
        succcessCallback(text);
        break;
      default:
        break;
    }
  } else {
    const {action} = await DialogAndroid.alert(title, message);

    switch (action) {
      case DialogAndroid.actionPositive:
        break;
      default:
        break;
    }
  }
};

export const isValidUrl = (url) => {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ); // fragment locator
  return !!pattern.test(url);
};
