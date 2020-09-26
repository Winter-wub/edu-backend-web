import React from "react";
import { useForm } from "react-hook-form";

export default function QuizInfo({ select, saveQuiz }) {
  const { register, handleSubmit } = useForm();

  return (
    <div className="d-flex flex-column bg-info p-2 rounded">
      <div className="mb-3">
        <label className="form-label">Title: </label>
        <input
          className="form-control"
          name="title"
          defaultValue={select.title}
          ref={register({ required: true })}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Thumbnail: </label>
        <input
          className="form-control"
          name="thumbnail"
          defaultValue={select.thumbnail}
          ref={register({ required: true })}
        />
      </div>
      <button
        className="btn btn-primary align-self-center"
        onClick={handleSubmit(saveQuiz)}
      >
        Save Quiz Info
      </button>
    </div>
  );
}
