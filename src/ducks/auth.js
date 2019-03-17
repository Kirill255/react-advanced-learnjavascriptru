// import firebase from "firebase";
import firebase from "firebase/app";
import "firebase/auth";
import { Record } from "immutable";
import { all, call, put, take } from "redux-saga/effects";
import { appName } from "../config";
// import store from "../redux"; // подключили внизу внутри функции onAuthStateChanged(), потому что были проблемы из-за циклических зависимостей

const ReducerRecord = Record({
  user: null,
  error: null,
  loading: false
});

export const moduleName = "auth";
export const SIGN_UP_REQUEST = `${appName}/${moduleName}/SIGN_UP_REQUEST`;
export const SIGN_UP_SUCCESS = `${appName}/${moduleName}/SIGN_UP_SUCCESS`;
export const SIGN_UP_ERROR = `${appName}/${moduleName}/SIGN_UP_ERROR`;
export const SIGN_IN_SUCCESS = `${appName}/${moduleName}/SIGN_IN_SUCCESS`;

export default (state = new ReducerRecord(), action) => {
  const { type, payload, error } = action;

  switch (type) {
    case SIGN_UP_REQUEST:
      return state.set("loading", true);

    // case SIGN_UP_SUCCESS: теперь нам достаточно реагировать только на SIGN_IN_SUCCESS, потому что мы подписались на onAuthStateChanged(), после успешного SIGN_UP_SUCCESS у нас изменится состояние пользователя в firebase, и вызовется onAuthStateChanged() в котором диспатчится SIGN_IN_SUCCESS
    case SIGN_IN_SUCCESS:
      return state
        .set("loading", false)
        .set("user", payload.user)
        .set("error", null);

    case SIGN_UP_ERROR:
      return state.set("loading", false).set("error", error);

    default:
      return state;
  }
};

/*
// action with thunk
export const signUp = (email, password) => (dispatch) => {
  dispatch({
    type: SIGN_UP_REQUEST
  });

  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((user) =>
      dispatch({
        type: SIGN_UP_SUCCESS,
        payload: { user }
      })
    )
    .catch((error) =>
      dispatch({
        type: SIGN_UP_ERROR,
        error
      })
    );
};
*/

// чистый action
export const signUp = (email, password) => {
  return {
    type: SIGN_UP_REQUEST,
    payload: { email, password }
  };
};

// вспомогательная самостоятельная сага
export const signUpSaga = function*() {
  const auth = firebase.auth(); // сохраняем контекст, т.к. у нас метод createUserWithEmailAndPassword() вызывается вот так firebase.auth().createUserWithEmailAndPassword(email, password), тоесть мы должны вызвать его в правильном контексте

  // цикл нужен чтобы сага выполнялась на каждый SIGN_UP_REQUEST, а не только один раз, т.к. мы используем take, а не takeEvery
  while (true) {
    const action = yield take(SIGN_UP_REQUEST); // реагируем только на SIGN_UP_REQUEST action, а например take("*");  - это реагировать на все

    // вызываем createUserWithEmailAndPassword в контексте auth, и передаём аргументы email и password, вот так call([context, method], arg1, arg2, ...), ещё есть apply(obj, obj.method, [arg1, arg2, ...])
    try {
      const user = yield call(
        [auth, auth.createUserWithEmailAndPassword],
        action.payload.email,
        action.payload.password
      );

      yield put({
        type: SIGN_UP_SUCCESS,
        payload: { user }
      });
    } catch (error) {
      yield put({
        type: SIGN_UP_ERROR,
        error
      });
    }
  }
};

// auto sign in
firebase.auth().onAuthStateChanged((user) => {
  const store = require("../redux").default;

  if (user) {
    // User is signed in.
    store.dispatch({
      type: SIGN_IN_SUCCESS,
      payload: { user }
    });
  }
});

// общая сага, другой вариант использования, напишем свою самостоятельную сагу и вызываем её
export const saga = function*() {
  yield all([signUpSaga()]);
};
