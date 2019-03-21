import { connect } from "react-redux";
import React, { Component } from "react";
import SelectedEventCard from "./SelectedEventCard";
import { selectedEventsSelector } from "../../ducks/events";

class SelectedEvents extends Component {
  render() {
    const { events } = this.props;
    if (!events.length)
      return (
        <div>
          <h2>No selected events yet!</h2>
        </div>
      );

    return (
      <div>
        <h2>Selected events</h2>
        <div>
          {events.map((event) => (
            <SelectedEventCard event={event} key={event.uid} />
          ))}
        </div>
      </div>
    );
  }
}

export default connect((state) => ({
  events: selectedEventsSelector(state)
}))(SelectedEvents);
