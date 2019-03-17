// import firebase from "firebase";
import firebase from "firebase/app";
import "firebase/auth";
import { Record } from "immutable";
import { all, cps, call, put, take, takeEvery } from "redux-saga/effects";
import { push } from "connected-react-router";
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
export const SIGN_OUT_REQUEST = `${appName}/${moduleName}/SIGN_OUT_REQUEST`;
export const SIGN_OUT_SUCCESS = `${appName}/${moduleName}/SIGN_OUT_SUCCESS`;

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

    case SIGN_OUT_SUCCESS:
      return new ReducerRecord();

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

/*
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
*/

export const watchStatusChange = function*() {
  const auth = firebase.auth();

  // call расчитывает что на выходе будет promise и он подождёт ывполнения этого промиса, а cps позволяет работать с коллбэками в нодовском стиле, тоесть первым аргументом ожидается ошибка, но метод onAuthStateChanged() всегда возвращает только один аргумент(user'a), нода сочтёт этот аргумент как ошибку(на самом деле там будет user) и пробросит в catch, собственно в блоке catch мы и задиспатчим action SIGN_IN_SUCCESS
  // этот вариант просто для примера!!!, по-хорошему так делать не стоит, но такая возможность есть
  try {
    yield cps([auth, auth.onAuthStateChanged]);
  } catch (user) {
    yield put({
      type: SIGN_IN_SUCCESS,
      payload: { user }
    });
  }
};

export const signOut = () => {
  return {
    type: SIGN_OUT_REQUEST
  };
};

export const signOutSaga = function*() {
  const auth = firebase.auth();

  try {
    yield call([auth, auth.signOut]);

    yield put({
      type: SIGN_OUT_SUCCESS
    });

    yield put(push("/auth/signin"));
  } catch (error) {
    console.log(error);
  }
};

// общая сага, другой вариант использования, напишем свою самостоятельную сагу и вызываем её
export const saga = function*() {
  yield all([signUpSaga(), watchStatusChange(), takeEvery(SIGN_OUT_REQUEST, signOutSaga)]);
};
