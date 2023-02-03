import React from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import PropTypes from 'prop-types';
import styles from './signInScreenStyles';
import { completeLoading } from '../../reducers/app/appStoreReducer';
import store from '../../store/configureStore';

class LoadingScreen extends React.Component {
  constructor(props) {
    super(props);
    setTimeout(() => {
      store.dispatch(completeLoading());
    }, 1000);
  }

  render() {
    return (
      <View style={styles.loginLoadingContainer}>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
      </View>
    );
  }
}

LoadingScreen.defaultProps = {
  isAuthenticated: false,
  username: '',
  appToken: '',
};

LoadingScreen.propTypes = {
  isAuthenticated: PropTypes.bool,
  username: PropTypes.string,
  appToken: PropTypes.string,
};

const mapStateToProps = (store) => ({
  username: store.appStore.username,
  appToken: store.appStore.appToken,
  isAuthenticated: store.appStore.isAuthenticated,
});

const mapDispatchToProps = {};

export default LoadingScreen;
