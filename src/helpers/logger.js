import {Client as RollBarClient} from 'rollbar-react-native';
import DeviceInfo from 'react-native-device-info';
import urlcat from 'urlcat';
import fetch from 'node-fetch';

const androidId = __DEV__ ? 'DevAndroid' : DeviceInfo.getAndroidIdSync();
const macAddress = __DEV__ ? 'DevMacAddress' : DeviceInfo.getMacAddressSync();
const deviceIdent = androidId || macAddress;

// const seqMessageFactory = (type, message, payload) => {
//   const androidId = __DEV__ ? 'DevAndroid' : DeviceInfo.getAndroidIdSync();
//   const macAddress = __DEV__ ? 'DevMacAddress' : DeviceInfo.getMacAddressSync();
//   const deviceIdent = androidId || macAddress;

//   return {
//     '@t': new Date().toISOString(),
//     '@mt': `[{DeviceId}] ${message}`,
//     '@l': type || 'informational',
//     DeviceId: deviceIdent || 'UnknownAndroidId',
//     Message: message,
//     ...payload,
//     IsClient: true,
//   };
// };

// const rollbarApi = getEnvStringOrDefault('ROLLBAR_API');
// console.log(`rollbarapi${rollbarApi}`);
// export const bugsnag = new BugSnagClient('bf67c82310af2a8b0c9deeef833db410');
// export const rollbar = new RollBarClient(rollbarApi);
export const rollbar = new RollBarClient('629d28cd429e45418bff46ad4f527f8d');

// export const seq = async (type, message, payload) => {
//   const seqBaseUrl = await getEnvStringOrDefault('SEQ_URL');
//   const seqApi = await getEnvStringOrDefault('SEQ_API');
//   const storedSeqLogging =
//     (await getEnvStringOrDefault('SEQ_LOGGING_ENABLED')) === 'true';

//   if (!storedSeqLogging) return;

//   try {
//     const seqFullUrl = seqBaseUrl + seqApi;
//     const body = seqMessageFactory(type, message, payload);
//     const response = await fetch(seqFullUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(body),
//     });
//     if (__DEV__) {
//       const data = await response.json();
//       // console.log(`SEQ Response: ${JSON.stringify(data)}`);
//     }
//   } catch (error) {
//     if (__DEV__) {
//       // console.info(
//       //   `SQL Error: ${
//       //     typeof error === 'object' ? JSON.stringify(error) : error
//       //   }`,
//       // );
//     }
//   }
// };

const baseLoggerUrl = 'https://logs.logdna.com/logs/ingest';
const apiKey = '356168e523e94d3dc4ddea42bf8c4fd7';
const headers = {
  'Content-Type': 'application/json; charset=UTF-8',
  // token: Buffer.from('apikey:' + apiKey).toString('base64'),
};

const queryParams = {
  hostname: deviceIdent,
  // mac: 'test',
  // ip: '121',
  now: ~~(Date.now() / 1000),
  apikey: apiKey,
};

const sendToLogDna = async (message) => {
  const fullUrl = urlcat(baseLoggerUrl, queryParams);
  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(message),
    });
    if (response.status !== 200 || response.status !== 201) {
      const json = await response.json();
      // console.log(json);
    }
  } catch (error) {
    console.warn(error);
  }
};

const messageFactory = async (message, timestamp, level = 'INFO', payload) => ({
  lines: [
    {
      timestamp: ~~(new Date(timestamp || new Date()) / 1000),
      line: message,
      app: 'tsgo',
      level: level.toUpperCase(),
      env: __DEV__ ? 'development' : 'production',
      // meta: __DEV__
      //   ? {androidId: 'DevAndroid'}
      //   : {
      //       androidId: DeviceInfo.getAndroidIdSync,
      //       apiLevel: DeviceInfo.getApiLevel,
      //       deviceName: DeviceInfo.getDeviceNameSync,
      //       ipAddress: DeviceInfo.getIpAddressSync,
      //       manufacturer: DeviceInfo.getManufacturerSync,
      //       systemName: DeviceInfo.getSystemName,
      //       macAddress: DeviceInfo.getMacAddressSync,
      //       deviceId: DeviceInfo.getDeviceId,
      //       freeDiskStorage: DeviceInfo.getFreeDiskStorageSync,
      //       carrier: DeviceInfo.getCarrierSync,
      //       appName: DeviceInfo.getApplicationName,
      //       ...payload,
      //     },
      meta: {
        androidId: DeviceInfo.getAndroidIdSync,
        apiLevel: DeviceInfo.getApiLevel,
        deviceName: DeviceInfo.getDeviceNameSync,
        ipAddress: DeviceInfo.getIpAddressSync,
        manufacturer: DeviceInfo.getManufacturerSync,
        systemName: DeviceInfo.getSystemName,
        macAddress: DeviceInfo.getMacAddressSync,
        deviceId: DeviceInfo.getDeviceId,
        freeDiskStorage: DeviceInfo.getFreeDiskStorageSync,
        carrier: DeviceInfo.getCarrierSync,
        appName: DeviceInfo.getApplicationName,
        ...payload,
      },
    },
  ],
});

const logger = () => {
  const info = async (message, payload) => {
    if (__DEV__) {
      console.info(
        `${message} ${
          payload ? `with payload ${JSON.stringify(payload)}` : ''
        }`,
      );
    }
    const messagePayload = await messageFactory(
      message,
      new Date(),
      'INFO',
      payload,
    );
    await sendToLogDna(messagePayload);
  };

  const debug = async (message, payload) => {
    if (__DEV__) {
      console.debug(
        `${message} ${
          payload ? `with payload ${JSON.stringify(payload)}` : ''
        }`,
      );
    }
    await sendToLogDna(
      await messageFactory(message, new Date(), 'DEBUG', payload),
    );
  };

  const warn = async (message, payload) => {
    if (__DEV__) {
      console.warn(
        `${message} ${
          payload ? `with payload ${JSON.stringify(payload)}` : ''
        }`,
      );
    }
    await sendToLogDna(
      await messageFactory(message, new Date(), 'WARN', payload),
    );
  };

  const warning = warn;

  const error = async (message) => {
    if (__DEV__) {
      console.error(`${message}`);
    }
    if (rollbar) rollbar.error(JSON.stringify(message));
    await sendToLogDna(await messageFactory(message, new Date(), 'ERROR'));
  };

  const critical = error;

  return {
    critical,
    info,
    debug,
    warn,
    warning,
    error,
  };
};

export default logger();
