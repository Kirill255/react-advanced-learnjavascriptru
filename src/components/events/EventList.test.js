import React from "react";
import { shallow, mount } from "enzyme";
import { EventList } from "./EventList";
import Loader from "../common/Loader";
import events from "../../mocks/conferences";
import { EventRecord } from "../../ducks/events";

const testEvents = events.map(
  (event) => new EventRecord({ ...event, uid: Math.random().toString() })
);

describe("EventList test", () => {
  // As of Enzyme v3, the shallow API does call React lifecycle methods such as componentDidMount and componentDidUpdate

  it("should be render loader", () => {
    const container = shallow(<EventList loading />, { disableLifecycleMethods: true });

    expect(container.contains(<Loader />));
  });

  it("should be render event list", () => {
    const container = shallow(<EventList events={testEvents} />, { disableLifecycleMethods: true });

    const rows = container.find(".test--event-list__row");

    expect(rows.length).toEqual(testEvents.length);
  });

  it("should be request fetch data", (done) => {
    // можно использовать и shallow т.к. теперь он по умолчнию вызывает lifecycle методы componentDidMount ...
    shallow(<EventList events={[]} fetchAll={done} />);
    // раньше нужно было использовать mount, т.к. shallow делал только поверхностный рендер компонента
    // mount(<EventList events={[]} fetchAll={done} />);
  });

  it("should be select event", () => {
    let seleted = null;
    const selectEvent = (uid) => (seleted = uid);

    const container = mount(
      <EventList events={testEvents} fetchAll={() => {}} selectEvent={selectEvent} />
    );

    container
      .find(".test--event-list__row")
      .first()
      .simulate("click");

    expect(seleted).toEqual(testEvents[0].uid);
  });
});
