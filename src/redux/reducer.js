import { combineReducers } from "redux";
import { connectRouter } from "connected-react-router";
import { reducer as formReducer } from "redux-form";
import history from "../history";
import authReducer, { moduleName as authModule } from "../ducks/auth";
import peopleReducer, { moduleName as peopleModule } from "../ducks/people";
import eventsReducer, { moduleName as eventsModule } from "../ducks/events";

export default combineReducers({
  router: connectRouter(history),
  form: formReducer,
  [authModule]: authReducer,
  [peopleModule]: peopleReducer,
  [eventsModule]: eventsReducer
});
