import firebase from "firebase/app";
import "firebase/database";
import { Record, OrderedMap } from "immutable";
import { eventChannel } from "redux-saga";
import {
  put,
  call,
  takeEvery,
  all,
  select,
  delay,
  fork,
  spawn,
  cancel,
  cancelled,
  /* race, */
  take
} from "redux-saga/effects";
import { reset } from "redux-form";
import { createSelector } from "reselect";
import { appName } from "../config";
import { fbDatatoEntities } from "./utils";

/**
 * Constants
 * */
export const moduleName = "people";
const prefix = `${appName}/${moduleName}`;

export const FETCH_ALL_REQUEST = `${prefix}/FETCH_ALL_REQUEST`;
export const FETCH_ALL_SUCCESS = `${prefix}/FETCH_ALL_SUCCESS`;
export const FETCH_ALL_ERROR = `${prefix}/FETCH_ALL_ERROR`;
export const ADD_PERSON_REQUEST = `${prefix}/ADD_PERSON_REQUEST`;
export const ADD_PERSON_SUCCESS = `${prefix}/ADD_PERSON_SUCCESS`;
export const ADD_PERSON_ERROR = `${prefix}/ADD_PERSON_ERROR`;
export const ADD_EVENT_REQUEST = `${prefix}/ADD_EVENT_REQUEST`;
export const ADD_EVENT_SUCCESS = `${prefix}/ADD_EVENT_SUCCESS`;
export const DELETE_PERSON_REQUEST = `${prefix}/DELETE_PERSON_REQUEST`;
export const DELETE_PERSON_SUCCESS = `${prefix}/DELETE_PERSON_SUCCESS`;

/**
 * Reducer
 * */
const ReducerState = Record({
  entities: new OrderedMap({}),
  loading: false,
  error: null
});

const PersonRecord = Record({
  uid: null,
  firstName: null,
  lastName: null,
  email: null,
  events: []
});

export default (state = new ReducerState(), action) => {
  const { type, payload, error } = action;

  switch (type) {
    case FETCH_ALL_REQUEST:
    case ADD_PERSON_REQUEST:
    case DELETE_PERSON_REQUEST:
      return state.set("loading", true);

    case ADD_PERSON_SUCCESS:
      return state
        .set("loading", false)
        .setIn(["entities", payload.uid], new PersonRecord(payload))
        .set("error", null);

    case FETCH_ALL_SUCCESS:
      return state
        .set("loading", false)
        .set("entities", fbDatatoEntities(payload, PersonRecord))
        .set("error", null);

    case FETCH_ALL_ERROR:
    case ADD_PERSON_ERROR:
      return state.set("loading", false).set("error", error);

    case ADD_EVENT_SUCCESS:
      return state.setIn(["entities", payload.personUid, "events"], payload.eventUids);

    case DELETE_PERSON_SUCCESS:
      return state.set("loading", false).deleteIn(["entities", payload.uid]);

    default:
      return state;
  }
};

/**
 * Selectors
 * */
export const stateSelector = (state) => state[moduleName];
export const entitiesSelector = createSelector(
  stateSelector,
  (state) => state.entities
);
export const idSelector = (_, props) => props.uid;
export const peopleListSelector = createSelector(
  entitiesSelector,
  (entities) => entities.valueSeq().toArray()
);
export const personSelector = createSelector(
  entitiesSelector,
  idSelector,
  (entities, id) => entities.get(id)
);

/**
 * Action Creators
 * */

/*
// кстати сдесь thunk нужен потому что id: Date.now() считается сайд-эффектом
export const addPerson = (person) => (dispatch) => {
  dispatch({
    type: ADD_PERSON,
    payload: {
      person: { id: Date.now(), ...person }
    }
  });
};
*/

// теперь наш action чистая функция, а сайд-эффекты мы делаем в саге
export const addPerson = (person) => {
  return {
    type: ADD_PERSON_REQUEST,
    payload: person
  };
};

export const fetchAllPeople = () => {
  return {
    type: FETCH_ALL_REQUEST
  };
};

export const addEventToPerson = (eventUid, personUid) => {
  return {
    type: ADD_EVENT_REQUEST,
    payload: { eventUid, personUid }
  };
};

export const deletePerson = (uid) => {
  return {
    type: DELETE_PERSON_REQUEST,
    payload: { uid }
  };
};

/**
 * Sagas
 * */

// вспомогательная сага, в которой мы добавляем сайд-эффект
export const addPersonSaga = function*(action) {
  const peopleRef = firebase.database().ref("people");

  try {
    const ref = yield call([peopleRef, peopleRef.push], action.payload);

    yield put({
      type: ADD_PERSON_SUCCESS,
      payload: { ...action.payload, uid: ref.key }
    });

    yield put(reset("person"));
  } catch (error) {
    yield put({
      type: ADD_PERSON_ERROR,
      error
    });
  }
};

