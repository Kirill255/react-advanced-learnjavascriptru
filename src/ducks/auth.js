// import firebase from "firebase";
import firebase from "firebase/app";
import "firebase/auth";
import { Record } from "immutable";
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
