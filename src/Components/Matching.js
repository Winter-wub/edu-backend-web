import React from "react";
import { FaPlus, FaRegTrashAlt } from "react-icons/fa";
import { useFieldArray, useFormContext } from "react-hook-form";

function Answers({ control, namePrefix, register }) {
  const { fields, remove, append } = useFieldArray({
    control,
    name: namePrefix,
  });
  return (
    <div className="row align-items-center">
      {fields.map((ans, i) => (
        <div key={i} className="col-2">
          <div className="card bg-success m-1 p-1">
            <div className="input-group">
              <input
                className="form-control"
                defaultValue={ans.text}
                name={`${namePrefix}[${i}].text`}
                ref={register({ required: true })}
              />
              <button className="btn btn-danger" onClick={() => remove(i)}>
                <FaRegTrashAlt />
              </button>
            </div>
          </div>
        </div>
      ))}
      <div className="col-2">
        <button className="btn btn-success" onClick={() => append()}>
          <FaPlus /> Add Answer
        </button>
      </div>
    </div>
  );
}

export default function Matching(props) {
  const { selectQuestion, deleteQuestion, saveQuestion } = props;
  const { register, handleSubmit, errors, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "Categories",
  });
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
          <div className="d-flex flex-column g-1">
            {fields.map((field, i) => (
              <div key={field.id} className="card m-1">
                <div className="card-header">
                  <div className="input-group">
                    <label className="input-group-text">Group Name</label>
                    <input
                      className="form-control"
                      name={`Categories[${i}].value`}
                      defaultValue={field.value}
                      ref={register({ required: true })}
                    />
                    <button
                      className="btn btn-danger"
                      onClick={() => remove(i)}
                    >
                      <FaRegTrashAlt />
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <Answers
                    control={control}
                    register={register}
                    namePrefix={`Categories[${i}].answers`}
                    field={field}
                  />
                </div>
              </div>
            ))}
            <div
              className="btn btn-outline-success m-1"
              onClick={() => append()}
            >
              <FaPlus /> Add Group
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
