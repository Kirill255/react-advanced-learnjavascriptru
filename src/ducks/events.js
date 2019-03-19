import firebase from "firebase/app";
import "firebase/database";
import { Record, OrderedMap } from "immutable";
import { all, take, call, put } from "redux-saga/effects";
import { appName } from "../config";

/**
 * Constants
 * */
export const moduleName = "events";
const prefix = `${appName}/${moduleName}`;

export const FETCH_ALL_REQUEST = `${prefix}/FETCH_ALL_REQUEST`;
export const FETCH_ALL_SUCCESS = `${prefix}/FETCH_ALL_SUCCESS`;
export const FETCH_ALL_ERROR = `${prefix}/FETCH_ALL_ERROR`;

/**
 * Reducer
 * */
export const ReducerRecord = Record({
  entities: new OrderedMap({}),
  loading: false,
  loaded: false,
  error: null
});

export default function reducer(state = new ReducerRecord(), action) {
  const { type, payload, error } = action;

  switch (type) {
    case FETCH_ALL_REQUEST:
      return state.set("loading", true);

    case FETCH_ALL_SUCCESS:
      return state
        .set("loading", false)
        .set("loaded", true)
        .set("entities", new OrderedMap(payload))
        .set("error", null);

    case FETCH_ALL_ERROR:
      return state.set("loading", false).set("error", error);

    default:
      return state;
  }
}

/**
 * Selectors
 * */

/**
 * Action Creators
 * */

export function fetchAll() {
  return {
    type: FETCH_ALL_REQUEST
  };
}

/**
 * Sagas
 * */

export const fetchAllSaga = function*() {
  while (true) {
    try {
      yield take(FETCH_ALL_REQUEST);

      const ref = firebase.database().ref("events");

      const data = yield call([ref, ref.once], "value");

      yield put({
        type: FETCH_ALL_SUCCESS,
        payload: data.val()
      });
    } catch (error) {
      yield put({
        type: FETCH_ALL_ERROR,
        error
      });
    }
  }
};

export function* saga() {
  yield all([fetchAllSaga()]);
}
