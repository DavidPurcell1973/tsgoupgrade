import Swipeable from 'react-native-swipeable';
import { TouchableHighlight } from 'react-native';
import { Text } from 'react-native-elements';
import React, { useState } from 'react';
import styles from '../../screens/quickScanScreen/quickScanStyles';

const SwipeableContainer = (props) => {
  const [open, setOpen] = useState(false);
  const {
    defaultOpen, children, rightButtons, recenterInMs = 1000,
  } = props;
  const swipeableRef = React.createRef();

  return (
    <Swipeable
      ref={swipeableRef}
      onRightButtonsOpenRelease={(event, gestureState, swipeable) => {
        setOpen(true);
      }}
      onRightButtonsCloseRelease={() => {
        setOpen(false);
      }}
      rightButtons={rightButtons.map((e) => (
        <TouchableHighlight
          style={[styles.rightSwipeItem, { backgroundColor: e.color }]}
          onPress={() => {
            e.action();
            setTimeout(() => swipeableRef.current?.recenter(), recenterInMs);
          }}
        >
          <Text>{e.name}</Text>
        </TouchableHighlight>
      ))}
    >
      {children}
    </Swipeable>
  );
};

export default SwipeableContainer;
