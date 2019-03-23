import { connect } from "react-redux";
import React, { Component } from "react";
import { TransitionMotion, spring } from "react-motion";
import SelectedEventCard from "./SelectedEventCard";
import { selectedEventsSelector } from "../../ducks/events";

class SelectedEvents extends Component {
  // описание всех наших объектов(эвентов): у эвента есть стили с opacity: 1, есть key, есть какая-то data
  getStyles() {
    return this.props.events.map((event) => ({
      style: {
        opacity: spring(1, { stiffness: 50 })
      },
      key: event.uid,
      data: event
    }));
  }

  // исчезновение, как будет выглядеть элемент когда он уберётся, к чему должны прийти
  willLeave = () => ({
    opacity: spring(0, { stiffness: 100 })
  });

  // появление, как будет выглядеть элемент в момент появление, с чего начинается анимация
  willEnter = () => ({
    opacity: 0
  });

  render() {
    const { events } = this.props;

    return (
      <div>
        <h2>{!events.length ? "No selected events yet!" : "Selected events"}</h2>
        {
          <TransitionMotion
            styles={this.getStyles()}
            willLeave={this.willLeave}
            willEnter={this.willEnter}
          >
            {(interpolated) => (
              <div>
                {interpolated.map((config) => (
                  <div style={config.style} key={config.key}>
                    <SelectedEventCard event={config.data} />
                  </div>
                ))}
              </div>
            )}
          </TransitionMotion>
        }
      </div>
    );
  }
}

export default connect((state) => ({
  events: selectedEventsSelector(state)
}))(SelectedEvents);
