import { createStore, applyMiddleware } from "redux";
import { routerMiddleware } from "connected-react-router";
import thunk from "redux-thunk";
import createSagaMiddleware from "redux-saga";
import logger from "redux-logger";
import reducer from "./reducer";
import history from "../history";
import { saga } from "../ducks/people";

const sagaMiddleware = createSagaMiddleware();

const enhancer = applyMiddleware(sagaMiddleware, thunk, routerMiddleware(history), logger);

const store = createStore(reducer, enhancer);

window.store = store;

sagaMiddleware.run(saga);

export default store;

// browser console
// store.getState().auth.user
// store.getState().auth.toJS()
// store.getState().people.toJS()
// store.getState().people.entities.toJS()
