import React, {useEffect, useState} from 'react';
import {union, isEmpty, has} from 'lodash';
import {Text, TouchableOpacity, TouchableHighlight, View} from 'react-native';
import {Icon, Divider} from 'react-native-elements';
import {useNavigation} from '@react-navigation/native';
import Swipeable from 'react-native-swipeable';
import styles from './scrollableCardStyles';

const ScrollableCardItemWithCompactView = (props) => {
  const navigation = useNavigation();
  const {
    item,
    nextScreen,
    hiddenItem,
    defaultHideEmptyOrNull = true,
    enableHighlightItem,
    highlightItemPropName,
    compactFields = [],
    styles: extraStyles = {},
  } = props;

  const [isCompact, setIsCompact] = useState(true);
  const defaultHiddenItems = ['id', 'swipeableRightButtons'];
  const highlightItem = item[highlightItemPropName] || false;
  const defaultAutoCollapseCompactRowSeconds = 5000;

  useEffect(() => {
    if (!isCompact)
      setTimeout(() => {
        setIsCompact(true);
      }, defaultAutoCollapseCompactRowSeconds);
  }, [isCompact]);

  const rowContent = (
    <View style={styles.flexColumn}>
      <View style={styles.flexRow}>
        <>
          <View
            style={[styles.cardRowStyle].concat(
              enableHighlightItem && highlightItem
                ? styles.highlightItemStyle
                : [],
            )}>
            <TouchableOpacity
              style={styles.cardRowInnerContainerStyle}
              onPress={() => {
                setIsCompact(!isCompact);
              }}>
              {isCompact &&
                !isEmpty(item) &&
                Object.entries(item)
                  .filter(
                    (e) =>
                      defaultHideEmptyOrNull &&
                      !union(defaultHiddenItems, hiddenItem).includes(e[0]), // Include the default items to be excluded
                  )
                  .map((e) => {
                    // console.log(compactFields);
                    // console.log(compactFields.includes(e[0]));
                    // Convert e[1] to string before evaluating its length
                    if (
                      e[1] != null &&
                      e[1].toString().length > 0 &&
                      compactFields.includes(e[0])
                    ) {
                      return (
                        <View
                          key={e[0]}
                          style={[
                            styles.cardRowItemContainerStyle,
                            extraStyles.rowItem,
                          ]}>
                          <Text style={styles.cardRowItemValueStyle}>
                            {e[1]}
                          </Text>
                          <Text style={styles.cardRowItemTitleStyle}>
                            {e[0]}
                          </Text>
                        </View>
                      );
                    }
                    // return <></>;
                  })}
              {!isCompact &&
                !isEmpty(item) &&
                Object.entries(item)
                  .filter(
                    (e) =>
                      defaultHideEmptyOrNull &&
                      !union(defaultHiddenItems, hiddenItem).includes(e[0]), // Include the default items to be excluded
                  )
                  .map((e) => {
                    // Convert e[1] to string before evaluating its length
                    if (e[1] != null && e[1].toString().length > 0) {
                      return (
                        <View
                          key={e[0]}
                          style={styles.cardRowItemContainerStyle}>
                          <Text style={styles.cardRowItemValueStyle}>
                            {e[1]}
                          </Text>
                          <Text style={styles.cardRowItemTitleStyle}>
                            {e[0]}
                          </Text>
                        </View>
                      );
                    }
                    // return <></>;
                  })}
            </TouchableOpacity>
          </View>
          {nextScreen ? (
            <View style={styles.arrow}>
              <TouchableOpacity
                style={styles.cardRowInnerContainerStyle}
                onPress={() => {
                  setIsCompact(true);
                  navigation.navigate(nextScreen, item);
                }}>
                <Icon name="chevron-right" size={40} />
              </TouchableOpacity>
            </View>
          ) : null}
        </>
      </View>
      <Divider
        style={{
          backgroundColor: '#3498db',
          height: 1.5,
          marginTop: 4,
        }}
      />
    </View>
  );

  return (
    <View key={`${item.id}`} style={styles.cardRowContainerStyle}>
      {has(item, 'swipeableRightButtons') > 0 ? (
        <Swipeable
          rightButtons={item.swipeableRightButtons.map((e) => (
            <TouchableHighlight key={e[0]} style={e[0]} onPress={e[1]}>
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
};

// ScrollableCardItemWithCompactView.defaultProps = {
//   defaultHideEmptyOrNull: true,
// };
//
// ScrollableCardItemWithCompactView.propTypes = {
//   item: PropTypes.object.isRequired,
//   navigation: PropTypes.object.isRequired,
//   nextScreen: PropTypes.string.isRequired,
//   defaultHideEmptyOrNull: PropTypes.bool,
// };

export default ScrollableCardItemWithCompactView;
