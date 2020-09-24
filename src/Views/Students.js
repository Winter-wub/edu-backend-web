import React, { useEffect, useState } from "react";
import Header from "../Components/Header";
import { firestore } from "../Utils/firebase";
import config from "../config.json";
import { FaArrowDown, FaArrowUp, FaPenFancy } from "react-icons/fa";
import moment from "moment";
import { useForm } from "react-hook-form";
import swal from "sweetalert2";

export default function Students() {
  const [sortBy, setSortBy] = useState("desc");
  const [students, setStudents] = useState([]);
  const [select, setSelect] = useState(null);
  const [load, setLoad] = useState(true);
  const { handleSubmit, register } = useForm();
  const fetchStudents = async () => {
    try {
      setLoad(true);
      const studentsRef = await firestore
        .collection(config.collections.students)
        .orderBy("created_at", sortBy)
        .get();
      const studentsData = studentsRef.docs.map((item) => ({
        ...item.data(),
        id: item.id,
        birth_date: moment(item.data().birth_date.toDate()).format(
          "YYYY-MM-DD"
        ),
        created_at:
          item && item?.data()?.created_at
            ? moment(item.data().created_at.toDate()).format("DD/MM/YYYY hh:mm")
            : "-",
      }));
      setStudents(studentsData);
      setLoad(false);
    } catch (e) {
      console.log(e);
      await fetchStudents();
    } finally {
      setLoad(false);
    }
  };
  const handleEdit = (data) => {
    setSelect(data);
  };
  useEffect(() => {
    (async () => {
      await fetchStudents();
    })();
  }, [sortBy]);
  const handleOrderby = () => {
    if (sortBy === "desc") {
      setSortBy("asc");
    } else {
      setSortBy("desc");
    }
  };
  const handleSave = async (data) => {
    try {
      const result = await swal.fire({
        icon: "info",
        text: "บันทึกข้อมูลไหม",
        showCancelButton: true,
      });
      if (result.value) {
        await firestore
          .collection(config.collections.students)
          .doc(select.id)
          .set({
            ...data,
            updated_at: new Date(),
          });
      }
      await fetchStudents();
    } catch (e) {
      await swal.fire({
        icon: "error",
        text: "กรุณาลองใหม่อีกครั้ง",
      });
    }
  };
  return (
    <>
      <Header />
      <div className="container-fluid ">
        <div className="d-flex mt-3 flex-column">
          <div className="row">
            <div className="col">
              {!load && (
                <div className="card">
                  <div className="card-body">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Email</th>
                          <th>Fullname</th>
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
                        {students.map((item) => (
                          <tr
                            className={`${
                              select?.id === item.id ? "bg-info" : ""
                            }`}
                            key={item.id}
                          >
                            <td>{item.email}</td>
                            <td>{item.fullname}</td>
                            <td>{item.created_at}</td>
                            <td>
                              <div className="d-flex">
                                <button
                                  className="btn btn-primary mr-1"
                                  onClick={() => handleEdit(item)}
                                >
                                  <FaPenFancy />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            {select && (
              <div className="col-4">
                <div className="card">
                  <div className="card-header">
                    <div className="d-flex justify-content-center align-content-center">
                      <div className="h4">{select.fullname}</div>
                      <button
                        className="btn btn-primary ml-auto"
                        onClick={handleSubmit(handleSave)}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="mb-2">
                      <label className="form-label">Fullname:</label>
                      <input
                        name="fullname"
                        defaultValue={select.fullname}
                        className="form-control"
                        ref={register}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Email:</label>
                      <input
                        disabled
                        name="email"
                        defaultValue={select.email}
                        className="form-control"
                        ref={register}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Birth Date:</label>
                      <input
                        type="date"
                        name="birth_date"
                        defaultValue={select.birth_date}
                        className="form-control"
                        ref={register}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
