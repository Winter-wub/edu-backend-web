import {
  FaArrowDown,
  FaArrowUp,
  FaCopy,
  FaPenFancy,
  FaRegTrashAlt,
} from "react-icons/fa";
import React from "react";

export default function CourseList({
  handleOrderby,
  sortBy,
  courses,
  select,
  handleEdit,
  duplicate,
  remove,
}) {
  return (
    <div className="card">
      <div className="card-body">
        <table className="table">
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Title</th>
              <th>Type</th>
              <th>
                <button className="btn" onClick={handleOrderby}>
                  {sortBy === "desc" && <FaArrowUp />}
                  {sortBy === "asc" && <FaArrowDown />}
                  <span className="ml-1">Created At</span>
                </button>
              </th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((item) => (
              <tr
                className={`${select?.id === item.id ? "bg-info" : ""}`}
                key={item.id}
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
                <td>{item.type}</td>
                <td>{item.created_at}</td>
                <td>
                  <div className="d-flex">
                    <button
                      className="btn btn-primary mr-1"
                      onClick={() => handleEdit(item)}
                    >
                      <FaPenFancy />
                    </button>
                    <button
                      className="btn btn-warning mr-1"
                      onClick={() => duplicate(item)}
                    >
                      <FaCopy />
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => remove(item)}
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
