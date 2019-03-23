import React, { Component } from "react";
import { connect } from "react-redux";
import { Table, Column } from "react-virtualized";
import { TransitionMotion, spring } from "react-motion";
import { peopleListSelector, fetchAllPeople } from "../../ducks/people";

export class PeopleTable extends Component {
  componentDidMount() {
    this.props.fetchAllPeople && this.props.fetchAllPeople();
  }

  componentDidUpdate({ people }) {
    if (people.length && this.props.people.length > people.length) {
      setTimeout(() => {
        this.table.scrollToRow(this.props.people.length);
      }, 0);
    }
  }

  getStyles = () =>
    this.props.people.map((person) => ({
      style: {
        opacity: spring(1)
      },
      key: person.uid,
      data: person
    }));

  willEnter = () => ({
    opacity: 0
  });

  setListRef = (ref) => (this.table = ref);

  rowGetter = ({ index }) => this.props.people[index];

  render() {
    if (!this.props.people.length) return null;

    return (
      <TransitionMotion styles={this.getStyles} willEnter={this.willEnter}>
        {(interpolatedStyles) => (
          <Table
            width={600}
            height={300}
            rowHeight={40}
            headerHeight={50}
            rowGetter={this.rowGetter}
            rowCount={interpolatedStyles.length}
            overscanRowCount={2}
            rowClassName="test--people-list__row"
            rowStyle={({ index }) => (index < 0 ? {} : interpolatedStyles[index].style)}
            ref={this.setListRef}
          >
            <Column label="First Name" dataKey="firstName" width={200} />
            <Column label="Last Name" dataKey="lastName" width={200} />
            <Column label="Email" dataKey="email" width={200} />
          </Table>
        )}
      </TransitionMotion>
    );
  }
}

export default connect(
  (state) => ({
    people: peopleListSelector(state)
  }),
  { fetchAllPeople }
)(PeopleTable);
