import React, { useEffect, useState } from "react";
import Header from "../Components/Header";
import { firestore } from "../Utils/firebase";
import { Controller, useForm } from "react-hook-form";
import MDEditor from "@uiw/react-md-editor";
import swal from "sweetalert2";
import config from "../config.json";
import moment from "moment";
import {
  FaArrowDown,
  FaArrowUp,
  FaCopy,
  FaPenFancy,
  FaRegTrashAlt,
} from "react-icons/fa";

export default function Categories() {
  const [courses, setCourses] = useState([]);
  const [type, setType] = useState("videos");
  const [load, setLoad] = useState(false);
  const [select, setSelect] = useState(null);
  const { register, control, handleSubmit } = useForm();
  const [sortBy, setSortBy] = useState("desc");

  const fetchCourses = async () => {
    if (type !== "") {
      try {
        setLoad(true);
        const categoriesRef = firestore.collection(
          config.collections.categories
        );
        const coursesRef = await categoriesRef
          .doc(type)
          .collection("courses")
          .orderBy("created_at", sortBy)
          .get();
        const coursesData = coursesRef.docs.map((item) => {
          const data = item.data();
          return {
            ...data,
            id: item.id,
            created_at:
              data && data.created_at
                ? moment(data.created_at.toDate()).format("DD/MM/YYYY hh:mm")
                : "-",
          };
        });
        console.log(coursesData);
        setCourses(coursesData);
      } catch (e) {
        console.log(e);
      } finally {
        setLoad(false);
      }
    }
  };

  useEffect(() => {
    (async () => {
      await fetchCourses();
    })();
  }, [type, sortBy]);
  const handleEdit = (data) => {
    setSelect(data);
  };
  const onClickMode = (mode) => {
    setType(mode);
    setSelect(null);
  };
  const handleSave = async (data) => {
    try {
      setLoad(true);
      const result = await swal.fire({
        icon: "question",
        text: "คุณแน่ใจแล้วใช่ไหมที่จะบันทึก",
        showCancelButton: true,
      });
      if (result.value) {
        await firestore
          .collection(config.collections.categories)
          .doc(type)
          .collection("courses")
          .doc(select.id)
          .set(
            {
              ...data,
              updated_at: new Date(),
            },
            { merge: true }
          );
        setSelect(null);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoad(false);
      await fetchCourses();
    }
  };
  const duplicate = async (data) => {
    try {
      setLoad(true);
      await firestore
        .collection(config.collections.categories)
        .doc(type)
        .collection("courses")
        .add({ ...data, created_at: new Date(), updated_at: new Date() });
    } catch (e) {
      console.log(e);
      await swal.fire({
        icon: "error",
        text: "กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setLoad(false);
      await fetchCourses();
    }
  };
  const remove = async (data) => {
    try {
      setLoad(true);
      const result = await swal.fire({
        text: "แน่ใจแล้วใช่ไหมที่จะลบ",
        icon: "warning",
        showCancelButton: true,
      });
      if (result.value) {
        await firestore
          .collection(config.collections.categories)
          .doc(type)
          .collection("courses")
          .doc(data.id)
          .delete();
        await fetchCourses();
      }
    } catch (e) {
      console.log(e);
      await swal.fire({
        text: "กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setLoad(false);
    }
  };
  const handleOrderby = () => {
    if (sortBy === "desc") {
      setSortBy("asc");
    } else {
      setSortBy("desc");
    }
  };
  return (
    <>
      <Header />
      <div className="container-fluid">
        <div className="d-flex mt-3 flex-column">
          <div className="d-flex mt-3 justify-content-center align-items-center">
            <div className="h4 mr-2">Mode</div>
            <div className="d-flex">
              <button
                disabled={load}
                className={`btn ${
                  type !== "videos" ? "btn-secondary" : "btn-outline-secondary"
                } mr-1`}
                onClick={() => onClickMode("videos")}
              >
                Video
              </button>
              <button
                disabled={load}
                className={`btn ${
                  type !== "essays" ? "btn-secondary" : "btn-outline-secondary"
                } mr-1`}
                onClick={() => onClickMode("essays")}
              >
                Essay
              </button>
              <button
                disabled={load}
                className={`btn ${
                  type !== "vocab" ? "btn-secondary" : "btn-outline-secondary"
                } mr-1`}
                onClick={() => onClickMode("vocab")}
              >
                Vocabulary
              </button>
            </div>
          </div>
          <div className="row mt-3 g-2">
            <div className="col-6">
              {type !== "" && (
                <div className="card">
                  <div className="card-body">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Thumbnail</th>
                          <th>ID</th>
                          <th>Title</th>
                          <th>Type</th>
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
                        {courses.map((item) => (
                          <tr
                            className={`${
                              select?.id === item.id ? "bg-info" : ""
                            }`}
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
                            <td>
                              <button className="btn"> {item.id} </button>
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
              )}
            </div>
            {select && (
              <div className="col">
                <div className="card">
                  <div className="card-header">
                    <div className="d-flex justify-content-center align-content-center">
                      <div className="h4">{select.title}</div>
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
                      <label className="form-label">Title:</label>
                      <input
                        name="title"
                        defaultValue={select.title}
                        className="form-control"
                        ref={register}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Thumbnail:</label>
                      <input
                        name="thumbnail"
                        defaultValue={select.thumbnail}
                        className="form-control"
                        ref={register}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Type:</label>
                      <input
                        name="type"
                        defaultValue={select.type}
                        className="form-control"
                        ref={register}
                      />
                    </div>
                    {type === "videos" && (
                      <div className="mb-2">
                        <label className="form-label">Video Url:</label>
                        <input
                          name="video_url"
                          defaultValue={select.video_url}
                          className="form-control"
                          ref={register}
                        />
                      </div>
                    )}
                    <div className="mb-2">
                      <label className="form-label">Content:</label>
                      <Controller
                        defaultValue={select.content}
                        name="content"
                        control={control}
                        as={<MDEditor />}
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
