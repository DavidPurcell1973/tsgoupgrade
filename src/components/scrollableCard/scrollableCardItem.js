import React, {Component} from 'react';
import {has, isString} from 'lodash';
import {Text, TouchableOpacity, TouchableHighlight, View, Alert} from 'react-native';
import PropTypes from 'prop-types';
import {Divider} from 'react-native-elements';
import Swipeable from 'react-native-swipeable';
import styles from './scrollableCardStyles';
import {union} from 'lodash';

class ScrollableCardItem extends Component {
  defaultHiddenItems = ['id', 'swipeableRightButtons'];

  render() {
    const {
      item,
      navigation,
      nextScreen,
      hiddenItem,
      defaultHideEmptyOrNull,
      enableHighlightItem,
      highlightItemPropName,
    } = this.props;

    const highlightItem = item[highlightItemPropName] || false;

    const rowContent = (
      <>
        <TouchableOpacity
          style={styles.cardRowInnerContainerStyle}
          onPress={() => {
            //alert(JSON.stringify(item))
            if (isString(nextScreen) && nextScreen.length > 0) {
              
              navigation.navigate(nextScreen, item);
            } else {
              console.warn('Is nextScreen or navigation undefined?');
            }
          }}>
          <View
            style={[styles.cardRowStyle].concat(
              enableHighlightItem && highlightItem
                ? styles.highlightItemStyle
                : [],
            )}>
            {Object.entries(item)
              .filter(
                (e) =>
                  defaultHideEmptyOrNull &&
                  hiddenItem !== null &&
                  hiddenItem !== undefined &&
                  !union(this.defaultHiddenItems, hiddenItem).includes(e[0]), // Include the default items to be excluded
              )
              .map((e) => {
                // Convert e[1] to string before evaluating its length
                if (e[1] != null && e[1].toString().length > 0) {
                  return (
                    <View key={e[0]} style={styles.cardRowItemContainerStyle}>
                      <Text style={styles.cardRowItemValueStyle}>{e[1]}</Text>
                      <Text style={styles.cardRowItemTitleStyle}>{e[0]}</Text>
                    </View>
                  );
                }
              })}
          </View>
        </TouchableOpacity>
        <Divider
          style={{
            backgroundColor: '#3498db',
            height: 1.5,
            marginTop: 4,
          }}
        />
      </>
    );

    return (
      <View key={`${item.id}`} style={styles.cardRowContainerStyle}>
        {has(item, 'swipeableRightButtons') > 0 ? (
          <Swipeable
            rightButtons={item.swipeableRightButtons.map((e) => (
              <TouchableHighlight style={e[0]} onPress={e[1]}>
                <Text>{e[2]}</Text>
              </TouchableHighlight>
            ))}
            rightButtonWidth={100}>
            {rowContent}
          </Swipeable>
        ) : (
          rowContent
        )}
      </View>
    );
  }
}

ScrollableCardItem.defaultProps = {
  defaultHideEmptyOrNull: true,
};

ScrollableCardItem.propTypes = {
  item: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  nextScreen: PropTypes.string.isRequired,
  defaultHideEmptyOrNull: PropTypes.bool,
};

export default ScrollableCardItem;
