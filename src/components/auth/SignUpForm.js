import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import emailValidator from "email-validator";
import CustomField from "./CustomField";

const validate = ({ email, password }) => {
  const errors = {};

  if (!email) {
    errors.email = "Email is required";
  } else if (!emailValidator.validate(email)) {
    errors.email = "Invalid email";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 5) {
    errors.password = "To short";
  }

  return errors;
};

class SignUpForm extends Component {
  render() {
    const { handleSubmit } = this.props;

    return (
      <div>
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <Field id="email" name="email" component={CustomField} type="email" />
          <Field id="password" name="password" component={CustomField} type="password" />

          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
}

export default reduxForm({
  form: "auth",
  validate
})(SignUpForm);
