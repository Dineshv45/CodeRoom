import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import EditorPage from "./pages/EditorPage.jsx";
import AuthSuccess from "./pages/AuthSuccess.jsx";
import VerifySuccess from "./pages/VerifySuccess.jsx";
import VerifyError from "./pages/VerifyError.jsx";
import { Toaster } from "react-hot-toast";

import { TimelineProvider } from "./context/TimelineContext.jsx";

function App() {
  return (
   <>
      <div>
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              theme: {
                primary: "#4aed88",
              },
            },
          }}
        />
      </div>

      <BrowserRouter>
      <TimelineProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/verify-success" element={<VerifySuccess />} />
          <Route path="/verify-error" element={<VerifyError />} />
          <Route path="/" element={<Home />}>
            <Route path="editor/:roomId" element={<EditorPage />} />
          </Route>
        </Routes>
        </TimelineProvider>
      </BrowserRouter>

      </>
  );
}

export default App;
