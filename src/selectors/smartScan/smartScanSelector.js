import Config from 'react-native-config';
import {isArray} from 'lodash';

// export const taskSelector = (state, props) => {
//   if (isArray(state.tasks) && state.tasks.length > 0) {
//     return state.tasks.filter((e) => e.taskGuid === props.taskGuid)[0];
//   }
// //   return {taskDescription: 'Internal error - try again'};
// };
// export const taskCategoriesSelector = (state, props) =>
//   state.taskCategories
//     .filter((item) => item.taskType === props.taskType)
//     .map((e) => ({
//       label: e.categoryDescription,
//       value: e.taskCategoryGuid,
//     }));
// export const inputSelector = (state, props) => state.input[props.taskGuid];
