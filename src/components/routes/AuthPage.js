import React, { Component } from "react";
import { Route, NavLink } from "react-router-dom";
import SignInForm from "../auth/SignInForm";
import SignUpForm from "../auth/SignUpForm";

export default class AuthPage extends Component {
  handleSignIn = (values) => console.log(values);

  handleSignUp = (values) => console.log(values);

  render() {
    return (
      <div>
        <h1>Auth Page</h1>
        <ul>
          <li>
            <NavLink to="/auth/signin" activeStyle={{ color: "red" }}>
              Sign In
            </NavLink>
          </li>
          <li>
            <NavLink to="/auth/signup" activeStyle={{ color: "red" }}>
              Sign Up
            </NavLink>
          </li>
        </ul>
        <Route path="/auth/signin" render={() => <SignInForm onSubmit={this.handleSignIn} />} />
        <Route path="/auth/signup" render={() => <SignUpForm onSubmit={this.handleSignUp} />} />
      </div>
    );
  }
}
