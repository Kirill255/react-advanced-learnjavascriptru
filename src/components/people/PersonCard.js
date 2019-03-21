import React, { Component } from "react";
import { DragSource } from "react-dnd";

class PersonCard extends Component {
  render() {
    const { person, style, connectDragSource, isDragging } = this.props;

    const draggStyle = {
      backgroundColor: isDragging ? "grey" : "white"
    };

    return connectDragSource(
      <div style={{ width: 200, height: 100, ...draggStyle, ...style }}>
        <h3>
          {person.firstName}&nbsp;{person.lastName}
        </h3>
        <p>{person.email}</p>
      </div>
    );
  }
}

const spec = {
  beginDrag(props) {
    return {
      uid: props.person.uid
    };
  }
};

const collect = (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
});

export default DragSource("person", spec, collect)(PersonCard);

/*
export default DragSource(type, spec, collect)(MyComponent)
type - строка, название перетаскиваемого элемента, придумываем сами
spec - объект с настройками, beginDrag() - обязательный метод в котором описываем перетаскиваемый элемент, информация об источнике перетаскивания
collect - функция которая вернёт пропсы, которые мы получим в компоненте
*/

/* перетаскивать за любую цасть карточки, мы обернули всю карточку целиком
return connectDragSource(
<div style={{ width: 200, height: 100, ...draggStyle, ...style }}>
  <h3>
    {person.firstName}&nbsp;{person.lastName}
  </h3>
  <p>{person.email}</p>
</div>
);
*/

/* перетаскивать только за заголовок, мы обернули только заголовок
return (
  <div style={{ width: 200, height: 100, ...draggStyle, ...style }}>
    {connectDragSource(
      <h3>
        {person.firstName}&nbsp;{person.lastName}
      </h3>
    )}
    <p>{person.email}</p>
  </div>
);
*/
