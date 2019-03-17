import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import emailValidator from "email-validator";
import CustomField from "../common/CustomField";

const validate = ({ firstName, lastName, email }) => {
  const errors = {};

  if (!firstName) {
    errors.firstName = "FirstName is required";
  }

  if (!lastName) {
    errors.lastName = "LastName is required";
  }

  if (!email) {
    errors.email = "Email is required";
  } else if (!emailValidator.validate(email)) {
    errors.email = "Invalid email";
  }

  return errors;
};

class NewPersonForm extends Component {
  render() {
    const { handleSubmit } = this.props;

    return (
      <div>
        <form onSubmit={handleSubmit}>
          <Field id="firstName" name="firstName" component={CustomField} type="text" />
          <Field id="lastName" name="lastName" component={CustomField} type="text" />
          <Field id="email" name="email" component={CustomField} type="email" />

          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
}

export default reduxForm({
  form: "person",
  validate
})(NewPersonForm);
