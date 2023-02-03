import React, {useEffect} from 'react';
import {FlatList, View} from 'react-native';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Icon, ListItem} from 'react-native-elements';
import isArray from 'lodash/isArray';
import styles from './quickScanStyles';
import Title from '../../components/title/title';
import {
  apiGetTaskCategories,
  apiGetTasks,
} from '../../reducers/quickScan/quickScanReducer';
import {apiUrlSelector} from '../../selectors/common/commonSelector';
import logger from '../../helpers/logger';

const QuickScanTaskScreen = (props) => {
  const dispatch = useDispatch();
  const {appStore, quickScanStore} = useSelector((state) => state);
  const {token, alternativeAppNames} = appStore;
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const {navigation} = props;
  const {tasks} = quickScanStore;
  const filteredTasks = tasks.filter(
    (t) =>
      t.showInQuickScanOnly ||
      (!t.showInQuickScanOnly && !t.showInSmartScanOnly),
  );

  useEffect(() => {
    if (apiUrl && token) {
      dispatch(apiGetTasks(apiUrl, token));
      dispatch(apiGetTaskCategories(apiUrl, token));
    } else logger.warn('API URL and token cannot be empty.');
  }, []);

  const renderRow = ({item}) => (
    <ListItem
      key={item.taskGuid}
      onPress={() => {
        navigation.navigate('QuickScanTaskItem', item);
      }}>
      <Icon name="tasks" type="font-awesome" />
      <ListItem.Content>
        <ListItem.Title>{item.taskDescription}</ListItem.Title>
      </ListItem.Content>
    </ListItem>
  );

  return (
    <View style={styles.container}>
      <Title
        text={alternativeAppNames.QuickScan || 'Quick Scan'}
        description="Choose a task to start"
      />
      {isArray(filteredTasks) && filteredTasks.length > 0 ? (
        <FlatList
          data={filteredTasks}
          renderItem={renderRow}
          keyExtractor={(item) => item.taskGuid}
        />
      ) : null}
    </View>
  );
};

export default QuickScanTaskScreen;
