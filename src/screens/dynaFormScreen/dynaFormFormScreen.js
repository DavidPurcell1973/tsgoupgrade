import React, {useEffect, useMemo} from 'react';
import {FlatList, View} from 'react-native';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {Icon, ListItem} from 'react-native-elements';
import isArray from 'lodash/isArray';
import uniqBy from 'lodash/uniqBy';
import {useNavigation} from '@react-navigation/native';
import styles from './dynaFormStyles';
import Title from '../../components/title/title';
import {apiGetForms} from '../../reducers/dynaForm/dynaFormReducer';
import {apiUrlSelector} from '../../selectors/common/commonSelector';
import logger from '../../helpers/logger';

const DynaFormFormScreen = (props) => {
  const dispatch = useDispatch();
  const {appStore, dynaFormStore} = useSelector((state) => state);
  const {token, alternativeAppNames} = appStore;
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const navigation = useNavigation();
  const {isRefreshing, forms} = dynaFormStore;
  const memoizedForms = useMemo(() => uniqBy(forms, 'dynaFormName'), [forms]);

  useEffect(() => {
    if (apiUrl && token) dispatch(apiGetForms(apiUrl, token));
    else logger.warn('API URL and token cannot be empty.');
  }, []);

  const renderRow = ({item}) => (
    <ListItem
      key={item.dynaFormName}
      onPress={() => {
        navigation.navigate('DynaFormFormItemScreen', item);
      }}>
      <Icon name="tasks" type="font-awesome" />
      <ListItem.Content>
        <ListItem.Title>{item.dynaFormName}</ListItem.Title>
        <ListItem.Subtitle>{item.dynaFormDescription}</ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  );

  return (
    <View style={styles.container}>
      <Title
        text={alternativeAppNames.DynaForm || 'Dynamic Scan'}
        description="Choose a task to start"
      />
      {isArray(memoizedForms) && memoizedForms.length > 0 ? (
        <FlatList
          data={memoizedForms}
          renderItem={renderRow}
          refreshing={isRefreshing}
          onRefresh={() => {
            if (apiUrl && token) dispatch(apiGetForms(apiUrl, token));
            else logger.warn('API URL and token cannot be empty.');
          }}
          keyExtractor={(item) => item.dynaFormId + item.dynaFormName}
        />
      ) : null}
    </View>
  );
};

export default DynaFormFormScreen;
