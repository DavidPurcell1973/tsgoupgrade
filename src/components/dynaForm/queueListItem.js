import React from 'react';
import {ListItem, Text} from 'react-native-elements';
import {View} from 'react-native';
import {useDispatch} from 'react-redux';
import {doRemovePayload} from '../../reducers/dynaForm/dynaFormReducer';
import SwipeableContainer from '../swipeableContainer/swipeableContainer';

const QueueListRenderItem = (props) => {
  const dispatch = useDispatch();
  const {
    item,
    dispatchPayload,
    setButtonGroupDisabled,
    itemsForForm,
    form,
    editAction,
    operationTypeName,
  } = props;

  const retrySend = () => {
    dispatchPayload(item);
    // setTimeout(() => swipeableRef.current?.recenter(), 1500);
  };
  const removePack = () => {
    dispatch(doRemovePayload(item.uuid));
    if (itemsForForm.length === 1) {
      setButtonGroupDisabled(true);
    }
  };
  const enterEditMode = () => {
    editAction(item);
  };

  const rightButtonsForInstantMode = [
    {name: 'Retry', action: retrySend, color: 'turquoise'},
    {name: 'Edit', action: enterEditMode, color: 'burlywood'},
    {name: 'Delete', action: removePack, color: 'red'},
  ];

  const rightButtonsForBatchMode = [
    {name: 'Retry', action: retrySend, color: 'turquoise'},
    {name: 'Delete', action: removePack, color: 'red'},
  ];

  const itemDisplay = {
    ...item,
    Message:
      item.Message?.length > 20
        ? `${item.Message.substring(0, 20)}...`
        : item.Message,
  };
  delete itemDisplay.scannedBy;
  delete itemDisplay.scannedOn;
  delete itemDisplay.uuid;
  delete itemDisplay.Status;
  delete itemDisplay.isSent;
  delete itemDisplay.hasError;
  delete itemDisplay.updateProcedure;
  delete itemDisplay.type;
  delete itemDisplay.dynaFormId;
  delete itemDisplay.previousUuid;
  delete itemDisplay.operationType;
  delete itemDisplay.batchLength;
  delete itemDisplay.batchUuid;
  delete itemDisplay.batchSummary;

  let titleDisplay = item[form.primary];
  if (!item.isSent && item.hasError)
    titleDisplay = `${titleDisplay} -❗ Bad Request`;
  else if (item.isSent)
    titleDisplay = `${titleDisplay} - ${item.isSent ? item.Status : 'PENDING'}`;
  else titleDisplay = `${titleDisplay} - Pending Sync`;

  const finalRightButtons =
    operationTypeName.toLowerCase() === 'instant'
      ? rightButtonsForInstantMode
      : rightButtonsForBatchMode;

  return (
    <SwipeableContainer rightButtons={finalRightButtons}>
      <ListItem key={item.uuid} onPress={() => {}}>
        {/* <Icon name="tasks" type="font-awesome" /> */}
        <ListItem.Content>
          <ListItem.Title>{titleDisplay}</ListItem.Title>
          <ListItem.Subtitle>
            {/* <View style={styles.subtitleView}>
              <Text style={styles.subtitleText}> */}
            {JSON.stringify(itemDisplay)
              .split('"')
              .join('')
              .replace('{', '')
              .replace('}', '')
              .split(':')
              .join(': ')
              .split(',')
              .join(', ')}
            {/* </Text> */}
            {/* </View> */}
          </ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>
    </SwipeableContainer>
  );
};

export default QueueListRenderItem;
