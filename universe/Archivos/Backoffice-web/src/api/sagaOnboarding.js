import { call, put, all, takeLatest } from 'redux-saga/effects'
import { showLoading, hideLoading } from 'react-redux-loading-bar'

import { 
  REQUEST_LOGIN,
  responseLogin,
  REQUEST_NEWPASSWORD,
  responseNewPassword
} from '../actions/actionOnboarding'

import {
  loginAPI,
  newPasswordAPI,
} from './api'

function* login(action) {
  try {
    yield put(showLoading())
    const response = yield call(loginAPI, action.credentials)
    yield put(responseLogin(response))
  } catch (error) {
    yield put(hideLoading())
  } finally {
    yield put(hideLoading())
  }
}

function* newPassword(action) {
  try {
    yield put(showLoading())
    const response = yield call(newPasswordAPI, action.request)
    yield put(responseNewPassword(response))
  } catch (error) {
    yield put(hideLoading())
  } finally {
    yield put(hideLoading())
  }
}

export default function* sagaOnboarding() {
  yield all([
    takeLatest(REQUEST_LOGIN, login),
    takeLatest(REQUEST_NEWPASSWORD, newPassword)
  ])
}
