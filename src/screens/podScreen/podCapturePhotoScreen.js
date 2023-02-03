import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, FlatList, TouchableOpacity, View} from 'react-native';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {Button, Image, Input, Overlay} from 'react-native-elements';
import fecha from 'fecha';
import {v4 as uuid} from 'uuid';
import fs from 'react-native-fs';
import Orientation from 'react-native-orientation-locker';
import styles from './podStyles';
import {
  apiUrlSelector,
  apiTokenSelector,
} from '../../selectors/common/commonSelector';
import Title from '../../components/title/title';
import PODPhotoView from './podPhotoView';
import {
  addDespatchPhoto,
  apiSendPhoto,
  deleteDespatchPhoto,
} from '../../reducers/pod/podReducer';
import PhotoItem from '../../components/pod/photoItem';
import {displayDialog, displayToast} from '../../helpers/utils';
import logger from '../../helpers/logger';
import {ensureDirectoryExists, copyFile} from '../../helpers/file';
import {useNavigation} from '@react-navigation/native';

const PODCapturePhotoScreen = (props) => {
  const dispatch = useDispatch();
  const {
    route: {
      params: {loadId, despatchId},
    },
  } = props;
  const navigation = useNavigation();
  // const receivedByInputRef = useRef();
  // const commentsInputRef = useRef();
  const cameraRef = useRef();
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const apiToken = useSelector(apiTokenSelector, shallowEqual);
  const {appStore, podStore} = useSelector((state) => state);
  const {username} = appStore;
  const photos = useSelector((state) =>
    podStore.photos.filter(
      (e) => e.loadId === loadId && e.despatchId === despatchId,
    ),
  );
  // const [commentsInput, setCommentsInput] = useState('');
  // const [receivedByInput, setReceivedByInput] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [imageUri, setImageUri] = useState('');
  const [isTakingPicture, setIsTakingPicture] = useState(false);

  // useEffect(() => {
  //   setReceivedByInput(receivedBy);
  //   setCommentsInput(comments);
  // }, []);

  const onAcceptAndUploadPhotos = () => {
    // dispatch(updateReceivedByInput(loadId, despatchId, receivedByInput));
    // dispatch(updateCommentsInput(loadId, despatchId, commentsInput));

    photos.forEach((photo) => {
      logger.info(`Photo ${photo.uri} has been queued for upload`);
      fs.readFile(photo.uri, 'base64').then((res) => {
        dispatch(
          apiSendPhoto(
            apiUrl,
            apiToken,
            loadId,
            despatchId,
            photo.fileName,
            photo.timestamp,
            username,
            '',
            photo.height,
            photo.width,
            photo.pictureOrientation,
            res,
          ),
        );
      });
    });
    displayToast(
      `${
        photos.length > 1 ? 'Photos have' : 'Photo has'
      } been queued for upload`,
      5000,
    );
  };

  const onSave = async () => {
    if (cameraRef.current && !isTakingPicture) {
      const options = {
        quality: 0.85,
        fixOrientation: true,
        forceUpOrientation: true,
      };

      setIsTakingPicture(true);

      if (cameraRef.current) {
        try {
          const data = await cameraRef.current.takePictureAsync(options);
          const fileName = `${loadId}_${despatchId}_${data.uri.replace(
            /^.*[\\\/]/,
            '',
          )}`;

          try {
            const downloadDirectoryPath = `${fs.DownloadDirectoryPath}/com.timbersmart.tsgo/podPhoto`;
            const fileFullPath = `${downloadDirectoryPath}/${fileName}`;
            await ensureDirectoryExists(downloadDirectoryPath);
            await copyFile(data.uri, fileFullPath);
          } catch (err) {
            await logger.error(err);
          }

          dispatch(
            addDespatchPhoto({
              ...data,
              loadId,
              despatchId,
              fileName,
              uuid: uuid(),
              timestamp: fecha.format(new Date(), 'YYYY-MM-DD hh:mm:ss'),
            }),
          );
          setIsTakingPicture(false);
          setModalVisible(false);
        } catch (err) {
          setIsTakingPicture(false);
        }
      }
    }
    Orientation.lockToPortrait();
  };

  const deleteAction = (photo) => {
    dispatch(deleteDespatchPhoto(photo));
  };

  const photoItemRender = ({item}) => (
    <PhotoItem
      item={item}
      setOverlayVisible={setOverlayVisible}
      setImageUri={setImageUri}
      deleteAction={deleteAction}
    />
  );

  return (
    <View style={styles.container}>
      <Title
        text={`Photo${photos.length > 0 ? 's' : ''} for Despatch ${despatchId}`}
      />
      {/* <Input
        blurOnSubmit={false}
        ref={receivedByInputRef}
        value={receivedByInput}
        onChangeText={(text) => {
          setReceivedByInput(text);
        }}
        label="Received By"
        placeholder="John Doe"
        placeholderTextColor="gray"
      />
      <Input
        blurOnSubmit={false}
        label="Comments"
        ref={commentsInputRef}
        value={commentsInput}
        onChangeText={(text) => {
          setCommentsInput(text);
          // onCommentsChangeText(loadId, despatchId, text);
        }}
        placeholder="(Optional)"
        placeholderTextColor="gray"
      /> */}
      <Button
        buttonStyle={{height: 50, width: '100%'}}
        containerStyle={styles.buttonContainerStyle}
        title="Add New Photo"
        onPress={() => {
          setModalVisible(true);
        }}
      />

      <Overlay isVisible={overlayVisible && imageUri.length > 0}>
        <TouchableOpacity onPress={() => setOverlayVisible(false)}>
          <Image
            source={{uri: imageUri}}
            // source={{
            //   uri: 'https://boho-box.com/storage/upload/product/IMG_1696_1609848185.jpg',
            // }}
            resizeMethod="auto"
            resizeMode="center"
            // containerStyle={{width: '50%', height: '50%'}}
            style={{
              width: Dimensions.get('window').width - 50,
              height: Dimensions.get('window').height - 100,
              // width: '100%',
              // height: '100%',
              minWidth: 100,
              minHeight: 100,
            }}
            // style={{width: 90, height: 90}}
          />
        </TouchableOpacity>
      </Overlay>
      <FlatList
        data={photos}
        renderItem={photoItemRender}
        keyExtractor={(e) => e.uri}
      />
      <PODPhotoView
        cameraRef={cameraRef}
        onSave={onSave}
        setVisible={setModalVisible}
        visible={modalVisible}
      />
      <Button
        buttonStyle={{height: 50, width: '100%'}}
        containerStyle={styles.buttonContainerStyle}
        title={`ACCEPT & UPLOAD PHOTO${photos.length > 0 ? 'S' : ''}`}
        onPress={() => {
          if (photos.length > 0) {
            onAcceptAndUploadPhotos();
            navigation.pop();
          } else {
            displayDialog(
              'Unable to Submit',
              'Received By is a required field. Must have one at least Photo taken.',
            ).catch();
          }
        }}
      />
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

export default PODCapturePhotoScreen;
