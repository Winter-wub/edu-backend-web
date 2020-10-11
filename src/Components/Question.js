import { FaRegTrashAlt } from "react-icons/fa";
import Select from "react-select";
import React from "react";
import { useFormContext, Controller } from "react-hook-form";

const answersIndexOptions = [
  { label: 1, value: 0 },
  { label: 2, value: 1 },
  { label: 3, value: 2 },
  { label: 4, value: 3 },
];

export default function Question({
  selectQuestion,
  saveQuestion,
  deleteQuestion,
}) {
  const { register, control, handleSubmit, errors } = useFormContext();
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
            <div className="col-3">
              <label className="form-label">Answer</label>
              <Controller
                name="answer_index"
                defaultValue={answersIndexOptions.find(
                  (e) => e.value === selectQuestion.answer_index
                )}
                as={Select}
                options={answersIndexOptions}
                control={control}
                rules={{
                  required: true,
                }}
              />
            </div>
            <div className="col-5">
              <label className="form-label">
                Image URL (recommend size 480x380) optional
              </label>
              <input
                className="form-control"
                name="image_url"
                defaultValue={selectQuestion?.image_url}
                ref={register({ required: false })}
              />
            </div>
            <div className="col-12">
              <ul className="list-group">
                {selectQuestion.choices.map((choice, id) => (
                  <li className="list-group-item" key={id}>
                    <div className="input-group">
                      <label className="input-group-text">
                        Answer: {id + 1}
                      </label>
                      <input
                        name={`choices[${id}]`}
                        className="form-control"
                        defaultValue={choice}
                        ref={register({
                          required: true,
                        })}
                      />
                    </div>
                  </li>
                ))}
              </ul>
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
