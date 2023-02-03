import 'react-native-gesture-handler'; // https://github.com/software-mansion/react-native-gesture-handler/issues/320
import {AppRegistry} from 'react-native';
import Main from './src/main';
import {name as appName, version as baseVersion} from './package.json';
import logger from './src/helpers/logger';
import {commit, cpVersion} from './src/helpers/version';

// https://stackoverflow.com/questions/33997443/how-can-i-view-network-requests-for-debugging-in-react-native
// eslint-disable-next-line no-undef
// GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;

logger.info(
  `Starting TS Go ${appName} - v${
    cpVersion ? `${cpVersion} (Base: v${baseVersion})` : baseVersion
  } (${commit.slice(0, 8)})`,
);

AppRegistry.registerComponent(appName, () => Main);
