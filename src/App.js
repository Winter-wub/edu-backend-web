import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import Home from "./Views/Home";
import Login from "./Views/Login";

function App() {
  return (
    <BrowserRouter>
      <Route exact path="/" component={Home} />
      <Route path="/login" component={Login} />
    </BrowserRouter>
  );
}

export default App;
