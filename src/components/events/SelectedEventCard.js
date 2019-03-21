import React, { Component } from "react";
import { DropTarget } from "react-dnd";
import { connect } from "react-redux";
import { addEventToPerson, peopleListSelector } from "../../ducks/people";

class EventCard extends Component {
  render() {
    const { connectDropTarget, hovered, canDrop, people } = this.props;
    const { title, when, where } = this.props.event;

    const dropStyle = {
      border: `1px solid ${canDrop ? "red" : "black"}`,
      backgroundColor: hovered ? "green" : "white"
    };

    const peopleElement = people && <p>{people.map((person) => person.email).join(", ")}</p>;

    return connectDropTarget(
      <div style={dropStyle}>
        <h3>{title}</h3>
        <div>
          {where}, {when}
          {peopleElement}
        </div>
      </div>
    );
  }
}

const spec = {
  drop(props, monitor) {
    // достаём uid, который положили в DragSource в spec в beginDrag()
    const personUid = monitor.getItem().uid;
    const eventUid = props.event.uid;

    // console.log("---", "event", eventUid, "person", personUid);
    props.addEventToPerson(eventUid, personUid);

    return { eventUid };
  }
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  canDrop: monitor.canDrop(),
  hovered: monitor.isOver()
});

export default connect(
  (state, props) => ({
    people: peopleListSelector(state).filter((person) => person.events.includes(props.event.uid))
  }),
  { addEventToPerson }
)(DropTarget(["person"], spec, collect)(EventCard));

/*
export default DropTarget(types, spec, collect)(MyComponent)
types - строка или массив, названия DragSource-элементов которые сюда можно перетаскивать
*/
