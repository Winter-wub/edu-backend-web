import { FaPenFancy, FaRegTrashAlt } from "react-icons/fa";
import React from "react";

export default function QuizList({ select, handleSelect, quiz }) {
  return (
    <div className="card">
      <div className="card-body">
        <table className="table">
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Title</th>
              <th>Question</th>
              <th>Created At</th>
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
                    <button className="btn btn-outline-danger mr-1">
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
