import { addPersonSaga, ADD_PERSON, ADD_PERSON_REQUEST } from "./people";
import { put, call } from "redux-saga/effects";
import { generateId } from "./utils";

describe("People duck", () => {
  it("should dispatch person with id", () => {
    const person = {
      firstName: "Roman",
      lastName: "Yacobchuk",
      email: "test@test.com"
    };

    const saga = addPersonSaga({
      type: ADD_PERSON_REQUEST,
      payload: person
    });

    // что перый next попросит сгенерировать id
    expect(saga.next().value).toEqual(call(generateId));

    const id = generateId();

    // что следующий next попросит задиспатчить action
    expect(saga.next(id).value).toEqual(
      put({
        type: ADD_PERSON,
        payload: { id, ...person }
      })
    );
  });
});
