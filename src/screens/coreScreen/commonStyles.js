import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  buttonStyle: {
    borderRadius: 10,
    width: 300,
  },
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
  rightSwipeItem: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: 20,
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
});

export const colors = {
  primary: '#3498db',
  // secondary: '#ddd',
};

export default styles;
