import React, { Component } from "react";
import { Route, NavLink } from "react-router-dom";
import { connect } from "react-redux";
import SignInForm from "../auth/SignInForm";
import SignUpForm from "../auth/SignUpForm";
import { signUp, signIn, moduleName } from "../../ducks/auth";
import Loader from "../Loader";

class AuthPage extends Component {
  handleSignIn = ({ email, password }) => this.props.signIn(email, password);

  handleSignUp = ({ email, password }) => this.props.signUp(email, password);

  render() {
    const { loading } = this.props;

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
        {loading && <Loader />}
      </div>
    );
  }
}

export default connect(
  (state) => ({
    loading: state[moduleName].loading
  }),
  { signUp, signIn }
)(AuthPage);
