import React from "react";
import { useFormContext } from "react-hook-form";
import { FaRegTrashAlt } from "react-icons/fa";

export default function Spelling({
  selectQuestion,
  saveQuestion,
  deleteQuestion,
}) {
  const { register, handleSubmit, errors } = useFormContext();
  return (
    <div className="col">
      <div className="card">
        <div className="card-header">
          <div className="input-group">
            <label className="input-group-text">Question</label>
            <input
              name="question"
              placeholder="Question"
              className="form-control"
              defaultValue={selectQuestion.question}
              ref={register({
                required: true,
              })}
            />
            <button
              className="btn btn-danger"
              onClick={() => deleteQuestion(selectQuestion.id)}
            >
              <FaRegTrashAlt />
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col col-lg-3">
              <label className="form-label">Answer</label>
              <input
                defaultValue={selectQuestion.answer}
                name="answer"
                className="form-control"
                ref={register({
                  required: true,
                })}
              />
            </div>
          </div>
        </div>
        <div className="card-footer">
          <div className="d-inline-flex">
            <button
              className="btn btn-primary mr-3"
              onClick={handleSubmit(saveQuestion)}
            >
              Save
            </button>
            {Object.keys(errors).length > 0 && (
              <div className="small text-danger">
                กรุณากรอกข้อมูลให้ครบทุกช่อง
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
