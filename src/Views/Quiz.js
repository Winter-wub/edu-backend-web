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
import { FormProvider, useForm } from "react-hook-form";
import Spelling from "../Components/Spelling";
import Matching from "../Components/Matching";

const TooltipAnswer = ({ answers }) => {
  return (
    <div>
      {answers.map((ans, id) => (
        <div key={id} className="list-group-item">
          No:{+ans.no + 1} Ans: {ans.answers}
        </div>
      ))}
    </div>
  );
};

export default function Quiz() {
  const [load, setLoad] = useState(true);
  const [quiz, setQuiz] = useState([]);
  const [sortBy, setSortBy] = useState("desc");
  const [select, setSelect] = useState(null);
  const [selectQuestion, setSelectQuestions] = useState(null);
  const [answerFromStudents, setAnsFromStudents] = useState([]);
  const [selectStudent, setSelectStudent] = useState(null);
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
                .orderBy("created_at", "asc")
                .get();

              return {
                ...data,
                ref: item,
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

  const fetchAnswerFromStudents = async (selectQuizReference) => {
    try {
      const getAllStudent = async () => {
        const studentsRef = await firestore
          .collection(config.collections.students)
          .get();
        return studentsRef.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      };

      const getAnswersFromStds = async (students) => {
        const stdWithAnswer = students.map(async (std) => {
          const answers = await firestore
            .collection(config.collections.students)
            .doc(std.id)
            .collection("answers")
            .where("quiz_id", "==", selectQuizReference.ref)
            .orderBy("start_at", "desc")
            .get();
          return {
            ...std,
            answers: answers.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
              start_at: doc.data().start_at.toDate(),
            })),
          };
        });

        return await Promise.all(stdWithAnswer);
      };

      const studentsData = await getAllStudent();
      const stdWithAns = await getAnswersFromStds(studentsData);
      setAnsFromStudents(stdWithAns);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchQuestionBySelectQuizId = async () => {
    try {
      const quizRef = firestore
        .collection(config.collections.quiz)
        .doc(select.id);
      const quizData = await quizRef
        .collection("questions")
        .orderBy("created_at", "asc")
        .get();
      setSelect((prev) => ({
        ...prev,
        questions: quizData.docs.map((item) => ({
          id: item.id,
          ...item.data(),
          ref: quizRef,
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

  const handleSelect = async (data) => {
    setSelect(data);
    await fetchAnswerFromStudents(data.ref);
  };

  const saveQuestion = async (data) => {
    try {
      const result = await swal.fire({
        icon: "info",
        text: "Save Confirm",
        showCancelButton: true,
      });
      if (result.value) {
        let payload = {};
        if (!select.type || select.type === "choice") {
          payload = {
            ...data,
            answer_index: data.answer_index.value,
            updated_at: new Date(),
          };
        } else if (select.type === "spelling") {
          payload = {
            ...data,
            updated_at: new Date(),
          };
        } else if (select.type === "matching") {
          payload = {
            Categories: data.Categories.map((e) => e.value),
            answers: data.Categories.reduce((prev, cat, i) => {
              const answers = cat.answers.map((e) => ({
                type: "text",
                text: e.text,
                category_index: i,
              }));
              return [...prev, ...answers];
            }, []),
            updated_at: new Date(),
          };
        }
        await firestore
          .collection(config.collections.quiz)
          .doc(select.id)
          .collection("questions")
          .doc(selectQuestion.id)
          .set(payload, { merge: true });
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
      if (!select.type || select.type === "choice") {
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
      } else if (select.type === "spelling") {
        await firestore
          .collection(config.collections.quiz)
          .doc(select.id)
          .collection("questions")
          .add({
            question: "",
            answer: "",
            created_at: new Date(),
          });
      } else if (select.type === "matching") {
        await firestore
          .collection(config.collections.quiz)
          .doc(select.id)
          .collection("questions")
          .add({
            question: "",
            answers: [],
            Categories: [],
            created_at: new Date(),
          });
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

  const addQuiz = async (type) => {
    try {
      const ref = await firestore.collection(config.collections.quiz).add({
        thumbnail:
          "https://cdn.iconscout.com/icon/free/png-256/no-image-1771002-1505134.png",
        title: "Untitled",
        created_at: new Date(),
        updated_at: new Date(),
        type,
      });
      if (type === "choice") {
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
      } else if (type === "spelling") {
        await firestore
          .collection(config.collections.quiz)
          .doc(ref.id)
          .collection("questions")
          .add({
            answer: "",
            question: "",
            created_at: new Date(),
          });
      } else if (type === "matching") {
        await firestore
          .collection(config.collections.quiz)
          .doc(ref.id)
          .collection("questions")
          .add({
            answers: [],
            question: "",
            Categories: [],
            created_at: new Date(),
          });
      }
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
        await fetchAllQuiz();
      }
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

  const closeSelectQuiz = () => {
    setSelect(null);
    setSelectQuestions(null);
    setAnsFromStudents([]);
    setSelectStudent(null);
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
                      onClick={closeSelectQuiz}
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row g-1">
                    <div className="col-lg-3">
                      <QuizInfo select={select} saveQuiz={saveQuiz} />
                    </div>
                    <div className="col-lg-3">
                      <div
                        className="d-flex flex-column overflow-auto"
                        style={{ height: 250 }}
                      >
                        <div className="text-primary h4 rounded p-1">
                          Who have done exercise
                        </div>
                        {answerFromStudents?.map((ele) => (
                          <div
                            className={`card mb-1 ${
                              ele.id === selectStudent?.id ? "bg-dark" : ""
                            } `}
                            key={ele.id}
                            onClick={() => setSelectStudent(ele)}
                          >
                            <div className="card-body">
                              <div className="d-flex flex-column">
                                <div className="text-secondary h6 stretched-link">
                                  {ele.fullname}
                                  <span className="ml-1 text-success h6">
                                    Done: {ele.answers.length}
                                  </span>
                                </div>
                                <div className="text-secondary small">
                                  Latest Done:
                                  {moment(ele?.answers?.[0]?.start_at).format(
                                    "DD/MM/YYYY hh:mm"
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )) ?? ""}
                      </div>
                    </div>
                    {selectStudent && (
                      <div className="col">
                        <div className="card">
                          <div className="card-header">
                            Select: {selectStudent.fullname}
                          </div>
                          <div className="card-body">
                            <div
                              className="overflow-auto"
                              style={{ height: 300 }}
                            >
                              {selectStudent?.answers?.map((ans) => {
                                const id = ans.id.replace(/[0-9]/g, "");
                                return (
                                  <div
                                    className="accordion"
                                    key={ans.id}
                                    id={`${id}-accordion`}
                                  >
                                    <div className="card">
                                      <div
                                        className="card-header"
                                        id={`${id}-header`}
                                      >
                                        <button
                                          className="btn btn-link btn-block text-left"
                                          data-toggle="collapse"
                                          data-target={`#${id}-collapse`}
                                          aria-controls={`${id}-collapse`}
                                          type="button"
                                        >
                                          <div className="small text-secondary">
                                            Done at{" "}
                                            {moment(ans.start_at).format(
                                              "DD/MM/YYYY hh:mm"
                                            )}
                                          </div>
                                          <div className="text-success">
                                            Correct: {ans?.correct}
                                          </div>
                                        </button>
                                      </div>
                                      <div
                                        id={`${id}-collapse`}
                                        className="collapse"
                                        aria-labelledby={`${id}-header`}
                                        data-parent={`#${id}-accordion`}
                                      >
                                        <div className="card-body">
                                          <TooltipAnswer
                                            answers={ans.answers}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="row mt-2 g-1">
                    <div className="col-3">
                      <div className="p-2 bg-secondary rounded">
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
                            {select.questions.map(
                              ({ Categories, ...item }, id) => (
                                <li
                                  key={item.id}
                                  className={`list-group-item ${
                                    selectQuestion?.id === item.id
                                      ? "active"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    let setFields = {
                                      ...item,
                                    };
                                    if (Categories) {
                                      setFields = {
                                        ...setFields,
                                        Categories: Categories.map(
                                          (value, i) => ({
                                            value,
                                            answers: item.answers.filter(
                                              (e) => +e.category_index === i
                                            ),
                                          })
                                        ),
                                      };
                                    }
                                    methodsForQuestion.reset(setFields);
                                    setSelectQuestions(item);
                                  }}
                                >
                                  No.{id + 1}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                    {selectQuestion && (
                      <FormProvider {...methodsForQuestion}>
                        {select.type === "spelling" && (
                          <Spelling
                            selectQuestion={selectQuestion}
                            saveQuestion={saveQuestion}
                            deleteQuestion={deleteQuestion}
                          />
                        )}
                        {(!select.type ||
                          select.type === "" ||
                          select.type === "choice") && (
                          <Question
                            selectQuestion={selectQuestion}
                            selectQuiz={select}
                            setSelectQuestion={setSelectQuestions}
                            saveQuestion={saveQuestion}
                            deleteQuestion={deleteQuestion}
                          />
                        )}
                        {select.type === "matching" && (
                          <Matching
                            selectQuestion={selectQuestion}
                            deleteQuestion={deleteQuestion}
                            saveQuestion={saveQuestion}
                          />
                        )}
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
