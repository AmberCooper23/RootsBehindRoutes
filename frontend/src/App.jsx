import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

//component import
import { NavBar } from "./components/NavBar/NavBar";

//page import
import { LandingPage } from "./pages/LandingPage/LandingPage";

function App() {
  return (
    <>
      <NavBar />
      <LandingPage />
    </>
  );
}

export default App;
