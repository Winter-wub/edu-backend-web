import React, { useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";
import config from "../config.json";
import { auth } from "../Utils/firebase";

export default function Header() {
  const history = useHistory();
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (!user) {
        history.push("/login");
      }
    });
  }, [history]);

  const handleLoginOut = async () => {
    await auth.signOut();
  };
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/">
          {config.app.title}
          <div className="badge bg-primary ml-1">Admin Tool</div>
        </NavLink>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink className="nav-link" to="/categories">
                Contents
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/quiz">
                Exercises
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/students">
                Students
              </NavLink>
            </li>
          </ul>
        </div>
        <div className="ml-auto">
          <button className="btn btn-outline-danger" onClick={handleLoginOut}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
