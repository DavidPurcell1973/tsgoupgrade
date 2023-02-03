import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  cardStyle: {backgroundColor: 'white'},
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 0,
    paddingBottom: 5,
    alignContent: 'center',
  },
  buttonStyle: {
    borderRadius: 10,
    width: 200,
  },
  dropdownPickerStyle: {
    marginLeft: 10,
    width: '90%',
  },
  dropdownItemTextStyle: {
    textAlign: 'center',
    // marginLeft: 10,
  },
  dropdownContainerStyle: {
    marginTop: -10,
  },
  groupButton: {
    backgroundColor: '#3498db',
  },
  groupButtonContainer: {
    height: 40,
    borderWidth: 2,
    borderRadius: 5,
    // marginBottom: -5,
    borderColor: 'black',
  },
  shortButtonStyle: {
    width: '100%',
  },
  queueContainerStyle: {
    height: '95%',
    width: '95%',
  },
  buttonContainerStyle: {
    alignItems: 'center',
    marginBottom: 5,
    width: '33%',
  },
  rightSwipeItem: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: 20,
  },
  inputContainer: {
    flex: 0,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  textInputContainer: {
    backgroundColor: 'white',
    paddingBottom: 5,
    marginBottom: 5,
    paddingHorizontal: 0,
  },
  listContainer: {
    flex: 1,
    flexDirection: 'column',
    // justifyContent: 'flex-start',
    // borderWidth: 1,
    // borderColor: 'red',
  },
  subtitleView: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingTop: 5,
  },
  subtitleText: {
    color: 'grey',
  },
});

export const colors = {
  primary: '#3498db',
  // secondary: '#ddd',
};

export default styles;
