import React, {Component} from 'react';
import {FlatList, ScrollView, TouchableHighlight, View} from 'react-native';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Button, ListItem, Text} from 'react-native-elements';
import styles, {colors} from './commonStyles';
import {
  getDrawerIcon,
  getDrawerNavigationOptions,
} from '../../components/drawer/drawerHelpers';
import Title from '../../components/title/title';
import Swipeable from 'react-native-swipeable';

const offlineQueueDrawerIcon = ({tintColor}) =>
  getDrawerIcon('stream', tintColor);

export const offlineQueueNavOptions = getDrawerNavigationOptions(
  'Offline Queue',
  colors.primary,
  'white',
  offlineQueueDrawerIcon,
);

class OfflineQueueScreen extends Component {
  state = {
    currentlyOpenSwipeable: null,
  };

  onBackButtonPressAndroid = () => {
    const {navigation, isAuthenticated} = this.props;

    if (isAuthenticated) {
      navigation.navigate('Home');
    } else {
      navigation.pop();
    }
  };

  deleteRow = (item) => {
    // TODO: Delete queue item
    // store.dispatch(deleteOfflineItem(0));
  };

  queueRow = ({item}) => {
    return (
      <Swipeable
        onRightButtonsOpenRelease={(event, gestureState, swipeable) => {
          this.setState({currentlyOpenSwipeable: swipeable});
        }}
        onRightButtonsCloseRelease={() => {
          this.setState({currentlyOpenSwipeable: null});
        }}
        rightButtons={[
          <TouchableHighlight
            style={[styles.rightSwipeItem, {backgroundColor: 'red'}]}
            onPress={() => {
              this.deleteRow(item);
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

  render() {
    const {queue} = this.props;

    return (
      <View style={styles.container}>
        <Title text="Offline Queue" />
        <ScrollView>
          <FlatList
            data={queue}
            renderItem={this.queueRow}
            keyExtractor={(item) => item.meta.transaction.toString()}
          />
        </ScrollView>
        <Button
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          title="Back"
          onPress={() => {
            this.onBackButtonPressAndroid();
          }}
        />
      </View>
    );
  }
}

OfflineQueueScreen.defaultProps = {
  queue: [],
};

OfflineQueueScreen.propTypes = {
  queue: PropTypes.array,
  isAuthenticated: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  queue: state.offline.outbox,
  isAuthenticated: state.appStore.isAuthenticated,
});

export default connect(mapStateToProps)(OfflineQueueScreen);
