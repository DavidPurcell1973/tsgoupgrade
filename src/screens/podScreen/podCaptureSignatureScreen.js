import React, {useEffect, useRef, useState} from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Button, Text, Input} from 'react-native-elements';
import fs, {write} from 'react-native-fs';
import fecha from 'fecha';
import Orientation from 'react-native-orientation-locker';
import styles, {colors} from './podStyles';
import logger from '../../helpers/logger';
import PODSignatureView from './podSignatureView';
import {v4 as uuid} from 'uuid';
import {displayDialog, displayToast} from '../../helpers/utils';
import {find, isString} from 'lodash';
import {
  apiTokenSelector,
  apiUrlSelector,
} from '../../selectors/common/commonSelector';
import Title from '../../components/title/title';
import {apiSendSignature, updateSignature} from '../../reducers/pod/podReducer';
import {ensureDirectoryExists, writeFile} from '../../helpers/file';
import {useNavigation} from '@react-navigation/native';

const PODCaptureSignatureScreen = (props) => {
  const dispatch = useDispatch();
  const {
    route: {
      params: {loadId, despatchId},
    },
  } = props;
  const {appStore, podStore} = useSelector((state) => state);
  const {username} = appStore;
  const {signatures} = podStore;
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const apiToken = useSelector(apiTokenSelector, shallowEqual);
  const navigation = useNavigation();
  const [fileName, setFileName] = useState('');
  const [filePath, setFilePath] = useState('');
  const [receivedOn, setReceivedOn] = useState('');
  const [comments, setComments] = useState('');
  const [receivedBy, setReceivedBy] = useState('');

  const receivedByInputRef = useRef();
  const commentsInputRef = useRef();
  const signatureViewRef = useRef();

  useEffect(() => {
    const metadata = find(
      signatures,
      (e) =>
        e.despatchId === despatchId &&
        e.loadId === loadId &&
        e.type === 'signature',
    );

    if (metadata) {
      const {fileName, receivedOn, receivedBy, comments, filePath} = metadata;
      if (isString(fileName)) setFileName(fileName);
      if (isString(filePath)) setFilePath(filePath);
      if (isString(comments)) setComments(comments);
      if (isString(receivedBy)) setReceivedBy(receivedBy);
      if (isString(receivedOn)) setReceivedOn(receivedOn);
    }

    // setTimeout(() => {
    //   if (receivedByInputRef.current) {
    //     receivedByInputRef.current.focus();
    //   }
    // }, 100);
  }, [signatures]);

  const rotateIfLandscape = () => {
    // Only show the signature view after the screen rotation (and animation) is done
    setTimeout(() => {
      Orientation.getOrientation((err, orientation) => {
        if (orientation.toString().includes('LANDSCAPE')) {
          if (signatureViewRef.current) {
            signatureViewRef.current.show(true);
          }
          // clearTimeout();
        } else {
          Orientation.lockToLandscape();
          rotateIfLandscape();
        }
      });
    }, 100);
  };

  const handleAcceptSignature = async () => {
    displayToast('Signature has been queued for upload');
    logger.info(`Signature ${fileName} has been queued for upload`);

    if (apiUrl && apiToken) {
      if (fileName.length > 0 && filePath.length > 0) {
        try {
          const encodedSignature = await fs.readFile(filePath, 'base64');
          dispatch(
            apiSendSignature(
              apiUrl,
              apiToken,
              loadId,
              despatchId,
              fileName,
              receivedOn,
              receivedBy,
              encodedSignature,
              filePath,
              comments,
            ),
          );
        } catch (err) {
          await logger.error(err);
        }
      } else displayToast('Invalid metadata...');
    }
  };

  return (
    <View style={styles.container}>
      <Title text={`Signature for Despatch ${despatchId}`} />
      <Input
        blurOnSubmit={false}
        ref={receivedByInputRef}
        value={receivedBy}
        onChangeText={(text) => {
          dispatch(updateSignature({loadId, despatchId, receivedBy: text}));
          // setReceivedBy(text);
          // dispatch(updateReceivedByInput(loadId, despatchId, text));
          // onReceivedByChangeText(loadId, despatchId, text);
        }}
        label="Received By"
        placeholder={'John Doe'}
        placeholderTextColor="gray"
      />
      <Input
        blurOnSubmit={false}
        label="Comments"
        ref={commentsInputRef}
        value={comments}
        onChangeText={(text) => {
          dispatch(updateSignature({loadId, despatchId, comments: text}));
          // setComments(text);
          // dispatch(updateCommentsInput(loadId, despatchId, text));
          // onCommentsChangeText(loadId, despatchId, text);
        }}
        placeholder={'(Optional)'}
        placeholderTextColor="gray"
      />
      <TouchableOpacity
        onPress={() => {
          Orientation.lockToLandscape();
          rotateIfLandscape();
        }}>
        <View
          style={{
            minHeight: 250,
            borderWidth: 2,
            borderColor: colors.primary,
            borderStyle: 'dashed',
            marginTop: 20,
            marginBottom: 20,
            alignItems: 'center',
          }}>
          <Text style={{fontSize: 18, fontWeight: 'bold'}}>
            {isString(filePath) && filePath.length > 0
              ? 'This is your signature'
              : 'Click here to sign'}
          </Text>
          <View style={{paddingBottom: 10}} />
          {isString(filePath) && filePath.length > 0 && (
            <View style={{backgroundColor: 'white'}}>
              <Image
                resizeMode="contain"
                style={{width: 300, height: 200}}
                source={{uri: 'file://' + filePath}}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
      <PODSignatureView
        ref={signatureViewRef}
        rotateClockwise
        onSave={(result) => {
          (async () => {
            // const base64String = `data:image/png;base64,${result.encoded}`;

            try {
              const fileName = `${loadId}_${despatchId}_${uuid()}.png`;
              const downloadDirectoryPath = `${fs.DownloadDirectoryPath}/com.timbersmart.tsgo/podSignature`;
              const fileFullPath = `${downloadDirectoryPath}/${fileName}`;
              const now = fecha.format(new Date(), 'YYYY-MM-DD hh:mm:ss');
              await ensureDirectoryExists(downloadDirectoryPath);
              await writeFile(fileFullPath, result.encoded, 'base64');

              setFileName(fileName);
              setFilePath(fileFullPath);
              setReceivedOn(now);
              dispatch(
                updateSignature({
                  loadId,
                  despatchId,
                  fileName,
                  filePath: fileFullPath,
                  receivedOn: now,
                }),
              );
            } catch (err) {
              await logger.error(err);
              console.log(err);
            }

            if (signatureViewRef.current) signatureViewRef.current.show(false);
          })();
        }}
      />
      <Button
        buttonStyle={{height: 50, width: '100%'}}
        containerStyle={styles.buttonContainerStyle}
        title="ACCEPT & UPLOAD SIGNATURE"
        onPress={() => {
          if (receivedBy.length > 0 && fileName && fileName.length > 0) {
            handleAcceptSignature();
            Orientation.lockToPortrait();
            navigation.pop();
          } else {
            displayDialog(
              'Missing values',
              'Received By and Signature are required fields',
            );
          }
        }}
      />
      <Button
        buttonStyle={styles.buttonStyle}
        containerStyle={styles.buttonContainerStyle}
        title="Back"
        onPress={() => {
          Orientation.lockToPortrait();
          navigation.pop();
        }}
      />
    </View>
  );
};

export default PODCaptureSignatureScreen;
