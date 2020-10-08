import {
  FaArrowDown,
  FaArrowUp,
  FaPenFancy,
  FaRegTrashAlt,
} from "react-icons/fa";
import React, { useState } from "react";
import Select from "react-select";

export default function QuizList({
  select,
  handleSelect,
  quiz,
  addQuiz,
  deleteQuiz,
  sortBy,
  handleOrderby,
}) {
  const createQuizTypeOptions = ["choice", "spelling"].map((i) => ({
    label: i,
    value: i,
  }));

  const [create, setCreate] = useState(null);

  return (
    <div className="card">
      <div className="card-header">
        <div className="w-25">
          <Select
            styles={{
              placeholder: () => ({
                color: "#28a745",
                fontWeight: 5,
              }),
            }}
            isSearchable={false}
            value={create}
            options={createQuizTypeOptions}
            placeholder="📦 Create Exercise"
            onChange={async ({ value }) => {
              setCreate(value);
              await addQuiz(value);
              setCreate(null);
            }}
          />
        </div>
      </div>
      <div className="card-body">
        <table className="table">
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Title</th>
              <th>Type</th>
              <th>Question</th>
              <th>
                <button className="btn" onClick={handleOrderby}>
                  {sortBy === "desc" && <FaArrowUp />}
                  {sortBy === "asc" && <FaArrowDown />}
                  <span className="ml-1">Creation Date</span>
                </button>
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {quiz.map((item) => (
              <tr
                key={item.id}
                className={`${select?.id === item.id ? "bg-info" : ""}`}
              >
                <td>
                  <img
                    className="img-thumbnail"
                    src={item.thumbnail}
                    alt={item.id}
                    style={{ width: 100, height: 100 }}
                  />
                </td>
                <td>{item.title}</td>
                <td>{item?.type ?? "choice"}</td>
                <td>{item.questionNum}</td>
                <td>{item.created_at}</td>
                <td>
                  <div className="d-flex">
                    <button
                      className="btn btn-primary mr-1"
                      onClick={() => handleSelect(item)}
                    >
                      <FaPenFancy />
                    </button>
                    <button
                      className="btn btn-outline-danger mr-1"
                      onClick={() => deleteQuiz(item.id)}
                    >
                      <FaRegTrashAlt />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
