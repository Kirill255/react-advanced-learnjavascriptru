import firebase from "firebase/app";
import "firebase/database";
import { Record, OrderedMap, OrderedSet } from "immutable";
import { all, take, call, put, select, takeEvery } from "redux-saga/effects";
import { createSelector } from "reselect";
import { appName } from "../config";
import { fbDatatoEntities } from "./utils";

/**
 * Constants
 * */
export const moduleName = "events";
const prefix = `${appName}/${moduleName}`;

export const FETCH_ALL_REQUEST = `${prefix}/FETCH_ALL_REQUEST`;
export const FETCH_ALL_SUCCESS = `${prefix}/FETCH_ALL_SUCCESS`;
export const FETCH_ALL_ERROR = `${prefix}/FETCH_ALL_ERROR`;
export const FETCH_LAZY_REQUEST = `${prefix}/FETCH_LAZY_REQUEST`;
export const FETCH_LAZY_START = `${prefix}/FETCH_LAZY_START`;
export const FETCH_LAZY_SUCCESS = `${prefix}/FETCH_LAZY_SUCCESS`;
export const FETCH_LAZY_ERROR = `${prefix}/FETCH_LAZY_ERROR`;
export const SELECT_EVENT = `${prefix}/SELECT_EVENT`;
export const DELETE_EVENT_REQUEST = `${prefix}/DELETE_EVENT_REQUEST`;
export const DELETE_EVENT_SUCCESS = `${prefix}/DELETE_EVENT_SUCCESS`;

/**
 * Reducer
 * */
export const ReducerRecord = Record({
  entities: new OrderedMap({}),
  selected: new OrderedSet([]),
  loading: false,
  loaded: false,
  error: null
});

export const EventRecord = Record({
  uid: null,
  title: null,
  url: null,
  where: null,
  when: null,
  month: null,
  submissionDeadline: null
});

export default function reducer(state = new ReducerRecord(), action) {
  const { type, payload, error } = action;

  switch (type) {
    case FETCH_ALL_REQUEST:
    case FETCH_LAZY_START:
    case DELETE_EVENT_REQUEST:
      return state.set("loading", true);

    case FETCH_ALL_SUCCESS:
      return state
        .set("loading", false)
        .set("loaded", true)
        .set("entities", fbDatatoEntities(payload, EventRecord))
        .set("error", null);

    case FETCH_LAZY_SUCCESS:
      return state
        .set("loading", false)
        .mergeIn(["entities"], fbDatatoEntities(payload, EventRecord))
        .set("loaded", Object.keys(payload).length < 10)
        .set("error", null);

    case FETCH_ALL_ERROR:
    case FETCH_LAZY_ERROR:
      return state.set("loading", false).set("error", error);

    case SELECT_EVENT:
      return state.selected.contains(payload.uid)
        ? state.update("selected", (selected) => selected.remove(payload.uid))
        : state.update("selected", (selected) => selected.add(payload.uid));

    case DELETE_EVENT_SUCCESS:
      return state
        .set("loading", false)
        .deleteIn(["entities", payload.uid])
        .update("selected", (selected) => selected.remove(payload.uid));

    default:
      return state;
  }
}

/**
 * Selectors
 * */

export const stateSelector = (state) => state[moduleName];
export const entitiesSelector = createSelector(
  stateSelector,
  (state) => state.entities
);
export const eventListSelector = createSelector(
  entitiesSelector,
  (entities) => entities.valueSeq().toArray()
);
export const sectionSelector = createSelector(
  stateSelector,
  (state) => state.selected
);
export const selectedEventsSelector = createSelector(
  entitiesSelector,
  sectionSelector,
  (entities, selection) => selection.toArray().map((uid) => entities.get(uid))
);
export const idSelector = (_, props) => props.uid;
export const eventSelector = createSelector(
  entitiesSelector,
  idSelector,
  (entities, id) => entities.get(id)
);

/**
 * Action Creators
 * */

export function fetchAll() {
  return {
    type: FETCH_ALL_REQUEST
  };
}

export function fetchLazy() {
  return {
    type: FETCH_LAZY_REQUEST
  };
}

export function selectEvent(uid) {
  return {
    type: SELECT_EVENT,
    payload: { uid }
  };
}

export function deleteEvent(uid) {
  return {
    type: DELETE_EVENT_REQUEST,
    payload: { uid }
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

export const fetchLazySaga = function*() {
  while (true) {
    try {
      yield take(FETCH_LAZY_REQUEST);

      // select позволяет достать текущее состояние стора, а мы возьмём не состояние всего стора, а только состояние именно этой утки с помощью селектора stateSelector
      const state = yield select(stateSelector);

      if (state.loading || state.loaded) continue;
      // if (state.loaded) return;

      yield put({
        type: FETCH_LAZY_START
      });

      const lastEvent = state.entities.last();

      const ref = firebase
        .database()
        .ref("events")
        .orderByKey()
        .limitToFirst(10)
        .startAt(lastEvent ? lastEvent.uid : "");

      const data = yield call([ref, ref.once], "value");

      yield put({
        type: FETCH_LAZY_SUCCESS,
        payload: data.val()
      });
    } catch (error) {
      yield put({
        type: FETCH_LAZY_ERROR,
        error
      });
    }
  }
};

export const deleteEventSaga = function*(action) {
  const { payload } = action;
  const ref = firebase.database().ref(`events/${payload.uid}`);

  try {
    yield call([ref, ref.remove]);

    yield put({
      type: DELETE_EVENT_SUCCESS,
      payload
    });
  } catch (_) {}
};

export function* saga() {
  yield all([
    /* fetchAllSaga(),  */ fetchLazySaga(),
    takeEvery(DELETE_EVENT_REQUEST, deleteEventSaga)
  ]);
}
