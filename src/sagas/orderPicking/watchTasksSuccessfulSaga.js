import { delay, takeEvery } from 'redux-saga/effects';

function* temp() {
  yield delay(1000);
}
function* watchTasksSuccessfulSaga() {
  while (true) {
    // console.log('Saga loop');
    yield takeEvery('SMARTSCAN_GET_TASKS_SUCCESS', temp);
    yield delay(1000);
  }
}

export default watchTasksSuccessfulSaga;
