import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 0,
    padding: 0,
    height: '100%',
    position: 'relative',
  },
  rightSwipeItem: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: 20,
  },
  buttonStyle: {
    borderRadius: 10,
    width: 300,
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
  buttonContainer: {
    marginBottom: 1,
    marginRight: 1,
  },
});

export const colors = {
  primary: '#3498db',
  // secondary: '#ddd',
};

export default styles;
