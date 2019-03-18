import firebase from "firebase/app";
import "firebase/auth";
import { take, call, put } from "redux-saga/effects";
import { push } from "connected-react-router";
import reducer, {
  signUpSaga,
  signOutSaga,
  signInSaga,
  SIGN_UP_REQUEST,
  SIGN_UP_SUCCESS,
  SIGN_UP_ERROR,
  SIGN_IN_REQUEST,
  SIGN_IN_SUCCESS,
  SIGN_IN_ERROR,
  SIGN_OUT_SUCCESS,
  ReducerRecord
} from "./auth";

/**
 * Saga tests
 * */

describe("Auth duck", () => {
  it("should sign up", () => {
    // создаём сагу
    const saga = signUpSaga();
    const auth = firebase.auth();
    // создаём тестовые данные
    const authData = {
      email: "lala@example.com",
      password: "12341234"
    };

    const user = {
      email: authData.email,
      uid: Math.random().toString()
    };

    const requestAction = {
      type: SIGN_UP_REQUEST,
      payload: authData
    };
    // проверяем что мы ожидаем конкретно SIGN_UP_REQUEST
    expect(saga.next().value).toEqual(take(SIGN_UP_REQUEST));
    // затем что вызовется правильная функция
    expect(saga.next(requestAction).value).toEqual(
      call([auth, auth.createUserWithEmailAndPassword], authData.email, authData.password)
    );
    // затем ожидаем что мы отправим правильный action в reducer
    expect(saga.next(user).value).toEqual(
      put({
        type: SIGN_UP_SUCCESS,
        payload: { user }
      })
    );

    const error = new Error();
    // saga.next() - это перейти к следующему yield, а saga.throw() - имитировать выброс ошибки
    // ожидаем что при ошибке, мы отправим правильный action
    expect(saga.throw(error).value).toEqual(
      put({
        type: SIGN_UP_ERROR,
        error
      })
    );
  });

  it("should sign in", () => {
    const saga = signInSaga();
    const auth = firebase.auth();
    const authData = {
      email: "lala@example.com",
      password: "12341234"
    };

    const user = {
      email: authData.email,
      uid: Math.random().toString()
    };

    const requestAction = {
      type: SIGN_IN_REQUEST,
      payload: authData
    };

    expect(saga.next().value).toEqual(take(SIGN_IN_REQUEST));

    expect(saga.next(requestAction).value).toEqual(
      call([auth, auth.signInWithEmailAndPassword], authData.email, authData.password)
    );

    expect(saga.next(user).value).toEqual(
      put({
        type: SIGN_IN_SUCCESS,
        payload: { user }
      })
    );

    const error = new Error();

    expect(saga.throw(error).value).toEqual(
      put({
        type: SIGN_IN_ERROR,
        error
      })
    );
  });

  it("should sign out", () => {
    const saga = signOutSaga();
    const auth = firebase.auth();

    expect(saga.next().value).toEqual(call([auth, auth.signOut]));
    expect(saga.next().value).toEqual(
      put({
        type: SIGN_OUT_SUCCESS
      })
    );
    expect(put(push("/auth/signin")));
  });

  /**
   * Reducer Tests
   * */

  it("should sign out", () => {
    const state = new ReducerRecord({
      user: {}
    });
    // что при SIGN_OUT_SUCCESS
    const newState = reducer(state, { type: SIGN_OUT_SUCCESS });
    // чистится стор
    expect(newState).toEqual(new ReducerRecord());
  });

  it("should sign in", () => {
    const state = new ReducerRecord();
    const user = {
      email: "lala@example.com",
      uid: Math.random().toString()
    };
    // что при SIGN_IN_SUCCESS
    const newState = reducer(state, {
      type: SIGN_IN_SUCCESS,
      payload: { user }
    });
    // в сторе будет юзер
    expect(newState).toEqual(new ReducerRecord({ user }));
  });
});
