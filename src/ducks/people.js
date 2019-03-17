import { Record, List } from "immutable";
import { appName } from "../config";

const ReducerState = Record({
  entities: new List([])
});

const PersonRecord = Record({
  id: null,
  firstName: null,
  lastName: null,
  email: null
});

export const moduleName = "people";
const prefix = `${appName}/${moduleName}`;
export const ADD_PERSON = `${prefix}/ADD_PERSON`;

export default (state = new ReducerState(), action) => {
  const { type, payload } = action;

  switch (type) {
    case ADD_PERSON:
      return state.update("entities", (entities) =>
        entities.push(new PersonRecord(payload.person))
      );

    default:
      return state;
  }
};

export const addPerson = (person) => (dispatch) => {
  dispatch({
    type: ADD_PERSON,
    payload: {
      person: { id: Date.now(), ...person }
    }
  });
};
