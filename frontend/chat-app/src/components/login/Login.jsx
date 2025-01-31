import React, { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../lib/upload";

const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const [loginLoading, setLoginLoading] = useState(false); // Separate loading state for login
  const [registerLoading, setRegisterLoading] = useState(false); // Separate loading state for registration

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterLoading(true); // Use register loading state
    const formData = new FormData(e.target);

    const { username, email, password } = Object.fromEntries(formData);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      const imgUrl = await upload(avatar.file);
      // const imgUrl = "https://hellowordl.com/";
      console.log(imgUrl);

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      toast.success("Account created! You can login now!");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setRegisterLoading(false); // Reset the loading state after completion
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true); // Use login loading state

    const formData = new FormData(e.target);

    const { email, password } = Object.fromEntries(formData);
    console.log({ email, password });

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      console.log("wada goda");

      setLoginLoading(false); // Reset the loading state after completion
    }
  };

  return (
    <div className="login">
      <div className="item">
        <h2>Welcome back,</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          {/* Apply loginLoading state here */}
          <button disabled={loginLoading}>
            {loginLoading ? "Loading" : "Sign In"}
          </button>
        </form>
      </div>
      <div className="separator"></div>
      <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            <img src={avatar.url || "./avatar.png"} alt="" />
            Upload an Image
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <input type="text" placeholder="Username" name="username" />
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          {/* Apply registerLoading state here */}
          <button disabled={registerLoading}>
            {registerLoading ? "Loading" : "Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
