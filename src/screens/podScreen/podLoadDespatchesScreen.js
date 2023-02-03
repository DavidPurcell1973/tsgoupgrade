import React from 'react';
import {Button, FlatList, View} from 'react-native';
import {connect, shallowEqual, useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {Input, Text} from 'react-native-elements';
import {useNavigation} from '@react-navigation/native';
import styles from './podStyles';
import {getLoads, rehydrateLoads} from '../../reducers/pod/podReducer';
import {getLoadDespatches} from '../../selectors/pod/podSelector';
import ScrollableCard from '../../components/scrollableCard/scrollableCard';
import {apiUrlSelector} from '../../selectors/common/commonSelector';

const PODLoadDespatchesScreen = (props) => {
  const {appStore, podStore} = useSelector((state) => state);
  const {token: apiToken} = appStore;
  const loadDespatches = useSelector((state) =>
    getLoadDespatches(state, props),
  );
  const {refreshing} = podStore;
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {
    route: {
      params: {id: loadId},
    },
  } = props;

  const onChangeText = (text) => {
    // const {updateUserInput: _updateUserInput} = this.props;
    // _updateUserInput(text);
  };

  const onSubmit = () => {
    // const {
  };

  const getLoadsAsync = async () => {
    dispatch(getLoads(apiUrl, apiToken));
  };

  return (
    <View style={styles.container}>
      <Text h3 style={styles.textCenter}>
        Customer Drops
      </Text>
      <Text h3 style={styles.textCenter}>
        {loadId ? `Load: ${loadId}` : 'Loading...'}
      </Text>
      {loadDespatches.length > 0 ? (
        <ScrollableCard
          data={loadDespatches.map((e) => ({
            id: `${e.loadId} ${e.customerName}`,
            despatchId: e.despatchId,
            'Docket#': e.despatchId,
            Priority: e.priority,
            Packs: e.packs,
            Cube: e.cube,
            loadId: e.loadId,
            Customer: e.customerName,
            'Delivery Address':
              e.delivertoAddress1.trim() +
              (e.delivertoAddress2 ? `, ${e.delivertoAddress2.trim()}` : '') +
              (e.delivertoCity ? `, ${e.delivertoCity.trim()}` : '') +
              (e.deliverToPostCode ? ` ${e.deliverToPostCode.trim()}` : ''),
            'Delivery Instructions': e.deliveryNotes,
            'Captured?': e.hasSignature ? 'Yes' : 'No',
            'Sent?': e.isComplete ? 'Yes' : 'No',
          }))}
          hiddenItem={['despatchId', 'loadId']}
          nextScreen="PODDespatchReviewScreen"
          onRefresh={() => {}}
          refreshing={refreshing}
          navigation={navigation}
        />
      ) : null}
      <Button
        style={styles.button}
        title="Back"
        onPress={() => {
          navigation.pop();
        }}
      />
    </View>
  );
};

// const mapStateToProps = (store, ownProps) => ({
// });

export default PODLoadDespatchesScreen;
