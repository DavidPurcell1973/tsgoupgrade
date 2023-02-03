import RNFS from 'react-native-fs';
import CodePush from 'react-native-code-push';
import logger from './logger';
import {version as baseVersion} from '../../package.json';

// export const appMetaUrl = 'https://tsmart.app/meta/tsgo';
export const appMetaV2Url = 'https://meta.tsmart.app/tsgo.json';

// Production
export const codePushProductionDeploymentKey =
  'uwMmJX0b-_mVzxvYGW3rBQjDIasxp_0unR6Uv';

// Beta
export const codePushStagingDeploymentKey =
  'qz2Zzfu5yraF49iFMS519-g5HOM04fVraZQ9-';

export const otaCodePushAutoUpdate = (env) => {
  let deploymentKey = '';
  switch (env || 'production') {
    case 'staging':
      deploymentKey = codePushStagingDeploymentKey;
      break;
    default:
      deploymentKey = codePushProductionDeploymentKey;
  }
  logger.info(
    `Check for update using deploymentKey for ${(
      env || 'production'
    ).toUpperCase()}`,
  );
  CodePush.getUpdateMetadata().then((localPackage) => {
    if (localPackage) {
      const packageInfo = {
        label: localPackage.label,
        appVersion: localPackage.appVersion,
        description: localPackage.description,
      };
      logger.info(`LocalPackage: ${JSON.stringify(packageInfo)}`);
    }
  });
  CodePush.checkForUpdate(deploymentKey).then((remotePackage) => {
    if (remotePackage) {
      const packageInfo = {
        label: remotePackage.label,
        appVersion: remotePackage.appVersion,
        description: remotePackage.description,
      };
      logger.info(`RemotePackage: ${JSON.stringify(packageInfo)}`);
    } else {
      logger.info('No update available');
    }
  });
  CodePush.sync({
    deploymentKey,
    updateDialog: {
      appendReleaseDescription: true,
      descriptionPrefix: '\n\nChange description:',
    },
    installMode: CodePush.InstallMode.IMMEDIATE,
    mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE,
  })
    .then((status) => {
      let message = '';
      switch (status) {
        case CodePush.SyncStatus.UP_TO_DATE:
          message = 'Up-to-date.';
          break;
        case CodePush.SyncStatus.UPDATE_INSTALLED:
          message = 'Update installed.';
          break;
        case CodePush.SyncStatus.UPDATE_IGNORED:
          message = 'Update ignored.';
          break;
        case CodePush.SyncStatus.UNKNOWN_ERROR:
          message = 'Unknown error.';
          break;
        case CodePush.SyncStatus.SYNC_IN_PROGRESS:
          message = 'Sync in progress.';
          break;
        case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
          message = 'Checking for updates.';
          break;
        case CodePush.SyncStatus.AWAITING_USER_ACTION:
          message = 'Awaiting user action.';
          break;
        case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
          message = 'Downloading package.';
          break;
        case CodePush.SyncStatus.INSTALLING_UPDATE:
          message = 'Installing update.';
          break;
        default:
          message = `Default SyncStatus: ${JSON.stringify(status)}`;
      }
      logger.info(message);
    })
    .catch((error) => {
      logger.error(
        `Error while forcing an app update - ${JSON.stringify(error)}`,
      );
    });
};

export const baseAutoUpdate = async () => {
  const meta = {};
  try {
    logger.info(`Downloading metadata from ${appMetaV2Url}`);
    const response = await fetch(appMetaV2Url, {
      headers: {
        'Content-Type': 'application/json',
        // 'Accept-Encoding': 'gzip, deflate, br',
        Accept: 'application/json',
      },
    });
    if (response.status === 200) {
      const data = await response.json();
      // console.log(data);

      const {
        version: {latest},
        baseVersionDownloadLink,
      } = data;

      if (baseVersion < latest) {
        logger.info('New version detected.');
        const versionFingerprint = `${latest}`;
        console.log(`Version fingerprint: ${versionFingerprint}`);
        const downloadLink = baseVersionDownloadLink[versionFingerprint];
        if (downloadLink.length > 0) {
          logger.info(`New APK download link: ${downloadLink}`);
          console.log(`New APK download link: ${downloadLink}`);

          const tsgoApkFilename = `TimberSmartGo_v${latest}${versionFingerprint}.apk`;
          const filePath = `${RNFS.ExternalDirectoryPath}/${tsgoApkFilename}`;
          const download = RNFS.downloadFile({
            fromUrl: downloadLink,
            toFile: filePath,
            progress: (res) => {
              console.log((res.bytesWritten / res.contentLength).toFixed(2));
            },
            progressDivider: 1,
          });

          download.promise.then((result) => {
            if (result.statusCode === 200) {
              console.log('Download complete. Installing...');
              logger.info('Download complete. Installing...');
              //RNApkInstallerN.install(filePath);
            }
          });
        }
      }
    } else {
      const error = `Unable to download metadata from server (${response.status}). Skip auto update.`;
      logger.warn(error);
      console.warn(error);
    }
  } catch (err) {
    logger.error(err);
  }
};
