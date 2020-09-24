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
  }, []);

  const handleLoginOut = async () => {
    await auth.signOut();
  };
  return (
    <nav className="navbar navbar-light bg-light">
      <div className="container-fluid">
        <NavLink to="/" className="navbar-brand">
          {config.app.title}
          <div className="badge bg-primary">Admin Tools</div>
        </NavLink>
        <ul className="navbar-nav">
          <li className="nav-item">
            <NavLink className="nav-link" to="/categories">
              Categories
            </NavLink>
          </li>
        </ul>
        <div className="d-flex ml-auto">
          <button className="btn btn-outline-danger" onClick={handleLoginOut}>
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
