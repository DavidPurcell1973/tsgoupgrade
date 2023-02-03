import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/lib/integration/react';
import {ActivityIndicator, StatusBar, View} from 'react-native';
import store, {persistor} from './store/configureStore';
import App from './app';
import styles from './styles/styles';
import {Provider as PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';

const Main = () => (
  <Provider store={store}>
    <PersistGate
      loading={
        <View style={styles.loginLoadingContainer}>
          <ActivityIndicator />
          <StatusBar barStyle="dark-content" />
        </View>
      }
      persistor={persistor}>
      <PaperProvider>
        <SafeAreaProvider>
          <App />
        </SafeAreaProvider>
      </PaperProvider>
    </PersistGate>
  </Provider>
);

export default Main;
