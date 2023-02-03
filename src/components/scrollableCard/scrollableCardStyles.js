import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignContent: 'center',
  },
  loginLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardRowItemTitleStyle: {
    borderWidth: 0,
    borderColor: 'black',
    // fontStyle: 'italic',
    color: 'darkgray',
    // width: 100,
  },
  cardRowItemValueStyle: {
    borderWidth: 0,
    fontWeight: 'bold',
    borderColor: 'black',
  },
  cardRowItemContainerStyle: {
    // borderWidth: 1,
    // borderColor: 'red',
    flex: 0,
    minWidth: 50,
    // maxWidth: 100,
    // width: '100%',
    flexDirection: 'column',
    // width: 100,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    // flexWrap: '',
    // flexFlow: 'row',
    marginRight: 20,
    marginBottom: 5,
  },
  cardRowContainerStyle: {
    // borderWidth: 1,
    // borderColor: 'green',
    flex: 1,
    paddingTop: 0,
    paddingBottom: 5,
  },
  cardContainerStyle: {
    // borderWidth: 1,
    // borderColor: 'green',
    flex: 1,
  },
  flexColumn: {
    flex: 1,
    flexDirection: 'column',
    // borderWidth: 1,
    // borderColor: 'yellow',
  },
  arrow: {
    flex: 0,
    width: 50,
    flexDirection: 'row',
    alignSelf: 'center',
    // justifyContent: 'flex-start',
    // alignItems: 'center',
    // alignContent: 'center',
    borderWidth: 0,
    borderColor: 'blue',
  },
  cardRowStyle: {
    // borderWidth: 1,
    // borderColor: 'blue',
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'stretch',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    padding: 5,
  },
  flexRow: {
    flex: 1,
    flexDirection: 'row',
    // borderWidth: 0,
    // borderColor: 'yellow',
  },
  cardInnerContainerStyle: {
    flexGrow: 1,
    // borderWidth: 1,
    // borderColor: 'green',
  },
  cardRowInnerContainerStyle: {
    paddingHorizontal: 0,
    width: '100%',
    // width: 100,
    // borderWidth: 1,
    // borderColor: 'red',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  highlightItemStyle: {
    backgroundColor: '#ccffcc',
    borderRadius: 10,
  },
});

export const colors = {
  primary: '#3498db',
  secondary: '#ddd',
};

export default styles;
