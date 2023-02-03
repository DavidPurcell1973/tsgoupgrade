import {Overlay, Button, ListItem, Text} from 'react-native-elements';
import {FlatList, ScrollView, TouchableHighlight} from 'react-native';
import styles from './QueueListStyles';
import * as React from 'react';
import Swipeable from 'react-native-swipeable';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import Title from '../../components/title/title';

const QueueList = () => {
  const {offline, appStore} = useSelector((state) => state);
  const {outbox: queue} = offline;
  const {isAuthenticated} = appStore;
  const navigation = useNavigation();

  const deleteRow = (item) => {
    // TODO: Delete queue item
    // store.dispatch(deleteOfflineItem(0));
  };

  const onBackButtonPressAndroid = () => {
    //setCloseQueue
  };
  const renderQueueRow = ({item}) => {
    return (
      <Swipeable
        onRightButtonsOpenRelease={(event, gestureState, swipeable) => {
          // this.setState({currentlyOpenSwipeable: swipeable});
        }}
        onRightButtonsCloseRelease={() => {
          // this.setState({currentlyOpenSwipeable: null});
        }}
        rightButtons={[
          <TouchableHighlight
            style={[styles.rightSwipeItem, {backgroundColor: 'red'}]}
            onPress={() => {
              deleteRow(item);
            }}>
            <Text>Delete</Text>
          </TouchableHighlight>,
        ]}>
        <ListItem key={item.meta.transaction.toString()}>
          <ListItem.Content>
            <ListItem.Title>{item.type}</ListItem.Title>
            <ListItem.Subtitle>
              {item.meta.offline.effect.url}
            </ListItem.Subtitle>
          </ListItem.Content>
        </ListItem>
      </Swipeable>
    );
  };

  return (
    <>
      <Overlay
        onBackdropPress={
          () => {}
          // dispatch(setWebAppFullScreen(!isWebAppFullScreen))
        }
        overlayStyle={styles.container}
        isVisible>
        <>
          <Title text="Offline Queue" />
          <ScrollView>
            <FlatList
              data={queue}
              renderItem={renderQueueRow}
              keyExtractor={(item) => item.meta.transaction.toString()}
            />
          </ScrollView>
          <Button
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainerStyle}
            title="Back"
            onPress={() => {
              onBackButtonPressAndroid();
            }}
          />
        </>
      </Overlay>
    </>
  );
};

export default QueueList;
