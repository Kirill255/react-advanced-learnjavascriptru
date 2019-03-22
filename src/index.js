import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { DragDropContextProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { ConnectedRouter } from "connected-react-router";
import store from "./redux";
import history from "./history";
import "./index.css";
import App from "./App";
import "./config"; // initializeApp
// import "./mocks"; // подключили временно чтобы инициализировать начальные данные, по идее после инициализации можно вообще удалить и подключение и папку mocks
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(
  <Provider store={store}>
    <DragDropContextProvider backend={HTML5Backend}>
      <ConnectedRouter history={history}>
        <App />
      </ConnectedRouter>
    </DragDropContextProvider>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

/*
ConnectedRouter лучше помещать всегда непосредственно над app без других прослоек или могут быть баги
*/
