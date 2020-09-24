import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "bootstrap/scss/bootstrap.scss";

import Home from "./Views/Home";
import Login from "./Views/Login";
import Categories from "./Views/Categories";
import Students from "./Views/Students";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/categories" component={Categories} />
        <Route path="/students" component={Students} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
