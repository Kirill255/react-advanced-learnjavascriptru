import React, { Component } from "react";
import { DropTarget } from "react-dnd";
import { connect } from "react-redux";
import { Motion, spring, presets } from "react-motion";
import { deleteEvent, stateSelector } from "../../ducks/events";
import { deletePerson } from "../../ducks/people";
import Loader from "./Loader";

class Trash extends Component {
  render() {
    const { connectDropTarget, isOver, loading } = this.props;

    const style = {
      border: `1px solid ${isOver ? "green" : "black"}`,
      width: 100,
      height: 100,
      position: "fixed",
      top: 0,
      right: 0
    };

    return (
      <Motion
        defaultStyle={{ opacity: 0 }}
        style={{
          opacity: spring(1, {
            damping: presets.noWobble.damping * 4,
            stiffness: presets.noWobble.stiffness / 2
          })
        }}
      >
        {(interpolatingStyle) =>
          connectDropTarget(
            <div style={{ ...style, ...interpolatingStyle }}>
              Trash
              {loading && <Loader />}
            </div>
          )
        }
      </Motion>
    );
  }
}

const spec = {
  drop(props, monitor) {
    const itemACMapping = {
      event: props.deleteEvent,
      person: props.deletePerson
    };

    const item = monitor.getItem();
    const itemType = monitor.getItemType();

    itemACMapping[itemType](item.uid);
  }
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver()
});

export default connect(
  (state) => ({
    loading: stateSelector(state).loading
  }),
  { deleteEvent, deletePerson }
)(DropTarget(["event", "person"], spec, collect)(Trash));