export const fetchAllSaga = function*() {
  const peopleRef = firebase.database().ref("people");

  try {
    const data = yield call([peopleRef, peopleRef.once], "value");

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
};

export const addEventSaga = function*(action) {
  const { eventUid, personUid } = action.payload;
  const eventsRef = firebase.database().ref(`people/${personUid}/events`);
  const state = yield select(stateSelector);
  // const events = state.getIn(["entities", personUid, "events"]).concat(eventUid);

  // чтобы нельзя было одного и того же человека записать на event несколько раз
  const curEvents = state.getIn(["entities", personUid, "events"]);
  if (curEvents.includes(eventUid)) return;
  const eventUids = curEvents.concat(eventUid);

  try {
    yield call([eventsRef, eventsRef.set], eventUids);
    yield put({
      type: ADD_EVENT_SUCCESS,
      payload: {
        personUid,
        eventUids
      }
    });
  } catch (_) {}
};

export const deletePersonSaga = function*(action) {
  const { payload } = action;
  const ref = firebase.database().ref(`people/${payload.uid}`);

  try {
    yield call([ref, ref.remove]);

    yield put({
      type: DELETE_PERSON_SUCCESS,
      payload
    });
  } catch (_) {}
};

// синхронизация вкладок, обновляем стор каждые 5 сек, запрашиваем данные, ждём 5 секунд, и снова подгружаем свежие данные и т.д.
// если сага была отменена, то мы можем на это как-то среагировать, когда сага отменяется выбрасывается специальное исключение в той саге которая была отменена, и мы можем его поймать например в try/catch/finally, но такой блок ловит вообще любые исключения, тоесть это например может быть реально какая-то ошибка или ещё что-то, а мы хотим среагировать именно на момент отмены саги, и для это есть специальный эффект cancelled
export const backgroundSyncSaga = function*() {
  try {
    while (true) {
      yield call(fetchAllSaga);
      yield delay(2000);
    }
  } finally {
    if (yield cancelled()) {
      console.log("---", "cancelled backgroundSyncSaga saga");
    }
  }
};
/*
export const cancellableSync = function*() {

  const task = yield fork(backgroundSyncSaga);
  yield delay(6000);
  yield cancel(task);


  // all и race работают по аналогии с промисами, all ждёт выполнения всех саг и потом возвращает результат, а race ждёт первый вернувшийся ответ, возвращает его, а остальные саги отменяет, race это такой неявный случай использования отмены саг, а нашем случае sync: backgroundSyncSaga() это бесконечная сага, а delay: delay(6000) работает 6 секунд и когда проходит 6 cекунд у нас заканчивается delay сага, а все остальные race отменяет
  yield race({
    sync: realtimeSync(),
    delay: delay(6000)
  });
};
*/

// подключаем сагу в зависимости от роута, если роут people - включаем realtimeSync, если нет отключаем
export const cancellableSync = function*() {
  let task;
  while (true) {
    const { payload } = yield take("@@router/LOCATION_CHANGE");

    if (payload && payload.location.pathname.includes("people")) {
      task = yield fork(realtimeSync);
    } else if (task) {
      yield cancel(task);
    }
  }
};

// просто функция, которая подписывается на изменения в базе
const createPeopleSocket = () =>
  eventChannel((emmit) => {
    const ref = firebase.database().ref("people");
    const callback = (data) => emmit({ data });
    ref.on("value", callback);

    return () => {
      console.log("---", "unsubscribing");
      ref.off("value", callback);
    };
  });

export const realtimeSync = function*() {
  const chan = yield call(createPeopleSocket);
  try {
    while (true) {
      const { data } = yield take(chan);

      yield put({
        type: FETCH_ALL_SUCCESS,
        payload: data.val()
      });
    }
  } finally {
    yield call([chan, chan.close]); // chan.close отписывается от канала
    console.log("---", "cancelled realtime saga");
  }
};

// общая сага
// каждый раз когда происходит action ADD_PERSON_REQUEST, выполнять addPersonSaga сагу
export const saga = function*() {
  yield spawn(cancellableSync);

  yield all([
    takeEvery(ADD_PERSON_REQUEST, addPersonSaga),
    takeEvery(FETCH_ALL_REQUEST, fetchAllSaga),
    takeEvery(ADD_EVENT_REQUEST, addEventSaga),
    takeEvery(DELETE_PERSON_REQUEST, deletePersonSaga)
  ]);
};
