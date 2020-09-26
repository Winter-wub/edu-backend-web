import React from "react";
import { useForm } from "react-hook-form";

export default function QuizInfo({ select }) {
  const { register } = useForm();
  return (
    <div className="d-flex flex-column bg-info p-2 rounded">
      <div className="mb-3">
        <label className="form-label">Title: </label>
        <input
          className="form-control"
          name="title"
          defaultValue={select.title}
          ref={register}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Thumbnail: </label>
        <input
          className="form-control"
          name="thumbnail"
          defaultValue={select.thumbnail}
          ref={register}
        />
      </div>
      <button className="btn btn-primary align-self-center">
        Save Quiz Info
      </button>
    </div>
  );
}
