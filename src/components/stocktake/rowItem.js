import React, {useRef} from 'react';
import {Text, TouchableHighlight} from 'react-native';
import {ListItem, Icon} from 'react-native-elements';
import Swipeable from 'react-native-swipeable';
import {useNavigation} from '@react-navigation/native';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import styles from '../../styles/styles';
import {deleteRowFromStocktake} from '../../reducers/stocktake/stocktakeReducer';
import {
  locationsSelector,
  rowPacksByRowNameSelector,
} from '../../selectors/stocktake/stocktakeSelector';

const RowItem = (props) => {
  const navigation = useNavigation();
  const swipeableRef = useRef();
  const dispatch = useDispatch();
  const {item} = props;
  const locations = useSelector(locationsSelector, shallowEqual);
  const rowPacks = useSelector((state) =>
    rowPacksByRowNameSelector(state, {
      route: {
        params: {
          stocktakeId: item.stocktakeId,
          rowName: item.rowName,
          locationId: item.locationId,
        },
      },
    }),
  );
  const rowLocations = locations.filter(
    (e) => e.locationId === item.locationId,
  );

  const currentLocation =
    rowLocations.length > 0
      ? rowLocations[0]
      : {branchName: 'Undefined', locationName: 'Undefined'};

  return (
    <Swipeable
      ref={swipeableRef}
      rightButtons={[
        <TouchableHighlight
          style={[styles.rightSwipeItem, {backgroundColor: '#FF0000'}]}
          onPress={() => {
            dispatch(deleteRowFromStocktake(item));
            setTimeout(() => {
              if (swipeableRef.current) swipeableRef.current.recenter();
            }, 100);
          }}>
          <Text>Delete</Text>
        </TouchableHighlight>,
      ]}>
      <ListItem
        key={item.rowName}
        onPress={() => {
          navigation.navigate('StocktakePack', item);
        }}>
        <Icon name="stack-overflow" type="font-awesome" />
        <ListItem.Content>
          <ListItem.Title>{`${item.rowName}${item.new ? ' (NEW)' : ''}${
            item.delete ? ' (DELETE)' : ''
          }${
            rowPacks.length > 0 ? ` (New: ${rowPacks.length})` : ''
          }`}</ListItem.Title>
          <ListItem.Subtitle>
            {/* <View style={styles.subtitleView}>
              <Text style={styles.subtitleText}> */}
            {`Branch: ${currentLocation.branchName} Location: ${
              currentLocation.locationName
            } Type: ${item.type.toUpperCase()}${
              item.preCount > 0 ? ' PreCount: ' + item.preCount : ''
            }`}
            {/* </Text>
            </View> */}
          </ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>
    </Swipeable>
  );
};

export default RowItem;
