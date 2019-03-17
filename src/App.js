import React, { Component } from "react";
import { Route, NavLink } from "react-router-dom";
import AdminPage from "./components/routes/AdminPage";
import PersonPage from "./components/routes/PersonPage";
import AuthPage from "./components/routes/AuthPage";
import ProtectedRoute from "./components/ProtectedRoute";

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
            <NavLink to="/people" activeStyle={{ color: "red" }}>
              People
            </NavLink>
          </li>
          <li>
            <NavLink to="/auth" activeStyle={{ color: "red" }}>
              Auth
            </NavLink>
          </li>
        </ul>
        <ProtectedRoute path="/admin" component={AdminPage} />
        <ProtectedRoute path="/people" component={PersonPage} />
        <Route path="/auth" component={AuthPage} />
      </div>
    );
  }
}

export default App;
