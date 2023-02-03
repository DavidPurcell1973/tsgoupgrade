import React, {useEffect, useMemo} from 'react';
import {FlatList, View} from 'react-native';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Icon, ListItem} from 'react-native-elements';
import isArray from 'lodash/isArray';
import uniqBy from 'lodash/uniqBy';
import {useNavigation} from '@react-navigation/native';
import styles from './quickQueryStyles';
import Title from '../../components/title/title';
import {apiUrlSelector} from '../../selectors/common/commonSelector';
import logger from '../../helpers/logger';
import {
  apiGetTaskActions,
  clearContext,
  clearResultAction,
  clearResult,
  apiGetTasks,
} from '../../reducers/quickQuery/quickQueryReducer';

const QuickQueryListScreen = (props) => {
  const dispatch = useDispatch();
  const {appStore, quickQueryStore} = useSelector((state) => state);
  const {token, alternativeAppNames} = appStore;
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const navigation = useNavigation();
  const {isRefreshing, tasks} = quickQueryStore;
  const memoizedTasks = useMemo(() => uniqBy(tasks, 'quickQueryId'), [tasks]);

  const apiLoadTasks = () => {
    if (apiUrl && token) {
      dispatch(apiGetTasks(apiUrl, token));
      dispatch(apiGetTaskActions(apiUrl, token));
    } else logger.warn('API URL and token cannot be empty.');
  };

  useEffect(() => {
    dispatch(clearContext());
    dispatch(clearResult());
    dispatch(clearResultAction());
    apiLoadTasks();
  }, []);

  const renderRow = ({item}) => (
    <ListItem
      key={item.queryQueryId}
      onPress={() => {
        navigation.navigate('QuickQueryTaskScreen', item);
      }}>
      <Icon name="tasks" type="font-awesome" />
      <ListItem.Content>
        <ListItem.Title>{item.queryName}</ListItem.Title>
        <ListItem.Subtitle>{item.queryDescription}</ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  );

  return (
    <View style={styles.container}>
      <Title
        text={alternativeAppNames.QuickQuery || 'Quick Query'}
        description="Choose a task to start"
      />
      {isArray(memoizedTasks) && memoizedTasks.length > 0 ? (
        <FlatList
          data={memoizedTasks}
          renderItem={renderRow}
          refreshing={isRefreshing}
          onRefresh={() => {
            apiLoadTasks();
          }}
          keyExtractor={(item) => item.quickQueryId.toString()}
        />
      ) : null}
    </View>
  );
};

export default QuickQueryListScreen;
