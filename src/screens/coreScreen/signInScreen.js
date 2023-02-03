import React, {useRef, useEffect, useState} from 'react';
import {View, Image, StatusBar} from 'react-native';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Button, Input, Text} from 'react-native-elements';
import {useNavigation} from '@react-navigation/native';
import styles, {colors} from './signInScreenStyles';
import {baseAutoUpdate} from '../../helpers/autoUpdate';
import {
  updateUser,
  updatePassword,
  updateCurrentUser,
  setShowWebApp,
  setWebAppFullScreen,
} from '../../reducers/app/appStoreReducer';
import {apiUrlSelector} from '../../selectors/common/commonSelector';
import {displayToast} from '../../helpers/utils';
import DrawerItem from '../../components/drawer/drawerItem';
import {version} from '../../../package.json';
import logger from '../../helpers/logger';
import GetVersionString from '../../helpers/version';

export const signInScreenOptions = {
  // title: 'Sign In',
  headerShown: true,
  animationEnabled: false,
  headerLeft: () => <DrawerItem iconName="bars" onPress={() => {}} />,
};

const SignInScreen = () => {
  const {appStore} = useSelector((state) => state);
  const {isWebAppEnabled, isWebAppPrioritised, username, password} = appStore;
  const passwordRef = useRef();
  const [hideLogo, setHideLogo] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigation = useNavigation();
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const dispatch = useDispatch();

  useEffect(() => {
    // (async () => {
    //   await baseAutoUpdate();
    // })();
  }, []);

  const login = async () => {
    try {
      const user = {username, password};
      const url = `${apiUrl}/api/Auth`;
      logger.debug(`Authenticating using ${url}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      const json = await response.json();
      if (json.token && json.token.length > 0) {
        dispatch(
          updateCurrentUser({
            username,
            password,
            newToken: json.token,
            newRefreshToken: json.refreshToken,
            newTokenExpireAt: json.tokenExpireAt,
            tokenExpiryMinutes: json.tokenExpiryMinutes,
          }),
        );
        displayToast('Logged in successfully');
      } else 
      {
        //alert('Invalid credentials');
        displayToast('Invalid credentials');
      }
    } catch (error) {
      displayToast('Unable to sign in');
      logger.error(error);
    }
    // doAuthenticateUser(apiUrl, username, password);
  };

  const goToSettings = () => {
    navigation.navigate('Settings');
  };

  const goToOfflineQueue = () => {
    navigation.navigate('OfflineQueue');
  };

  const doUpdateUser = (_username) => {
    dispatch(updateUser(_username));
  };

  const doUpdatePassword = (_password) => {
    dispatch(updatePassword(_password));
  };

  const shouldRestoreLogo = () => {
    setTimeout(() => {
      if (!isEditing && !hideLogo) {
        setHideLogo(false);
      }
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
      {!hideLogo ? (
        <Image
          style={styles.logoStyle}
          /* eslint-disable global-require */
          source={require('../../assets/tslogo.png')}
          /* eslint-enable global-require */
          containerStyle={styles.inputContainerStyle}
        />
      ) : null}
      {!isWebAppPrioritised ? (
        <>
          <Input
            placeholder="Enter your username"
            onChangeText={(text) => doUpdateUser(text)}
            onSubmitEditing={() => passwordRef.current?.focus()}
            returnKeyType="next"
            defaultValue={username}
            leftIcon={{type: 'font-awesome', name: 'user', size: 20}}
            inputStyle={styles.input}
            textContentType="username"
            containerStyle={styles.inputContainerStyle}
            autoCapitalize="none"
            blurOnSubmit={false}
            onFocus={() => {
              setIsEditing(true);
              setHideLogo(true);
            }}
            onBlur={() => {
              setIsEditing(false);
              shouldRestoreLogo();
            }}
            autoCompleteType="username"
            // onBlur={Keyboard.dismiss()}
          />
          <Input
            ref={passwordRef}
            placeholder="Enter your password"
            onChangeText={(text) => doUpdatePassword(text)}
            defaultValue={password}
            onSubmitEditing={() => {
              login();
              setIsEditing(false);
              shouldRestoreLogo();
            }}
            textContentType="newPassword"
            autoCompleteType="password"
            secureTextEntry
            leftIcon={{type: 'font-awesome', name: 'key', size: 15}}
            inputStyle={styles.input}
            containerStyle={styles.inputContainerStyle}
            onFocus={() => {
              setIsEditing(true);
              setHideLogo(true);
            }}
            onBlur={() => {
              setIsEditing(false);
              shouldRestoreLogo();
            }}
            // onBlur={Keyboard.dismiss()}
          />
        </>
      ) : null}
      <View style={{flex: 1, justifyContent: 'center', flexDirection: 'row'}}>
        {!isWebAppPrioritised ? (
          <Button
            icon={{
              color: 'white',
              name: 'sign-in',
              type: 'font-awesome',
              marginRight: 5,
            }}
            title="Sign In"
            // raised
            onPress={() => login()}
            buttonStyle={[styles.loginButtonStyle, {marginTop: 10, width: 125}]}
            containerStyle={styles.buttonContainerStyle}
            // containerViewStyle={styles.buttonContainerStyle}
            // backgroundColor={colors.primary}
          />
        ) : null}
        {isWebAppEnabled ? (
          <Button
            icon={{
              color: 'white',
              name: 'internet-explorer',
              type: 'font-awesome',
              marginRight: 5,
            }}
            title="OPEN WEBAPP"
            // raised
            onPress={() => {
              dispatch(setWebAppFullScreen(true));
              navigation.navigate('WebApp');
            }}
            buttonStyle={[styles.loginButtonStyle, {marginTop: 10}]}
            containerStyle={styles.buttonContainerStyle}
            // containerViewStyle={styles.buttonContainerStyle}
            // backgroundColor={colors.primary}
          />
        ) : null}
      </View>
      <View style={styles.bottomButtonsStyle}>
        <Button
          icon={{marginRight: 10, name: 'gear', type: 'font-awesome'}}
          title="Settings"
          type="clear"
          buttonStyle={styles.optionsButtonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={() => goToSettings()}
        />
        <Button
          icon={{marginRight: 10, name: 'bars', type: 'font-awesome'}}
          title="Offline Queue"
          type="clear"
          buttonStyle={styles.optionsButtonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={() => goToOfflineQueue()}
        />
      </View>
      <Text style={{marginTop: 10, marginBottom: 10, textAlign: 'center'}}>
        {GetVersionString(version)} © TimberSmart {new Date().getFullYear()}
      </Text>
    </View>
  );
};

export default SignInScreen;
