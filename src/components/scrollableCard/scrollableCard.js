import React, {Component} from 'react';
import {FlatList, View} from 'react-native';
import PropTypes from 'prop-types';
import ScrollableCardItem from './scrollableCardItem';
import styles from './scrollableCardStyles';

class ScrollableCard extends Component {
  constructor(props) {
    super(props);
    const {
      navigation,
      loadListRef,
      nextScreen,
      swipeableRightButtons,
      hiddenItem,
      defaultHideEmptyOrNull,
      enableHighlightItem,
      highlightItemPropName,
    } = this.props;

    this.navigation = navigation;
    this.loadListRef = loadListRef;
    this.isFetching = false;
    this.nextScreen = nextScreen;
    this.hiddenItem = hiddenItem;
    this.swipeableRightButtons = swipeableRightButtons;
    this.defaultHideEmptyOrNull = defaultHideEmptyOrNull;
    this.enableHighlightItem = enableHighlightItem || false;
    this.highlightItemPropName = highlightItemPropName;
  }

  renderItem = item => (
    <ScrollableCardItem
      item={item.item}
      hiddenItem={this.hiddenItem}
      navigation={this.navigation}
      nextScreen={this.nextScreen}
      defaultHideEmptyOrNull={this.defaultHideEmptyOrNull}
      enableHighlightItem={this.enableHighlightItem}
      highlightItemPropName={this.highlightItemPropName}
    />
  );

  render() {
    const {data, onRefresh, refreshing} = this.props;

    if (data.length > 0) {
      return (
        <View style={styles.cardContainerStyle}>
          {onRefresh !== undefined ? (
            <FlatList
              contentContainerStyle={styles.cardInnerContainerStyle}
              data={data}
              refreshing={refreshing}
              onRefresh={onRefresh}
              ref={this.loadListRef}
              renderItem={this.renderItem}
              keyExtractor={item => `${item.id}`}
            />
          ) : (
            <FlatList
              contentContainerStyle={styles.cardInnerContainerStyle}
              data={data}
              ref={this.loadListRef}
              renderItem={this.renderItem}
              keyExtractor={item => `${item.id}`}
            />
          )}
        </View>
      );
    }
    return <View style={styles.cardContainerStyle} />;
  }
}

ScrollableCard.defaultProps = {
  data: [],
  loadListRef: null,
  nextScreen: '',
  onRefresh: () => {},
  swipeableRightButtons: [],
  refreshing: false,
  defaultHideEmptyOrNull: true,
  hiddenItem: ['id', 'swipeableRightButtons'],
};

ScrollableCard.propTypes = {
  navigation: PropTypes.object.isRequired,
  loadListRef: PropTypes.object,
  onRefresh: PropTypes.func,
  data: PropTypes.array,
  nextScreen: PropTypes.string,
  hiddenItem: PropTypes.array,
  swipeableRightButtons: PropTypes.array,
  refreshing: PropTypes.bool,
  defaultHideEmptyOrNull: PropTypes.bool,
};

export default ScrollableCard;
