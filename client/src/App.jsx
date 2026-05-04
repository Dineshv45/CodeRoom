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

import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

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
      <AuthProvider>
      <TimelineProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route path="/verify-success" element={<VerifySuccess />} />
          <Route path="/verify-error" element={<VerifyError />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }>
            <Route path="editor/:roomId" element={
              <ProtectedRoute>
                <EditorPage />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
        </TimelineProvider>
        </AuthProvider>
      </BrowserRouter>

      </>
  );
}

export default App;
