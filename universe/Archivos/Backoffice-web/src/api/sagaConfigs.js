import { call, put, all, takeEvery } from 'redux-saga/effects'
import { showLoading, hideLoading } from 'react-redux-loading-bar'

import { 
  REQUEST_GET_CONFIGS,
  responseGetConfigs
} from '../actions/actionConfigs'

import {
  getConfigsAPI
} from './api'

function* getConfigs(action) {
  try {
    yield put(showLoading())
    const response = yield call(getConfigsAPI, action.uuid)
    yield put(responseGetConfigs(response))
  } catch (error) {
    yield put(hideLoading())
  } finally {
    yield put(hideLoading())
  }
}

export default function* sagaConfigs() {
  yield all([
    takeEvery(REQUEST_GET_CONFIGS, getConfigs)
  ])
}
