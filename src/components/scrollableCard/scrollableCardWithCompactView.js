import React, {useState} from 'react';
import {FlatList, View} from 'react-native';
import PropTypes from 'prop-types';
import {useNavigation} from '@react-navigation/native';
import ScrollableCardItem from './scrollableCardItemWithCompactView';
import styles from './scrollableCardStyles';

const ScrollableCardWithCompactView = (props) => {
  const navigation = useNavigation();
  const {
    loadListRef,
    nextScreen,
    swipeableRightButtons,
    hiddenItem,
    defaultHideEmptyOrNull,
    enableHighlightItem = false,
    highlightItemPropName,
    data,
    onRefresh,
    compactFields,
    refreshing,
    styles: extraStyles,
  } = props;

  const renderItem = (item) => (
    <ScrollableCardItem
      key={item[item.id]}
      item={item.item}
      hiddenItem={hiddenItem}
      navigation={navigation}
      nextScreen={nextScreen}
      defaultHideEmptyOrNull={defaultHideEmptyOrNull}
      enableHighlightItem={enableHighlightItem}
      highlightItemPropName={highlightItemPropName}
      compactFields={compactFields}
      styles={extraStyles}
    />
  );

  return data.length > 0 ? (
    <View style={styles.cardContainerStyle}>
      {onRefresh !== undefined ? (
        <FlatList
          contentContainerStyle={styles.cardInnerContainerStyle}
          data={data}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ref={loadListRef}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.id}`}
        />
      ) : (
        <FlatList
          contentContainerStyle={styles.cardInnerContainerStyle}
          data={data}
          ref={loadListRef}
          renderItem={renderItem}
          keyExtractor={(item) => `${item.id}`}
        />
      )}
    </View>
  ) : (
    <View style={styles.cardContainerStyle} />
  );
};

// ScrollableCardWithCompactView.defaultProps = {
//   data: [],
//   loadListRef: null,
//   nextScreen: '',
//   onRefresh: () => {},
//   swipeableRightButtons: [],
//   refreshing: false,
//   defaultHideEmptyOrNull: true,
//   hiddenItem: ['id', 'swipeableRightButtons'],
// };
//
// ScrollableCardWithCompactView.propTypes = {
//   navigation: PropTypes.object.isRequired,
//   loadListRef: PropTypes.object,
//   onRefresh: PropTypes.func,
//   data: PropTypes.array,
//   nextScreen: PropTypes.string,
//   hiddenItem: PropTypes.array,
//   swipeableRightButtons: PropTypes.array,
//   refreshing: PropTypes.bool,
//   defaultHideEmptyOrNull: PropTypes.bool,
// };

export default ScrollableCardWithCompactView;
