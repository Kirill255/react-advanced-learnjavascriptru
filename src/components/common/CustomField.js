import React from "react";

const CustomField = (props) => {
  const {
    input,
    id,
    type,
    meta: { error, touched }
  } = props;

  const errorText = touched && error && <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <label htmlFor={id}>{input.name.toUpperCase()}</label>
      <input {...input} id={id} type={type} />
      {errorText}
    </div>
  );
};

export default CustomField;
