import React from 'react';
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import {Divider} from 'react-native-elements';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import {Alert} from 'react-native';
import {doLogout, logout} from '../../reducers/app/appStoreReducer';
import store from '../../store/configureStore';
import styles, {colors} from './drawerStyles';

export const getNavigationOptions = (title, backgroundColor, color) => ({
  title,
  headerTitle: title,
  headerStyle: {
    backgroundColor,
  },
  headerTitleStyle: {
    color,
  },
  headerTintColor: color,
});

export const getDrawerIcon = (iconName, tintColor, style, iconSize) => {
  if (style && style === 'FontAwesome') {
    return (
      <IconFontAwesome
        name={iconName}
        size={iconSize || 20}
        style={{
          // marginRight: 30,
          width: 25,
          // borderColor: 'red',
          // borderWidth: 1,
        }}
        color={tintColor}
      />
    );
  }

  return (
    <IconFontAwesome5
      name={iconName}
      size={iconSize || 20}
      style={{
        // marginRight: 30,
        width: 25,
        // borderColor: 'red',
        // borderWidth: 1
      }}
      color={tintColor}
    />
  );
};

export const getNavigationOptionsWithAction = (
  title,
  backgroundColor,
  color,
  headerLeft,
) => ({
  title,
  headerStyle: {
    backgroundColor,
  },
  headerTitleStyle: {
    color,
  },
  headerTintColor: color,
  headerLeft,
});

export const getAppNavigationOptions = (
  title,
  backgroundColor,
  titleColor,
  drawerIcon,
) => ({
  title,
  headerTitle: title,
  headerStyle: {
    backgroundColor,
  },
  headerTitleStyle: {
    color: titleColor,
  },
  headerTintColor: titleColor,
  drawerLabel: title,
  drawerIcon,
  // headerMode: 'screen',
  headerShown: true,
  animationEnabled: true,
});

export const getDrawerNavigationOptions = (
  title,
  backgroundColor,
  titleColor,
  drawerIcon,
) => ({
  title,
  headerTitle: title,
  headerStyle: {
    backgroundColor,
  },
  headerTitleStyle: {
    color: titleColor,
  },
  // cardStyle: {backgroundColor: 'red'},
  headerTintColor: titleColor,
  drawerLabel: title,
  drawerIcon,
  headerMode: 'screen',
  headerShown: false,
  animationEnabled: true,
});

export const CustomDrawerContent = (props) => (
  <DrawerContentScrollView {...props}>
    <DrawerItemList {...props} />
    <Divider />
    <DrawerItem
      label="Sign Out"
      icon={({focused, color, size}) => (
        <IconFontAwesome size={size || 25} name="sign-out" />
      )}
      labelStyle={styles.drawerLabelStyle}
      onPress={() => {
        Alert.alert(
          'Sign Out',
          'Do you want to sign out?',
          [
            {
              text: 'Cancel',
              onPress: () => null,
            },
            {
              text: 'Confirm',
              onPress: () => {
                store.dispatch(doLogout());
              },
            },
          ],
          {cancelable: false},
        );
      }}
    />
  </DrawerContentScrollView>
);
