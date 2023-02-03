import React, {Component, useRef} from 'react';
import {View, Text, TouchableHighlight} from 'react-native';
import {ListItem, Avatar} from 'react-native-elements';
import Swipeable from 'react-native-swipeable';
import {useNavigation} from '@react-navigation/native';
import styles from '../../styles/styles';

const PhotoItem = (props) => {
  const navigation = useNavigation();
  const swipeableRef = useRef();
  const {item, setImageUri, setOverlayVisible, deleteAction} = props;

  return (
    <Swipeable
      ref={swipeableRef}
      rightButtons={[
        <TouchableHighlight
          style={[styles.rightSwipeItem, {backgroundColor: '#FF0000'}]}
          onPress={() => {
            setTimeout(() => {
              deleteAction(item);
              if (swipeableRef.current) swipeableRef.current.recenter();
            }, 100);
          }}>
          <Text>Delete</Text>
        </TouchableHighlight>,
      ]}>
      <ListItem
        key={item.uri}
        // leftAvatar={{source: {uri: item.uri}}}
        onPress={() => {
          setOverlayVisible(true);
          setImageUri(item.uri);
        }}>
        <Avatar
          size={'large'}
          // containerStyle={{width: 100, height: 100}}
          // avatarStyle={{backgroundColor: 'black', width: 100, height: 100}}
          // containerStyle={{backgroundColor: 'black', width: 100, height: 100}}
          key={item.uri}
          // rounded
          source={{uri: item.uri}}
        />
        <ListItem.Content>
          <ListItem.Title>{item.uri.replace(/^.*[\\\/]/, '')}</ListItem.Title>
          {/* <ListItem.Subtitle>{item.uri}</ListItem.Subtitle> */}
        </ListItem.Content>
      </ListItem>
    </Swipeable>
  );
};

export default PhotoItem;
