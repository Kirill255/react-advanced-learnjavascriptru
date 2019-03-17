import React, { Component } from "react";
import { Route, NavLink } from "react-router-dom";
import AdminPage from "./components/routes/AdminPage";
import AuthPage from "./components/routes/AuthPage";

class App extends Component {
  render() {
    return (
      <div>
        <h1>Hello world</h1>
        <ul>
          <li>
            <NavLink to="/admin" activeStyle={{ color: "red" }}>
              Admin
            </NavLink>
          </li>
          <li>
            <NavLink to="/auth" activeStyle={{ color: "red" }}>
              Auth
            </NavLink>
          </li>
        </ul>
        <Route path="/admin" component={AdminPage} />
        <Route path="/auth" component={AuthPage} />
      </div>
    );
  }
}

export default App;
