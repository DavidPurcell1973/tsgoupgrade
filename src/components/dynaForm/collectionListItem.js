import React from 'react';
import {ListItem} from 'react-native-elements';
import {View} from 'react-native';

const CollectionListItem = (props) => {
  const {e, collections, setCollections, item} = props;

  const deleteAction = () => {
    collections[e.name] = collections[e.name].filter((i) => i !== item);
    setCollections({...collections});
  };

  return (
    // <View style={{ borderColor: 'black', borderStyle: 'solid', borderWidth: 1 }}>
    <ListItem
      key={item}
      // rightIcon={{ name: 'clear' }}
      onPress={() => deleteAction()}>
      <ListItem.Content>
        <ListItem.Title>{item}</ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron>
        <Icon name="clear" type="font-awesome" />
      </ListItem.Chevron>
    </ListItem>
    // </View>
  );
};
export default CollectionListItem;
