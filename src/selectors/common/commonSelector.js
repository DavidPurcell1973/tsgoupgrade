import url from 'url';
import {getEnvStringOrDefault} from '../../helpers/utils';
import logger from '../../helpers/logger';

export const currentUserSelector = (state) => {
  const {isAuthenticated} = state.appStore;
  const username = state.appStore.username || null;
  return isAuthenticated ? username : null;
};

export const apiTokenSelector = (state) => state.appStore.token;

export const apiUrlSelector = (state) => {
  const parsedUrl = url.parse(
    state.appStore.selectedSiteEndpoint || state.appStore.apiUrl,
  );
  // const getSiteUrl = async () => {
  //   const siteUrl = await getEnvStringOrDefault('SITE_URL');
  //   // logger.debug(`API URL (redux-store): ${state.appStore.selectedSiteEndpoint}`);
  //   // logger.debug(`API URL (local-storage): ${siteUrl}`);
  // };
  // getSiteUrl().done();
  const _url = `${parsedUrl.protocol}//${
    (parsedUrl.auth && `${parsedUrl.auth}@`) || ''
  }${parsedUrl.host}`;
  // logger.debug(`Selected apiUrl: ${JSON.stringify(_url)}`);
  return _url;
};

export const getUserAppConfigValueSelector = (
  state,
  appName,
  parameterName,
) => {
  //logger.debug('User App Configs: ' + JSON.stringify(state.appStore.userAppConfigs));
  //logger.debug('User App Configs Param: ' + appName);
  //logger.debug('User App Configs Param: ' + parameterName);
  if (    
    state.appStore.userAppConfigs.filter((e) => e.app === appName).length > 0
  ) {
    return state.appStore.userAppConfigs.filter((e) => e.app === appName)[0][
      parameterName
    ];;
  }
  return null;
};
