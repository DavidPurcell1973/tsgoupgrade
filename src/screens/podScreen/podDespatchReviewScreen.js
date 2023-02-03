import React, {Component, useMemo} from 'react';
import {View} from 'react-native';
import {connect, shallowEqual, useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {Button} from 'react-native-elements';
import styles from './podStyles';
import {
  getOrderComments,
  getOrderPhotos,
  getOrderReceivedBy,
  getOrderReceivedOn,
  getOrderSentStatus,
  getOrderSignature,
} from '../../selectors/pod/podSelector';
import TwoColumnsDataGrid from '../../components/twoColumnsDataGrid';
import {
  apiUrlSelector,
  getUserAppConfigValueSelector,
  apiTokenSelector,
} from '../../selectors/common/commonSelector';
import {useNavigation} from '@react-navigation/native';
import {every, find} from 'lodash';

const PODDespatchReviewScreen = (props) => {
  const {
    loadId,
    'Delivery Instructions': deliveryInstructions,
    'Delivery Address': deliveryAddress,
    despatchId,
  } = props.route.params;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const apiToken = useSelector(apiTokenSelector, shallowEqual);
  const {appStore, podStore} = useSelector((state) => state);
  const {username} = appStore;
  const {loads, photos, signatures} = podStore;
  const memoizedPhotos = useMemo(() => {
    const allPhotos = photos.filter(
      (e) => e.despatchId === despatchId && e.loadId === loadId,
    );
    // console.log(allPhotos);
    return allPhotos;
  }, [photos]);
  const memoizedSignatures = useMemo(() => {
    const allSignatures = signatures.filter(
      (e) =>
        e.despatchId === despatchId &&
        e.loadId === loadId &&
        e.type === 'signature',
    );
    // console.log(allSignatures);
    return allSignatures;
  }, [signatures]);
  const memoizedIsPhotoSent = useMemo(() => {
    const isAllSent = every(memoizedPhotos, (e) => e.sent);
    return isAllSent;
  }, [memoizedPhotos]);
  const memoizedIsSignatureSent = useMemo(() => {
    const isAllSent = every(memoizedSignatures, (e) => e.sent);
    return isAllSent;
  }, [memoizedSignatures]);
  const memoizedDespatch = useMemo(() => {
    return find(
      loads,
      (e) => e.despatchId === despatchId && e.loadId === loadId,
    );
  }, [loads]);
  const {deliveryNotes, packs, customerName} = memoizedDespatch;
  const comments =
    memoizedSignatures.length > 0 ? memoizedSignatures[0].comments : '';
  const receivedOn =
    memoizedSignatures.length > 0 ? memoizedSignatures[0].receivedOn : '';
  const receivedBy =
    memoizedSignatures.length > 0 ? memoizedSignatures[0].receivedBy : '';
  const enablePhotoCapture = true;

  // const {
  //   orderPhotos,
  //   orderSignature,
  // } = this.props;

  const despatchDataWithPhoto = {
    despatchId,
    customerName,
    deliveryAddress,
    packs,
    deliveryInstructions,
    receivedBy,
    receivedOn,
    comments,
    signature:
      memoizedSignatures && memoizedSignatures.length > 0
        ? `Yes ${
            memoizedIsSignatureSent ? '- Sent to server' : '- Pending upload'
          }`
        : 'No',
    photos:
      memoizedPhotos && memoizedPhotos.length > 0
        ? `Yes ${memoizedIsPhotoSent ? '- Sent to server' : '- Pending upload'}`
        : 'No',
  };

  const despatchHeaders = [
    {accessor: 'customerName', label: 'Customer'},
    {accessor: 'packs', label: 'Packs'},
    {accessor: 'deliveryAddress', label: 'Delivery To'},
    {accessor: 'deliveryInstructions', label: 'Instruction'},
    {accessor: 'receivedBy', label: 'Received By'},
    {accessor: 'receivedOn', label: 'Received On'},
    {accessor: 'comments', label: 'Comments'},
    {accessor: 'signature', label: 'Signature?'},
    {accessor: 'photos', label: 'Photo?'},
  ];

  return (
    <View style={styles.container}>
      <TwoColumnsDataGrid
        title={`Despatch ${despatchId}`}
        headers={despatchHeaders}
        data={
          enablePhotoCapture ? despatchDataWithPhoto : despatchDataWithPhoto
        }
      />
      <Button
        buttonStyle={{height: 70, width: '100%'}}
        containerStyle={styles.buttonContainerStyle}
        title="CAPTURE SIGNATURE"
        onPress={() => {
          navigation.navigate('PODCaptureSignatureScreen', {
            comments,
            receivedBy,
            loadId,
            despatchId,
          });
        }}
      />
      {enablePhotoCapture ? (
        <Button
          buttonStyle={{height: 70, width: '100%'}}
          containerStyle={styles.buttonContainerStyle}
          title="CAPTURE PHOTO"
          onPress={() => {
            navigation.navigate('PODCapturePhotoScreen', {
              comments,
              receivedBy,
              loadId,
              despatchId,
            });
          }}
        />
      ) : null}
      <Button
        buttonStyle={styles.buttonStyle}
        containerStyle={styles.buttonContainerStyle}
        title="Back"
        onPress={() => {
          navigation.pop();
        }}
      />
    </View>
  );
};

// PODDespatchReviewScreen.defaultProps = {
//   apiUrl: '',
//   apiToken: '',
//   orderSignature: {},
//   orderPhotos: [],
//   loadDespatches: [],
//   receivedOn: '',
//   receivedBy: '',
//   comments: '',
//   enablePhotoCapture: false,
// };

PODDespatchReviewScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  apiUrl: PropTypes.string,
  apiToken: PropTypes.string,
  loadDespatches: PropTypes.array,
  orderSignature: PropTypes.object,
  orderPhotos: PropTypes.array,
  memoizedSignatures: PropTypes.array,
  memoizedPhotos: PropTypes.array,
  loadId: PropTypes.number.isRequired,
  despatchId: PropTypes.number.isRequired,
  receivedOn: PropTypes.string,
  receivedBy: PropTypes.string,
  comments: PropTypes.string,
  enablePhotoCapture: PropTypes.bool,
};

