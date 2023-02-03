import React, {createRef, useEffect, useMemo, useRef, useState} from 'react';
import {FlatList, ScrollView, useWindowDimensions, View} from 'react-native';
import {
  Button,
  ButtonGroup,
  Divider,
  Overlay,
  Text,
} from 'react-native-elements';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {v4 as uuid} from 'uuid';
import DialogAndroid from 'react-native-dialogs';
import fecha from 'fecha';
import {Dropdown} from 'react-native-material-dropdown-no-proptypes';
import {useNavigation} from '@react-navigation/native';
import {TextInput} from 'react-native-paper';
import {maxBy, isArray, isEmpty, isString, orderBy, uniqBy} from 'lodash';
import logger from '../../helpers/logger';
import Title from '../../components/title/title';
import styles from './dynaFormStyles';
import {displayToast} from '../../helpers/utils';
import {apiUrlSelector} from '../../selectors/common/commonSelector';
import {
  apiGetForms,
  apiSendItem,
  doAddPayload,
  doClearQueue,
} from '../../reducers/dynaForm/dynaFormReducer';
import {setIsSyncing} from '../../reducers/quickScan/quickScanReducer';
import QueueListRenderItem from '../../components/dynaForm/queueListItem';
import useHoneywellScanner from '../../hooks/useHoneywellScanner';
import {playBadSound, playGoodSound} from '../../components/common/playSound';
import DateInputType from '../../components/dynaForm/DateInputType';
import {format} from 'date-fns';
import AutoComplete from '../../components/AutoComplete/AutoComplete';

