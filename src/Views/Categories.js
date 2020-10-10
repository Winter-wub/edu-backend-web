import React, { useCallback, useEffect, useState } from "react";
import Header from "../Components/Header";
import { firestore } from "../Utils/firebase";
import { Controller, useForm } from "react-hook-form";
import MDEditor from "@uiw/react-md-editor";
import swal from "sweetalert2";
import config from "../config.json";
import moment from "moment";
import CourseList from "../Components/CourseList";
import Creatable from "react-select/creatable";
import { FaPlus } from "react-icons/all";

export default function Categories() {
  const [courses, setCourses] = useState([]);
  const [type, setType] = useState("videos");
  const [load, setLoad] = useState(false);
  const [select, setSelect] = useState(null);
  const { register, control, handleSubmit, reset } = useForm();
  const [sortBy, setSortBy] = useState("desc");
  const [typeOptions, setTypeOptions] = useState([]);
  const [isCreateType, setCreateType] = useState(false);

  const fetchCourses = useCallback(() => {
    (async () => {
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
          setCourses(coursesData);

          const appConfig = (
            await firestore
              .collection(config.collections.app_config)
              .doc("categories")
              .get()
          ).data();

          if (type === "videos") {
            setTypeOptions(
              appConfig.videos_type.map((i) => ({ label: i, value: i }))
            );
          } else if (type === "essays") {
            setTypeOptions(
              appConfig.essays_type.map((i) => ({ label: i, value: i }))
            );
          } else {
            setTypeOptions(
              appConfig.vocab_type.map((i) => ({ label: i, value: i }))
            );
          }
        } catch (e) {
          console.log(e);
        } finally {
          setLoad(false);
        }
      }
    })();
  }, [sortBy, type]);
  useEffect(() => {
    (async () => {
      await fetchCourses();
    })();
  }, [type, sortBy, fetchCourses]);
  const handleEdit = (data) => {
    reset({
      ...data,
      type: {
        label: data.type,
        value: data.type,
      },
    });
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
              type: data.type.value,
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
  const createType = (value, onChange) => {
    (async () => {
      try {
        setCreateType(true);
        const newOption = {
          value,
          label: value,
        };

        const newOptions = [...typeOptions, newOption];
        let data = {};
        if (type === "videos") {
          data = {
            videos_type: newOptions.map((i) => i.value),
          };
        } else if (type === "essays") {
          data = {
            essays_type: newOptions.map((i) => i.value),
          };
        } else {
          data = {
            vocal_type: newOptions.map((i) => i.value),
          };
        }
        await firestore
          .collection(config.collections.app_config)
          .doc("categories")
          .set(
            {
              ...data,
            },
            { merge: true }
          );
        setTypeOptions((prev) => [...prev, newOption]);
        onChange(newOption);
      } catch (e) {
        console.log(e);
      } finally {
        setCreateType(false);
      }
    })();
  };
  const createNewContent = async () => {
    await firestore
      .collection(config.collections.categories)
      .doc(type)
      .collection("courses")
      .add({
        title: "Untitled",
        created_at: new Date(),
        updated_at: new Date(),
        thumbnail:
          "https://cdn.iconscout.com/icon/free/png-256/no-image-1771002-1505134.png",
      });

    await fetchCourses();
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
            <div className="col-12">
              <button
                className="btn btn-success"
                onClick={createNewContent}
                disabled={load}
              >
                <FaPlus /> Create
              </button>
            </div>
            <div className="col-6">
              {type !== "" && (
                <CourseList
                  handleOrderby={handleOrderby}
                  sortBy={sortBy}
                  courses={courses}
                  select={select}
                  handleEdit={handleEdit}
                  duplicate={duplicate}
                  remove={remove}
                />
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
                      <Controller
                        name="type"
                        defaultValue={{
                          value: select.type,
                          label: select.type,
                        }}
                        control={control}
                        render={({ value, onChange }) => (
                          <Creatable
                            isDisabled={isCreateType}
                            isLoading={isCreateType}
                            value={value}
                            onChange={onChange}
                            options={typeOptions}
                            onCreateOption={(value) =>
                              createType(value, onChange)
                            }
                          />
                        )}
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