// const mapStateToProps = (state, ownProps) => ({
//   apiUrl: apiUrlSelector(state),
//   loadId: ownProps.route.params.loadId,
//   apiToken: state.appStore.token,
//   customerName: ownProps.route.params.Customer,
//   deliveryAddress: ownProps.route.params['Delivery Address'],
//   orderNo: ownProps.route.params.OrderNo,
//   despatchId: ownProps.route.params.despatchId,
//   packs: ownProps.route.params.Packs,
//   deliveryInstructions: ownProps.route.params['Delivery Instructions'],
//   orderPhotos: getOrderPhotos(
//     state.podStore,
//     ownProps.route.params.loadId,
//     ownProps.route.params.despatchId,
//   ),
//   orderSignature: getOrderSignature(
//     state.podStore,
//     ownProps.route.params.loadId,
//     ownProps.route.params.despatchId,
//   ),
//   receivedOn: getOrderReceivedOn(
//     state.podStore,
//     ownProps.route.params.loadId,
//     ownProps.route.params.despatchId,
//   ),

//   receivedBy: getOrderReceivedBy(
//     state.podStore,
//     ownProps.route.params.loadId,
//     ownProps.route.params.despatchId,
//   ),
//   sent: getOrderSentStatus(
//     state.podStore,
//     ownProps.route.params.loadId,
//     ownProps.route.params.despatchId,
//   ),
//   comments: getOrderComments(
//     state.podStore,
//     ownProps.route.params.loadId,
//     ownProps.route.params.despatchId,
//   ),
//   enablePhotoCapture: getUserAppConfigValueSelector(
//     state,
//     'POD',
//     'enablePodPhotoCapture',
//   ),
// });

// const mapDispatchToProps = {};

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps,
// )(PODDespatchReviewScreen);

export default PODDespatchReviewScreen;
