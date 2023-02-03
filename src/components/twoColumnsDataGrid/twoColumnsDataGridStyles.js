import {StyleSheet} from 'react-native';

export const colors = {
  primary: '#3498db',
  // secondary: '#ddd',
  header: '#3498db',
};

const styles = StyleSheet.create({
  container: {
    flex: 0,
    padding: 5,
    // borderWidth: 1,
    // borderColor: 'red',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    // width: '100%',
    // height: '100%',
    // alignContent: 'center',
  },
  rightText: {
    fontWeight: 'bold',
  },
  leftText: {},
  rightItem: {
    width: '70%',
    fontWeight: 'bold',
  },
  leftItem: {
    width: '30%',
  },
  itemContainer: {
    flex: 0,
    padding: 5,
    flexDirection: 'row',
    // borderWidth: 1,
    // borderColor: 'blue',
    // justifyContent: 'flex-start',
    // alignContent: 'center',
  },
});

export default styles;
