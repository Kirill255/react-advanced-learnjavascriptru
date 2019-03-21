import React, { Component } from "react";
import { connect } from "react-redux";
import { moduleName } from "../../ducks/people";
import PeopleList from "../people/PeopleList";
import Loader from "../common/Loader";

class AdminPage extends Component {
  render() {
    const { loading } = this.props;

    return (
      <div>
        <h1>Admin Page</h1>
        {loading ? <Loader /> : null}
        <PeopleList />
      </div>
    );
  }
}

export default connect((state) => ({
  loading: state[moduleName].loading
}))(AdminPage);
