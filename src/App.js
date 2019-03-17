import React, { Component } from "react";
import { Route, Link } from "react-router-dom";
import AdminPage from "./components/routes/AdminPage";
import AuthPage from "./components/routes/AuthPage";

class App extends Component {
  render() {
    return (
      <div>
        <h1>Hello world</h1>
        <ul>
          <li>
            <Link to="/admin">Admin</Link>
          </li>
          <li>
            <Link to="/auth">Auth</Link>
          </li>
        </ul>
        <Route path="/admin" component={AdminPage} />
        <Route path="/auth" component={AuthPage} />
      </div>
    );
  }
}

export default App;
