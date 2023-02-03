import React, { useRef, useState } from 'react';
import {
  View, Text, Modal, Platform, TouchableOpacity,
} from 'react-native';
import Orientation from 'react-native-orientation-locker';
import { RNCamera } from 'react-native-camera';
import { Icon } from 'react-native-elements';

const toolbarHeight = Platform.select({
  android: 0,
  ios: 22,
});

const modalViewStyle = {
  paddingTop: toolbarHeight,
  flex: 1,
};

const cameraButtonAlignmentStyle = {
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginBottom: 50,
};

const PODPhotoView = (props) => {
  const { visible, setVisible, onSave, cameraRef } = props;
  // const [modalVisible, setModalVisible] = useState(false);

  const show = (display) => {
    setVisible({ visible: display });
  };

  const onPressClose = () => {
    show(false);
    Orientation.lockToPortrait();
  };

  const onRequestClose = () => {
    show(false);
    Orientation.lockToPortrait();
  };

  const onDragEvent = () => {
    // This callback will be called when the user enters signature
    // console.log('dragged');
  };

  const onSaveEvent = (result) => {
    // result.encoded - for the base64 encoded png
    // result.pathName - for the file path name
    Orientation.lockToPortrait();
    onSave(result);
  };

  return (
    <Modal
      transparent={false}
      visible={visible}
      statusBarTranslucent
      onRequestClose={onRequestClose}
    >
      <View style={modalViewStyle}>
        {/* <View style={{ padding: 10, flexDirection: 'row' }}> */}
        {/*  <Text onPress={onPressClose}>{' x '}</Text> */}
        {/* </View> */}
        <RNCamera
          ref={cameraRef}
          captureAudio={false}
          style={{ flex: 1 }}
          type={RNCamera.Constants.Type.back}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
        >
          <TouchableOpacity
            activeOpacity={0.5}
            style={cameraButtonAlignmentStyle}
            onPress={onSave}
          >
            <Icon name="camera" type="font-awesome" size={50} color="#fff" />
          </TouchableOpacity>
        </RNCamera>
      </View>
    </Modal>
  );
};

export default PODPhotoView;
