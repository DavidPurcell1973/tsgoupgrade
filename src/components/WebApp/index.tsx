import {WebView} from 'react-native-webview';
import {useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import * as React from 'react';
import {Overlay} from 'react-native-elements';
import styles from './WebAppStyles';
import {
  setWebAppFullScreen,
  setShowWebApp,
} from '../../reducers/app/appStoreReducer';
import {useDispatch} from 'react-redux';
import {ActivityIndicator, Button, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import logger from '../../helpers/logger';

const WebApp = () => {
  const webViewRef = useRef();
  const {appStore} = useSelector((state) => state);
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [showFloatingButtons, setShowFloatingButtons] = useState(false);
  const [autoHideTimeout, setAutoHideTimeout] = useState(5000);
  const {shouldWebAppRefresh, isAuthenticated, webAppUrl, isWebAppFullScreen} =
    appStore;

  useEffect(() => {
    if (shouldWebAppRefresh) {
      // dispatch(setWebAppFullScreen(false));
      if (webViewRef.current) webViewRef.current?.reload();
      // dispatch(setWebAppRefresh(false));
    }
  }, [shouldWebAppRefresh]);

  const backActionHandler = () => {
    if (webViewRef.current) {
      dispatch(setWebAppFullScreen(false));
      webViewRef.current.goBack();
      return true;
    }
    return false;
  };

  // useEffect(() => {
  //   if (isWebAppFullScreen) {
  //     BackHandler.addEventListener('hardwareBackPress', backActionHandler);
  //
  //     return () => {
  //       BackHandler.removeEventListener('hardwareBackPress', backActionHandler);
  //     };
  //   }
  // }, [isWebAppFullScreen]);

  useEffect(() => {
    if (route.name === 'WebAppWebView') {
      dispatch(setShowWebApp(true));
      // BackHandler.addEventListener('hardwareBackPress', backActionHandler);

      return () => {
        dispatch(setShowWebApp(false));
        // BackHandler.removeEventListener('hardwareBackPress', backActionHandler);
      };
    }
  }, []);

  return (
    <>
      {isWebAppFullScreen ? (
        <Overlay
          onBackdropPress={() =>
            dispatch(setWebAppFullScreen(!isWebAppFullScreen))
          }
          overlayStyle={styles.container}
          isVisible>
          <WebView
            ref={webViewRef}
            allow
            cacheEnabled={true}
            originWhitelist={['*']}
            source={{uri: webAppUrl}}
            style={styles.webview}
            pullToRefreshEnabled={true}
            geolocationEnabled={true}
            userAgent="tsgo-webview"
            startInLoadingState={true}
            onRenderProcessGone={(syntheticEvent) => {
              const {nativeEvent} = syntheticEvent;
              console.log('RenderProcessGone');
              logger.warn('WebView Crashed: ', nativeEvent.didCrash);
            }}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  animating={true}
                  color="#84888d"
                  size="large"
                  hidesWhenStopped={true}
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 30,
                    flex: 1,
                  }}
                />
              </View>
            )}
            onLoad={(syntheticEvent) => {
              const {nativeEvent} = syntheticEvent;
              console.log('OnLoad');
              setShowFloatingButtons(false);
            }}
            onHttpError={(syntheticEvent) => {
              const {nativeEvent} = syntheticEvent;
              console.log('HttpError');
              logger.warn(
                'WebView received error status code: ',
                nativeEvent.statusCode,
              );
              setShowFloatingButtons(true);
            }}
            onError={(syntheticEvent) => {
              console.log('GenericError');
              const {nativeEvent} = syntheticEvent;
              logger.warn('WebView error: ', nativeEvent);
              setShowFloatingButtons(true);
            }}
            renderError={(e) => {
              console.log('RenderError');
              //Renders this view while resolving the error
              return (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    animating={true}
                    color="#84888d"
                    size="large"
                    hidesWhenStopped={true}
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 30,
                      flex: 1,
                    }}
                  />
                </View>
              );
            }}
          />
          {showFloatingButtons ? (
            <View style={styles.floatingButtons}>
              <View style={{flexDirection: 'row'}}>
                {isAuthenticated ? (
                  <View style={styles.buttonContainer}>
                    <Button
                      onPress={() => {
                        setTimeout(() => {
                          setShowFloatingButtons(false);
                        }, autoHideTimeout);
                        dispatch(setWebAppFullScreen(false));
                      }}
                      title="Minimize"
                    />
                  </View>
                ) : (
                  <View style={styles.buttonContainer}>
                    <Button
                      onPress={() => {
                        setTimeout(() => {
                          setShowFloatingButtons(false);
                        }, autoHideTimeout);
                        navigation.navigate('SignIn');
                      }}
                      title="Close"
                    />
                  </View>
                )}
                <View style={styles.buttonContainer}>
                  <Button
                    onPress={() => {
                      setTimeout(() => {
                        setShowFloatingButtons(false);
                      }, autoHideTimeout);
                      webViewRef.current?.reload();
                    }}
                    title="Refresh"
                  />
                </View>
                <View style={styles.buttonContainer}>
                  <Button
                    onPress={() => {
                      setTimeout(() => {
                        setShowFloatingButtons(false);
                      }, autoHideTimeout);
                      webViewRef.current?.goBack();
                    }}
                    title="Back"
                  />
                </View>
              </View>
            </View>
          ) : null}
        </Overlay>
      ) : (
        <WebView
          ref={webViewRef}
          allow
          cacheEnabled={true}
          originWhitelist={['*']}
          source={{uri: webAppUrl}}
        />
      )}
    </>
  );
};

export default WebApp;
