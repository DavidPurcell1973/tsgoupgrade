import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  cardStyle: { backgroundColor: 'white' },
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
  runDropdownStyle: {
    // borderWidth: 1,
    // borderColor: 'red',
    marginTop: -10,
    // width: 100,
    // paddingTop: 5,
    // paddingBottom: 5,
    paddingLeft: 5,
    paddingRight: 5,
    // verticalAlign: 'bottom',
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
  shortButton: {
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#3498db',
    borderWidth: 1,
    borderColor: 'red',
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 5,
    marginRight: 5,
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
  inputStyle: {
    // borderWidth: 1,
    // borderColor: 'black',
    // paddingTop: 15,
    // paddingBottom: 5,
    paddingLeft: 5,
    paddingRight: 5,
    // flex: 1,
    // verticalAlign: 'bottom',
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
