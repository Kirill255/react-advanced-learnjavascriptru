import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";

class SignInForm extends Component {
  render() {
    const { handleSubmit } = this.props;

    return (
      <div>
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <Field id="email" name="email" component="input" type="email" />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <Field id="password" name="password" component="input" type="password" />
          </div>

          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
}

export default reduxForm({
  form: "auth"
})(SignInForm);

/*
<SignInForm onSubmit={this.handleSignIn} />
redux-form оборачивает props onSubmit, который мы передали в форму, и возвращает props handleSubmit, который теперь доступен как this.props.handleSubmit
*/
