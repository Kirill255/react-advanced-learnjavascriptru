import { Record, List } from "immutable";
import { put, call, takeEvery } from "redux-saga/effects";
import { reset } from "redux-form";
import { appName } from "../config";
import { generateId } from "./utils";

const ReducerState = Record({
  entities: new List([])
});

const PersonRecord = Record({
  id: null,
  firstName: null,
  lastName: null,
  email: null
});

export const moduleName = "people";
const prefix = `${appName}/${moduleName}`;
export const ADD_PERSON = `${prefix}/ADD_PERSON`;
export const ADD_PERSON_REQUEST = `${prefix}/ADD_PERSON_REQUEST`;

export default (state = new ReducerState(), action) => {
  const { type, payload } = action;

  switch (type) {
    case ADD_PERSON:
      return state.update("entities", (entities) => entities.push(new PersonRecord(payload)));

    default:
      return state;
  }
};

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

// вспомогательная сага, в которой мы добавляем сайд-эффект
export const addPersonSaga = function*(action) {
  const id = yield call(generateId);

  yield put({
    type: ADD_PERSON,
    payload: { ...action.payload, id }
  });

  yield put(reset("person"));
};

// общая сага
// каждый раз когда происходит action ADD_PERSON_REQUEST, выполнять addPersonSaga сагу
export const saga = function*() {
  yield takeEvery(ADD_PERSON_REQUEST, addPersonSaga);
};