const DynaFormFormItemScreen = (props) => {
  const dispatch = useDispatch();
  const {
    route: {params: form},
  } = props;
  const {appStore, dynaFormStore} = useSelector((state) => state);
  const {token} = appStore;
  const queueListRef = useRef();
  const windowWidth = useWindowDimensions().width;
  const {forms, queues, isSyncing} = dynaFormStore;
  const apiUrl = useSelector(apiUrlSelector, shallowEqual);
  const {operationTypeName} = form;
  const {dynaFormId, dynaFormName} = useMemo(() => form, [form]);
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [currentInputElement, setCurrentInputElement] = useState(null);
  const [operationType, setOperationType] = useState('insert');
  const fields = useMemo(
    () =>
      forms
        .filter((f) => f.dynaFormId === dynaFormId && !f.isHidden)
        .map((e) => ({
          dynaFormSchemaItemId: e.dynaFormSchemaItemId,
          name: e.schemaItemName,
          description: e.schemaItemDescription,
          type: e.schemaItemTypeName,
          defaultFocus: e.defaultFocus,
          keyboardType: e.keyboardType,
          groupValue: JSON.parse(e.schemaItemGroupValue)
            ? JSON.parse(e.schemaItemGroupValue).map((x) => ({
                label: x.Name,
                value: x.Value,
              }))
            : // : [{label: 'undefined', value: 'undefined'}],
              [],
          isHidden: e.isHidden,
          isOptional: e.isOptional,
          isPrimary: e.isPrimary,
          isUnique: e.isUnique,
          autoClearOnFocus: e.autoClearOnFocus,
          autoClearOnSubmit: e.autoClearOnSubmit,
          primary: e.isPrimary ? e.schemaItemName : null,
          shouldHideValue: e.shouldHideValue,
          validationRules: e.validationRules,
          defaultValue: e.defaultValue,
        })),
    [dynaFormId],
  );
  const [refs, setRefs] = useState([]);
  const {username} = appStore;
  const [values, setValues] = useState({});
  const [collections, setCollections] = useState({});
  const [mainScrollViewScrollEnabled, setMainScrollViewScrollEnabled] =
    useState(true);
  const navigation = useNavigation();
  const itemsForForm = queues.filter((e) => e.dynaFormId === form.dynaFormId);
  const successfulSyncedItems = itemsForForm.filter(
    (e) => e.isSent && !e.hasError,
  );
  const [buttonGroupDisabled, setButtonGroupDisabled] = useState(true);
  const {formHasLayoutDefined, formLayout} = form;

  const memoizedLayout = useMemo(() => {
    if (formHasLayoutDefined) {
      let formLayoutJson = null;
      try {
        formLayoutJson = JSON.parse(formLayout);
      } catch (error) {
        logger.error(error);
      }
      if (formLayoutJson) {
        let sectionItems = formLayoutJson.map((e) => ({
          sectionId: e.SectionID,
          sectionTitle: e.SectionTitle,
          sectionDescription: e.SectionDescription,
          sectionOrder: e.SectionOrder,
          dynaFormSchemaItemId: e.DynaFormSchemaItemID,
        }));
        sectionItems = orderBy(sectionItems, 'sectionOrder');
        sectionItems = sectionItems.map((e, index) => ({
          sectionId: e.sectionId,
          sectionTitle: e.sectionTitle,
          sectionDescription: e.sectionDescription,
          sectionOrder: index,
          dynaFormSchemaItemId: e.dynaFormSchemaItemId,
          rows: [],
        }));
        const sections = uniqBy(sectionItems, 'sectionId');
        // formLayoutJson = orderBy(formLayoutJson, ['Y', 'X']);
        // formLayoutJson = formLayoutJson.map((e, index) => ({ ...e, X: index }));
        // formLayoutJson = formLayoutJson.map((e, index) => ({ ...e, Y: index }));
        sections.forEach((s) => {
          // Build a list of items in this section
          const itemsInThisSection = sectionItems
            .filter((i) => i.sectionId === s.sectionId)
            .map((i) => {
              const lookup = formLayoutJson.filter(
                (f) => f.DynaFormSchemaItemID === i.dynaFormSchemaItemId,
              );
              if (lookup.length > 0) {
                return {...i, ...lookup[0]};
              }
              return i;
            });
          const maxY = maxBy(itemsInThisSection, 'Y').Y; // Row
          const maxX = maxBy(itemsInThisSection, 'X').X; // Column
          const rows = [];
          for (let y = 0; y <= maxY; y++) {
            const x = 0;
            const itemsInRow = [];
            for (let x = 0; x <= maxX; x++) {
              const item = itemsInThisSection.filter(
                (e) => e.X === x && e.Y === y,
              );
              if (item.length === 1) {
                itemsInRow.push(item[0]);
              } else {
                // console.log('Nothing here. Ignoring...');
              }
            }
            if (itemsInRow.length > 0) rows.push(itemsInRow);
          }
          // eslint-disable-next-line no-param-reassign
          s.rows = rows;
        });
        return sections;
      }
    }
    return null;
  }, [form]);

  useEffect(() => {
    setRefs((e) =>
      Array(fields.length)
        .fill()
        .map((_, i) => e[i] || createRef()),
    );

    if (itemsForForm.length > 0) setButtonGroupDisabled(false);
  }, [fields.length]);

  useEffect(() => {
    if (refs.length === 0) return;

    const primaryField = fields.filter((e) => e.isPrimary);
    const hasPrimaryField = primaryField.length > 0;
    if (!hasPrimaryField)
      displayToast('Form needs to have 1 primary field defined');
    else form.primary = primaryField[0].primary;

    // Bug? the defaultFocus value will change to a ref after popping and pushing the screen
    const defaultFocusField = fields.filter((e) => e.defaultFocus === true);
    const hasDefaultFocus = defaultFocusField.length > 0;
    if (!hasDefaultFocus)
      displayToast('Form needs to have 1 default focus field defined');
    else form.defaultFocusFieldIndex = fields.indexOf(defaultFocusField[0]);

    if (form.defaultFocusFieldIndex >= 0)
      refs[form.defaultFocusFieldIndex].current?.focus();

    if (!hasPrimaryField)
      logger.warn('Form needs to have 1 primary field defined');
    if (!hasDefaultFocus)
      logger.warn('Form needs to have 1 default focus field defined');

    if (!hasDefaultFocus || !hasPrimaryField) navigation.pop();
  }, [refs.length]);

  const goToDefaultFocus = () => {
    if (form.defaultFocusFieldIndex >= 0)
      refs[form.defaultFocusFieldIndex].current?.focus();
    setCurrentInputElement(fields[form.defaultFocusFieldIndex]);
  };

  const dispatchPayload = (item) => {
    if (!item) logger.warn('Empty payload.');
    if (apiUrl && token) dispatch(apiSendItem(apiUrl, token, item));
    else logger.warn('API URL and token cannot be empty.');
  };

  const autoClearOnSubmit = () => {
    const newValues = {...values};
    fields.forEach((e) => {
      if (e.autoClearOnSubmit) delete newValues[e.name];
    });
    setValues(newValues);
    setCollections({});
  };

  const getUpdateProcedure = () => {
    let updateProcedure = 'update';
    switch (operationType) {
      case 'insert':
        updateProcedure = form.insertProcedure;
        break;
      case 'delete':
        updateProcedure = form.deleteProcedure;
        break;
      default:
        updateProcedure = form.updateProcedure;
    }
    return updateProcedure;
  };

  const addToQueue = () => {
    Object.keys(collections).forEach((key) => {
      const joinedString = JSON.stringify(collections[key]);
      values[key] = joinedString;
    });
    let payload = {
      uuid: uuid().toUpperCase(),
      scannedOn: fecha.format(new Date(), 'YYYY-MM-DD hh:mm:ss'),
      scannedBy: username,
      dynaFormId: form.dynaFormId,
      operationType,
      updateProcedure: getUpdateProcedure(),
      isSent: false,
      hasError: false,
      ...values,
    };
    logger.info(payload);
    dispatch(doAddPayload(payload));
    autoClearOnSubmit();
    setButtonGroupDisabled(false);
    if (operationTypeName.toLowerCase() === 'instant') {
      dispatchPayload(payload);
      // Manually triggering this - delay getting new changes in dynamic dropdown values
      setTimeout(() => {
        if (apiUrl && token) dispatch(apiGetForms(apiUrl, token));
        else logger.warn('API URL and token cannot be empty.');
      }, 500);
    }
    goToDefaultFocus();
  };

  const onSyncButtonPressed = async () => {
    const itemsToSync = itemsForForm.filter((e) => !e.isSent || e.isError);
    const batchLength = itemsForForm.length;
    const batchUuid = uuid().toUpperCase();
    const batchSummary = JSON.stringify(
      itemsForForm.map((e) => e[form.primary]),
    );

    if (!isSyncing) dispatch(setIsSyncing(true));
    else {
      displayToast('Another sync is in progress...');
      return;
    }

    if (itemsToSync.length > 0) {
      displayToast(`Sync started for ${itemsToSync.length} items...`);
      logger.debug(
        `Total of ${itemsToSync.length} items; JSON: ${JSON.stringify(
          itemsToSync,
        )}`,
      );
      let delayCounter = 1;
      itemsToSync.forEach((e) => {
        setTimeout(() => {
          dispatchPayload({
            ...e,
            batchLength: batchLength,
            batchUuid: batchUuid,
            batchSummary: batchSummary,
          });
        }, delayCounter * 200);
        delayCounter += 1;
      });
      setTimeout(() => {
        if (apiUrl && token)
          dispatch(apiGetForms(apiUrl, token), delayCounter * 200 + 500);
        else logger.warn('API URL and token cannot be empty.');
      });
      displayToast('Sync completed - waiting for reply...');
    }

    goToDefaultFocus();
  };

  const onClearButtonPressed = async () => {
    DialogAndroid.assignDefaults({
      positiveText: 'Confirm',
      negativeText: 'Cancel',
    });

    const {action, text} = await DialogAndroid.alert(
      'Clear',
      'Are you sure you want to clear this batch?',
    );

    switch (action) {
      case DialogAndroid.actionPositive:
        // dispatch(setIsSyncing(false));
        dispatch(doClearQueue(form.dynaFormId));
        setButtonGroupDisabled(true);
        break;
      default:
        break;
    }
    goToDefaultFocus();
  };

  const onChangeTextHandler = (item, text) => {
    const newItem = {};
    newItem[item.name] = text.toString().trim();
    setValues({...values, ...newItem});
  };

  const onButtonGroupPress = (index) => {
    switch (index) {
      case 0:
        onClearButtonPressed().done();
        break;
      case 1:
        onSyncButtonPressed().done();
        break;
      default:
    }
  };

  const validateAllAndAddToQueue = () => {
    let isOk = true;
    let isValidationOk = true;
    fields.forEach((i, index) => {
      if (!isValidationOk) return;
      if (
        !i.isOptional &&
        (values[i.name] === undefined || values[i.name].length === 0) &&
        i.type.toLowerCase() !== 'collection'
      ) {
        displayToast(`Missing value for ${i.name}`);
        refs[index].current?.focus();
        isOk = false;
        playBadSound();
        logger.warn(`Missing value for ${i.name}`);
      }
      if (
        i.isUnique &&
        itemsForForm.filter(
          (item) =>
            item[i.name]?.toLowerCase() === values[i.name]?.toLowerCase(),
        ).length >= 1 &&
        operationType === 'insert' // Only validates a INSERT operation
      ) {
        isValidationOk = false;
        displayToast(`${i.name} (${values[i.name]}) must be unique`);
        playBadSound();
        onChangeTextHandler(i, '');
        refs[index].current?.focus();
      }
      try {
        const validationRules = JSON.parse(i.validationRules);
        if (isValidationOk && validationRules !== null) {
          // const isValidationOk = true;
          validationRules.forEach((r) => {
            // eslint-disable-next-line no-eval
            const applyRule = eval(r.ValidationCode);
            const result = applyRule(values[i.name], values, logger);
            if (
              result !== undefined &&
              (result.toString() === 'false' || result.toString() === 'error')
            ) {
              // Validation fail
              onChangeTextHandler(i, '');
              refs[index].current?.focus();
              displayToast(r.ValidationFailMessage);
              playBadSound();
              isValidationOk = false;
              logger.warn(r.ValidationFailMessage);
            } else if (
              result !== undefined &&
              result.toString() !== 'true' &&
              result.length > 0
            ) {
              logger.debug(result);
              // Validation returns a string to replace current value then assume ok
              onChangeTextHandler(i, result);
            }
          });
        }
      } catch (error) {
        logger.warn(error.toString());
      }
    });

    if (!isValidationOk) {
      playBadSound();
      return;
    }

    if (isOk) {
      setOperationType('insert');
      addToQueue();
      goToDefaultFocus();
    }
  };

  const enterEditMode = (item) => {
    setOperationType('update');
    setIsQueueVisible(false);
    setValues({});
    setCollections({});
    const formData = item;
    const commonProperties = [
      'previousUuid',
      'Message',
      'Status',
      'dynaFormId',
      'hasError',
      'isSent',
      'scannedBy',
      'scannedOn',
      'uuid',
      'updateProcedure',
    ];
    // commonProperties.forEach((p) => delete formData[p]);
    const newValues = {};
    const newCollections = {};
    Object.keys(formData).forEach((k) => {
      if (!commonProperties.includes(k)) {
        let v = formData[k];
        try {
          v = JSON.parse(v);
        } catch (error) {
          //
        }
        if (isArray(v)) {
          newCollections[k] = v;
        } else {
          newValues[k] = v;
        }
      }
    });
    newValues.previousUuid = item.uuid;
    setValues(newValues);
    setCollections(newCollections);
  };

  const validateBeforeMoveFocusOrAddToQueue = (e) => {
    const type = e.type.toLowerCase();
    const indexOfInput = fields.indexOf(e);
    const validationRules = JSON.parse(e.validationRules);
    let isValidationOk = true;

    // Unique value validation
    if (
      e.isUnique &&
      itemsForForm.filter(
        (item) => item[e.name]?.toLowerCase() === values[e.name]?.toLowerCase(),
      ).length >= 1 &&
      operationType === 'insert' // Only validates a INSERT operation
    ) {
      isValidationOk = false;
      displayToast(`${e.name} (${values[e.name]}) must be unique`);
      onChangeTextHandler(e, '');
      playBadSound();
      refs[indexOfInput].current?.focus();
    }

    // Validation rules
    if (isValidationOk && validationRules !== null) {
      // const isValidationOk = true;
      validationRules.forEach((r) => {
        // eslint-disable-next-line no-eval
        const applyRule = eval(r.ValidationCode);
        const result = applyRule(values[e.name]);
        if (result.toString() === 'false') {
          onChangeTextHandler(e, '');
          refs[indexOfInput].current?.focus();
          displayToast(r.ValidationFailMessage);
          isValidationOk = false;
          playBadSound();
        } else if (result.toString() !== 'true' && result.length > 0) {
          // Validation returns a string to replace current value then assume ok
          onChangeTextHandler(e, result);
        }
      });
    }
    if (!isValidationOk) {
      playBadSound();
      return;
    }

    // Should add to queue or move to next input or do nothing
    if (type === 'collection') {
      // Clear the input and do not move to the next field
      onChangeTextHandler(e, '');
      refs[indexOfInput].current?.focus();
      const thisCollection = collections[e.name];
      if (isArray(thisCollection)) thisCollection.unshift(values[e.name]);
      else collections[e.name] = [values[e.name]];
      setCollections({...collections});
    } else if (indexOfInput + 1 === fields.length) {
      let isOk = true;
      fields.forEach((i, index) => {
        const fieldType = i.type.toLowerCase();
        if (
          fieldType === 'date' ||
          (fieldType.includes('fixed') && index === fields.length)
        ) {
          logger.warn(
            `Don't put field ${i.name} with data type ${fieldType} last on the last item due to a bug?`,
          );
        }

        if (
          !i.isOptional &&
          (values[i.name] === undefined || values[i.name].length === 0)
        ) {
          displayToast(`Missing value for ${i.name}`);
          playBadSound();
          refs[index].current?.focus();
          isOk = false;
        }
      });
      if (isOk) {
        addToQueue();
        goToDefaultFocus();
      }
    } else {
      refs[indexOfInput + 1].current?.focus();
      setCurrentInputElement(fields[indexOfInput + 1]);
    }
  };

  const buttons = [
    'Clear',
    `Upload ${
      itemsForForm.length > 0
        ? `${successfulSyncedItems.length}/${itemsForForm.length}`
        : ''
    }`,
  ];

  const buildInputComponent = (e) => {
    const i = fields.indexOf(e);
    // Use default value if present
    const defaultValue = e.defaultValue || '';
    const type =
      e.type.toLowerCase().match(/(dropdown)/) &&
      e.type.toLowerCase().match(/(dropdown)/).length > 0
        ? 'dropdown'
        : e.type.toLowerCase();

    switch (type) {
      case 'dropdown':
        return (
          <Dropdown
            label={`${e.name}${!e.isOptional ? '*' : ''}`}
            overlayStyle={styles.dropdownContainerStyle}
            pickerStyle={styles.dropdownPickerStyle}
            itemTextStyle={styles.dropdownItemTextStyle}
            data={
              e.isOptional
                ? [{label: 'Not selected', value: ''}].concat(e.groupValue)
                : e.groupValue
            }
            key={e.name}
            value={values[e.name] || defaultValue}
            onChangeText={(value) => {
              onChangeTextHandler(e, value);
              validateBeforeMoveFocusOrAddToQueue(e);
            }}
            animationDuration={0}
            // textColor="rgba(61,117,233,0.14901960784313725)"
            itemCount={8}
            itemPadding={10}
          />
        );
      case 'autocomplete':
        return (
          <AutoComplete
            ref={refs[i]}
            data={e.groupValue || []}
            isOptional={e.isOptional}
            key={e.name}
            setValue={(value) => {
              // console.log(value);
              onChangeTextHandler(e, value);
              validateBeforeMoveFocusOrAddToQueue(e);
            }}
            // labelStyle={{fontSize: 15}}
            label={e.name}
            maxHeight={200}
            onFocus={() => {
              const indexOfInput = fields.indexOf(e);
              setCurrentInputElement(fields[indexOfInput]);
              if (!e.autoClearOnFocus) return;
              const newValues = {...values};
              // newValues[e.name] = '';
              delete newValues[e.name];
              setValues(newValues);
            }}
          />
        );
      case 'date':
        return (
          <DateInputType
            value={values[e.name] || null}
            onChange={(value) => {
              value = format(value, 'yyyy-MM-dd').toString();
              onChangeTextHandler(e, value);
              validateBeforeMoveFocusOrAddToQueue(e);
            }}
            isOptional={e.isOptional}
            key={e.name}
            onFocus={() => {
              const indexOfInput = fields.indexOf(e);
              setCurrentInputElement(fields[indexOfInput]);
              if (!e.autoClearOnFocus) return;
              const newValues = {...values};
              // newValues[e.name] = '';
              delete newValues[e.name];
              setValues(newValues);
            }}
            label={e.name}
          />
        );
      default:
        return (
          <TextInput
            // containerStyle={styles.textInputContainer}
            style={styles.textInputContainer}
            dense
            ref={refs[i]}
            mode="flat"
            key={e.name}
            onFocus={() => {
              const indexOfInput = fields.indexOf(e);
              setCurrentInputElement(fields[indexOfInput]);
              if (!e.autoClearOnFocus) return;
              const newValues = {...values};
              // newValues[e.name] = '';
              delete newValues[e.name];
              setValues(newValues);
            }}
            blurOnSubmit={false}
            label={`${e.name}${!e.isOptional ? '*' : ''}`}
            onChangeText={(text) => {
              onChangeTextHandler(e, text);
            }}
            keyboardType={e.keyboardType || 'default'}
            value={values[e.name] || defaultValue}
            placeholder={e.description ? `${e.description}` : e.name}
            placeholderTextColor="gray"
            onSubmitEditing={() => {
              validateBeforeMoveFocusOrAddToQueue(e);
            }}
          />
        );
    }
  };

  // const honeywellScanner = useHoneywellScanner({
  //   onBarcodeReadSuccess: () => {},
  //   name: 'DynaFormScanScreen',
  // });

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Title
          text={`${dynaFormName}${operationType === 'update' ? ' (Edit)' : ''}`}
        />
        {form.operationTypeName.toLowerCase() === 'instant' ? (
          <Button
            style={styles.buttonStyle}
            type="clear"
            title={`${
              itemsForForm.length > 0
                ? `${successfulSyncedItems.length}/${itemsForForm.length}`
                : ''
            }`}
            onPress={() => onClearButtonPressed()}
          />
        ) : null}
      </View>
      <Divider />
      {operationTypeName.toLowerCase() === 'batch' ? (
        <>
          <ButtonGroup
            disabled={buttonGroupDisabled}
            onPress={onButtonGroupPress}
            buttons={buttons}
            containerStyle={styles.groupButtonContainer}
          />
          <Divider />
        </>
      ) : null}
      <ScrollView
        scrollEnabled={mainScrollViewScrollEnabled}
        onScroll={(event) => {
          if (
            !isEmpty(currentInputElement) &&
            isString(currentInputElement.type)
          ) {
            const elementType = currentInputElement.type.toLowerCase();
            if (elementType === 'autocomplete') {
              setMainScrollViewScrollEnabled(false);
            } else setMainScrollViewScrollEnabled(true);
          }
        }}>
        {formHasLayoutDefined ? (
          <>
            {memoizedLayout.map((section) => (
              <View
                style={{
                  flexDirection: 'column',
                }}>
                {section?.sectionTitle ? (
                  <>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        fontStyle: 'normal',
                        marginTop: 10,
                        fontSize: 20,
                      }}>
                      {section.sectionTitle}
                    </Text>
                    <Text
                      style={{
                        marginBottom: 5,
                        color: 'gray',
                      }}>
                      {section.sectionDescription}
                    </Text>
                  </>
                ) : null}
                {section?.rows?.map((row) => (
                  <View
                    style={{
                      flexDirection: 'row',
                    }}>
                    {row.map((e) => {
                      const field = fields.filter(
                        (f) =>
                          f.dynaFormSchemaItemId === e.DynaFormSchemaItemID,
                      );
                      if (field.length === 1) {
                        const rowItemWidth =
                          windowWidth / row.length - 2 * e?.Margin;
                        return (
                          <View
                            style={{
                              marginRight: e?.Margin || 5,
                              marginBottom: e?.Margin || 5,
                              padding: e?.Padding || 0,
                              width: rowItemWidth || windowWidth,
                            }}>
                            {buildInputComponent(field[0])}
                          </View>
                        );
                      }
                      return null;
                    })}
                  </View>
                ))}
              </View>
            ))}
          </>
        ) : (
          <>{fields.map((e) => buildInputComponent(e))}</>
        )}
      </ScrollView>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Button
          containerStyle={styles.buttonContainerStyle}
          buttonStyle={styles.shortButtonStyle}
          title="Back"
          onPress={() => {
            navigation.pop();
          }}
        />
        <Button
          containerStyle={styles.buttonContainerStyle}
          buttonStyle={styles.shortButtonStyle}
          title="Queue"
          onPress={() => {
            setIsQueueVisible(true);
            // setTimeout(() => {
            //   queueListRef.current?.scrollToEnd();
            // }, 500);
          }}
        />
        <Button
          containerStyle={styles.buttonContainerStyle}
          buttonStyle={styles.shortButtonStyle}
          title="Send"
          onPress={() => {
            validateAllAndAddToQueue();
          }}
        />
      </View>
      <Overlay
        isVisible={isQueueVisible}
        onBackdropPress={() => setIsQueueVisible(false)}
        overlayStyle={styles.queueContainerStyle}>
        {isArray(itemsForForm) && itemsForForm.length > 0 ? (
          <>
            <View
              style={{
                flex: 0,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Title text="Summary" />
              <Button
                containerStyle={styles.buttonContainerStyle}
                buttonStyle={styles.shortButtonStyle}
                title="Hide"
                onPress={() => {
                  setIsQueueVisible(false);
                }}
              />
            </View>
            <FlatList
              ref={queueListRef}
              data={itemsForForm}
              renderItem={(props) => (
                <QueueListRenderItem
                  dispatchPayload={dispatchPayload}
                  setButtonGroupDisabled={setButtonGroupDisabled}
                  itemsForForm={itemsForForm}
                  operationTypeName={operationTypeName}
                  form={form}
                  editAction={enterEditMode}
                  {...props}
                />
              )}
              keyExtractor={(item) => `${item.uuid}`}
            />
          </>
        ) : (
          <Text>Queue is empty.</Text>
        )}
      </Overlay>
    </View>
  );
};

export default DynaFormFormItemScreen;
