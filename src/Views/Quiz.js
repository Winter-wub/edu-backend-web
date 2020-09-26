import React, { useCallback, useEffect, useState } from "react";
import Header from "../Components/Header";
import config from "../config.json";
import { firestore } from "../Utils/firebase";
import moment from "moment";
import { FaPlus, FaTimes } from "react-icons/fa";
import Question from "../Components/Question";
import QuizInfo from "../Components/QuizInfo";
import QuizList from "../Components/QuizList";
import swal from "sweetalert2";
import { useForm, FormProvider } from "react-hook-form";

export default function Quiz() {
  const [load, setLoad] = useState(true);
  const [quiz, setQuiz] = useState([]);
  const [sortBy, setSortBy] = useState("desc");
  const [select, setSelect] = useState(null);
  const [selectQuestion, setSelectQuestions] = useState(null);
  const methodsForQuestion = useForm();

  const fetchAllQuiz = useCallback(() => {
    (async () => {
      try {
        setLoad(true);
        const quizRef = await firestore.collection(config.collections.quiz);
        const quizMapped = await Promise.all(
          (await quizRef.orderBy("created_at", sortBy).get()).docs.map(
            async (item) => {
              const data = item.data();
              const questions = await firestore
                .collection(config.collections.quiz)
                .doc(item.id)
                .collection("questions")
                .get();

              return {
                ...data,
                id: item.id,
                created_at:
                  data && data.created_at
                    ? moment(data.created_at.toDate()).format(
                        "DD/MM/YYYY hh:mm"
                      )
                    : "-",
                questionNum: questions.docs.length,
                questions: questions.docs.map((item) => ({
                  id: item.id,
                  ...item.data(),
                })),
              };
            }
          )
        );

        setQuiz(quizMapped);
      } catch (e) {
        console.log(e);
      } finally {
        setLoad(false);
      }
    })();
  }, [sortBy]);

  const fetchQuestionBySelectQuizId = async () => {
    try {
      const quizData = await firestore
        .collection(config.collections.quiz)
        .doc(select.id)
        .collection("questions")
        .orderBy("created_at", "asc")
        .get();
      setSelect((prev) => ({
        ...prev,
        questions: quizData.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })),
      }));
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchAllQuiz();
    })();
  }, [sortBy, fetchAllQuiz]);

  const handleSelect = (data) => {
    setSelect(data);
  };

  const saveQuestion = async (data) => {
    try {
      const result = await swal.fire({
        icon: "info",
        text: "Save Confirm",
        showCancelButton: true,
      });
      if (result.value) {
        await firestore
          .collection(config.collections.quiz)
          .doc(select.id)
          .collection("questions")
          .doc(selectQuestion.id)
          .set(
            {
              ...data,
              answer_index: data.answer_index.value,
              updated_at: new Date(),
            },
            { merge: true }
          );
        setSelectQuestions(null);
        await fetchQuestionBySelectQuizId();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const deleteQuestion = async (id) => {
    try {
      const result = await swal.fire({
        icon: "error",
        text: "Confirm Delete This Question",
        showCancelButton: true,
      });

      if (result.value) {
        await firestore
          .collection(config.collections.quiz)
          .doc(select.id)
          .collection("questions")
          .doc(id)
          .delete();
      }
      await fetchQuestionBySelectQuizId();
    } catch (e) {
      console.log(e);
      await swal.fire({
        text: "Please try again",
        icon: "error",
      });
    }
  };

  const addQuestion = async () => {
    try {
      await firestore
        .collection(config.collections.quiz)
        .doc(select.id)
        .collection("questions")
        .add({
          choices: ["answer 1", "answer 2", "answer 3", "answer 4"],
          question: "",
          answer_index: 0,
          created_at: new Date(),
        });
      await fetchQuestionBySelectQuizId();
    } catch (e) {
      console.log(e);
      await swal.fire({
        text: "Please try again",
        icon: "error",
      });
    }
  };

  const addQuiz = async () => {
    try {
      const ref = await firestore.collection(config.collections.quiz).add({
        thumbnail:
          "https://cdn.iconscout.com/icon/free/png-256/no-image-1771002-1505134.png",
        title: "Untitled",
        created_at: new Date(),
        updated_at: new Date(),
      });

      await firestore
        .collection(config.collections.quiz)
        .doc(ref.id)
        .collection("questions")
        .add({
          choices: ["answer 1", "answer 2", "answer 3", "answer 4"],
          question: "",
          answer_index: 0,
          created_at: new Date(),
        });
      await fetchAllQuiz();
    } catch (e) {
      console.log(e);
    }
  };

  const saveQuiz = async (data) => {
    try {
      const result = await swal.fire({
        icon: "info",
        text: "Save Confirm",
        showCancelButton: true,
      });
      if (result.value) {
        await firestore
          .collection(config.collections.quiz)
          .doc(select.id)
          .set(
            {
              ...data,
              updated_at: new Date(),
            },
            { merge: true }
          );
        setSelect(null);
        await fetchAllQuiz();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const deleteQuiz = async (id) => {
    try {
      const result = await swal.fire({
        icon: "error",
        text: "Confirm Delete This Exercise",
        showCancelButton: true,
      });

      if (result.value) {
        await firestore.collection(config.collections.quiz).doc(id).delete();
      }
      await fetchAllQuiz();
    } catch (e) {
      console.log(e);
      await swal.fire({
        text: "Please try again",
        icon: "error",
      });
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
        <div className="row mt-3 g-2">
          <div className={`col ${select ? "d-none" : ""}`}>
            {!load && (
              <QuizList
                select={select}
                handleSelect={handleSelect}
                quiz={quiz}
                addQuiz={addQuiz}
                deleteQuiz={deleteQuiz}
                sortBy={sortBy}
                handleOrderby={handleOrderby}
              />
            )}
          </div>
          {select && (
            <div className="col">
              <div className="card">
                <div className="card-header">
                  <div className="d-flex">
                    <div className="h4">{select.title}</div>
                    <button
                      className="btn btn-danger rounded-circle ml-auto"
                      onClick={() => setSelect(null)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row justify-content-center">
                    <div className="col-lg-3">
                      <QuizInfo select={select} saveQuiz={saveQuiz} />
                    </div>
                  </div>
                  <div className="row mt-2 pt-2 bg-secondary rounded">
                    <div className="col-3">
                      <div className="mb-3 d-flex">
                        <h3 className="text-light">Questions</h3>
                        <button
                          className="btn btn-success ml-auto"
                          onClick={addQuestion}
                        >
                          <FaPlus /> Add Question
                        </button>
                      </div>
                      <div
                        className="overflow-auto mb-3"
                        style={{ height: 300 }}
                      >
                        <ul className="list-group">
                          {select.questions.map((item, id) => (
                            <li
                              key={item.id}
                              className={`list-group-item ${
                                selectQuestion?.id === item.id ? "active" : ""
                              }`}
                              onClick={() => {
                                methodsForQuestion.reset({
                                  choices: item.choices,
                                  question: item.question,
                                });
                                setSelectQuestions(item);
                              }}
                            >
                              No.{id + 1}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {selectQuestion && (
                      <FormProvider {...methodsForQuestion}>
                        <Question
                          selectQuestion={selectQuestion}
                          selectQuiz={select}
                          setSelectQuestion={setSelectQuestions}
                          saveQuestion={saveQuestion}
                          deleteQuestion={deleteQuestion}
                        />
                      </FormProvider>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
