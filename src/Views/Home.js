import React from "react";
// import Header from "../Components/Header";
import { Redirect } from "react-router-dom";

export default function Home() {
  return (
    <>
      <Redirect to="categories" />
    </>
  );
}
