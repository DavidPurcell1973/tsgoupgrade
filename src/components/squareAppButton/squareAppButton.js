import {TouchableOpacity, View} from 'react-native';
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import React from 'react';
import {Title} from 'react-native-paper';
import {useDispatch} from 'react-redux';
import styles, {colors} from './squareAppButtonStyles';
import {navigate} from '../../RootNavigation';
import {toggleShowWebApp} from '../../reducers/app/appStoreReducer';

const SquareAppButton = (props) => {
  const dispatch = useDispatch();

  return (
    <View style={styles.squareButtonMainShadowContainer}>
      <View style={styles.squareButtonMainContainer}>
        <View style={styles.squareButtonContainer}>
          <TouchableOpacity
            onPress={() => {
              navigate(props.navigateToScreenName);
            }}>
            <View style={styles.innerSquareButtonContainer}>
              <IconFontAwesome5
                name={props.iconName}
                color={colors.header}
                size={50}
              />
              <Title style={styles.titleTextStyle}>{props.title}</Title>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SquareAppButton;
