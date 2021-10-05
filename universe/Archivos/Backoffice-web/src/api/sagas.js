import { all, fork } from 'redux-saga/effects'
import sagaConfigs from './sagaConfigs'
import sagaOnboarding from './sagaOnboarding'

export default function* rootSaga() {
  yield all([
    fork(sagaConfigs),
    fork(sagaOnboarding)
  ])
}
