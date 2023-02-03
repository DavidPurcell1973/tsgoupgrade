import React, {useEffect, useMemo} from 'react';
import {FlatList, View} from 'react-native';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Icon, ListItem} from 'react-native-elements';
import isArray from 'lodash/isArray';
import {orderBy} from 'lodash';
import styles from './smartScanStyles';
import Title from '../../components/title/title';
import {
  loadTasks,
  loadTaskCategories,
} from '../../reducers/smartScan/smartScanReducer';
import {apiUrlSelector} from '../../selectors/common/commonSelector';
import logger from '../../helpers/logger';

const SmartScanTaskScreen = (props) => {
  const dispatch = useDispatch();
  const {appStore, smartScanStore} = useSelector((state) => state);
  const {isRefreshing} = smartScanStore;
  const {token: apiToken, alternativeAppNames} = appStore;
  const {navigation} = props;
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const {tasks} = smartScanStore;

  const memoizedTasks = useMemo(() => {
    const filteredTasks = tasks.filter(
      (t) =>
        t.showInSmartScanOnly ||
        (!t.showInQuickScanOnly && !t.showInSmartScanOnly),
    );

    return orderBy(filteredTasks, 'taskPriority');
  }, [tasks]);

  const refreshSmartScan = () => {
    if (apiUrl && apiToken) {
      dispatch(loadTasks(apiUrl, apiToken));
      dispatch(loadTaskCategories(apiUrl, apiToken));
    } else logger.warn('API URL and token cannot be empty.');
  };

  useEffect(() => {
    refreshSmartScan();
  }, []);

  const renderRow = ({item}) => (
    <ListItem
      key={item.taskGuid}
      onPress={() => {
        if (apiUrl && apiToken) {
          dispatch(loadTaskCategories(apiUrl, apiToken));
          navigation.navigate('SmartScanTaskItem', item);
        }
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
        text={alternativeAppNames.SmartScan || 'Smart Scan'}
        description="Choose a task to start"
      />
      {isArray(memoizedTasks) && memoizedTasks.length > 0 ? (
        <FlatList
          data={memoizedTasks}
          renderItem={renderRow}
          refreshing={isRefreshing}
          onRefresh={() => {
            refreshSmartScan();
          }}
          keyExtractor={(item) => item.taskGuid}
        />
      ) : null}
    </View>
  );
};

export default SmartScanTaskScreen;
