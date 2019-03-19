import React, { Component } from "react";
import { Route, NavLink, Link } from "react-router-dom";
import { connect } from "react-redux";
import { moduleName, signOut } from "./ducks/auth";
import AdminPage from "./components/routes/AdminPage";
import PersonPage from "./components/routes/PersonPage";
import AuthPage from "./components/routes/AuthPage";
import EventsPage from "./components/routes/EventsPage";
import ProtectedRoute from "./components/ProtectedRoute";

class App extends Component {
  render() {
    const { signOut, signedIn } = this.props;

    const btn = signedIn ? (
      <button onClick={signOut}>Sign Out</button>
    ) : (
      <Link to="/auth/signin">Sign In</Link>
    );

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
          <li>
            <NavLink to="/events" activeStyle={{ color: "red" }}>
              Events
            </NavLink>
          </li>
        </ul>
        {btn}
        <ProtectedRoute path="/admin" component={AdminPage} />
        <ProtectedRoute path="/people" component={PersonPage} />
        <ProtectedRoute path="/events" component={EventsPage} />
        <Route path="/auth" component={AuthPage} />
      </div>
    );
  }
}

export default connect(
  (state) => ({
    signedIn: !!state[moduleName].user
  }),
  { signOut },
  null,
  { pure: false }
)(App);
