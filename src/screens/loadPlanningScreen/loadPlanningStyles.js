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
  queueContainerStyle: {
    marginTop: 100,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 50,
  },
  headerContainer: {
    // borderWidth: 1,
    // borderColor: 'red',
    // flex: 1,
    flexDirection: 'row',
    //   flexWrap: 'wrap',
    //   flexFlow: 'row nowrap',
    justifyContent: 'space-between',
    //   alignContent: 'stretch',
    //   alignItems: 'stretch',
    //   alignSelf: 'stretch',
  },
  packDetailsContainer: {
    padding: 5,
    marginRight: 2,
    marginLeft: 2,
    marginTop: 0,
    marginBottom: 0,
  },
  packOptionsContainer: {
    paddingLeft: 10,
    paddingTop: 10,
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    // borderColor: 'black', borderWidth: 1,
  },
  wideButtonStyle: {
    borderRadius: 10,
    width: '100%',
  },
  buttonStyle: {
    borderRadius: 10,
    width: 200,
  },
  buttonContainerStyle: {
    // flex: 0,
    alignItems: 'center',
    // paddingHorizontal: 50,
    // borderWidth: 1,
    // borderColor: 'black',
    // borderStyle: 'solid',
    marginTop: 5,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  rightSwipeItem: {
    // borderWidth: 1,
    // borderColor: 'black',
    // borderStyle: 'solid',
    flex: 1,
    flexDirection: 'column',
    // justifyContent: 'flex-start',
    justifyContent: 'center',
    // alignItems: 'flex-end',
    paddingLeft: 20,
  },
  inputContainerStyle: {
    flex: 0,
    alignSelf: 'center',
    marginBottom: 5,
    marginTop: 5,
  },
});

export const colors = {
  // primary: '#3498db',
  // secondary: '#ddd',
};

export default styles;
