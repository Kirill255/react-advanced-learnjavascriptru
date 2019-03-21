import React, { Component } from "react";

export default class PersonCard extends Component {
  render() {
    const { person, style } = this.props;

    return (
      <div style={{ width: 200, height: 100, ...style }}>
        <h3>
          {person.firstName}&nbsp;{person.lastName}
        </h3>
        <p>{person.email}</p>
      </div>
    );
  }
}
