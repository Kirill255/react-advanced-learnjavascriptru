import firebase from "firebase/app";
import "firebase/database";
import conferences from "./conferences";

export const saveEventsToFB = () => {
  const eventsRef = firebase.database().ref("/events");
  conferences.forEach((conference) => eventsRef.push(conference));
};

// эта функция нам нужна только чтобы заполнить данными наше базу в firebase и не делать это руками, это чисто для нашего удобства, мы поместили в переменнюу window.runMigration функцию, которую можем вызвать прямо из консоле браузера `runMigration();`, и наша база в firebase заполнится начальными данными, после нужно удалить её или закомментировать
/*
window.runMigration = function() {
  firebase
    .database()
    .ref("/events")
    .once("value", (data) => {
      if (!data.val()) {
        saveEventsToFB();
      }
    });
};
*/
