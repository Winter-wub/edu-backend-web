import React from "react";
import { useForm } from "react-hook-form";
import { firestore, auth } from "../Utils/firebase";
import config from "../config.json";
import swal from "sweetalert2";
import { useHistory } from "react-router-dom";

export default function Login() {
  const { register, handleSubmit, errors } = useForm();
  const history = useHistory();

  const handleLogin = async (data) => {
    try {
      const users = await firestore
        .collection(config.collections.users)
        .where("email", "==", data.email)
        .get();
      if (users.empty) {
        await swal.fire({
          icon: "warning",
          text: "Email หรือ Password ไม่ถูกต้อง"
        });
      } else {
        await auth.signInWithEmailAndPassword(data.email, data.password);
        history.push("/");
      }
    } catch (e) {
      console.log(e);
      await swal.fire({
        icon: "error",
        text: "กรุณาลองใหม่อีกครั้ง"
      });
    }
  };
  return (
    <div className="container">
      <div className="w-50 mt-auto ml-auto mr-auto mb-auto">
        <div className="card mt-3">
          <div className="card-header">
            <div className="card-title">Admin Login</div>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit(handleLogin)}>
              <div className="mb-3">
                <label className="form-label">Email:</label>
                <input
                  defaultValue=""
                  name="email"
                  className="form-control"
                  placeholder="Email"
                  ref={register({
                    required: true
                  })}
                />
                {errors.email && (
                  <div className="invalid-feedback">Please enter email.</div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Password:</label>
                <input
                  defaultValue=""
                  name="password"
                  className="form-control"
                  placeholder="Password"
                  type="password"
                  ref={register({
                    required: true
                  })}
                />
                {errors.password && (
                  <div className="invalid-feedback">Please enter password.</div>
                )}
              </div>
              <button className="btn btn-primary" type="submit">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
