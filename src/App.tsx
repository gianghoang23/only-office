import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import EditDocument from "./pages/EditDocument";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Home />} />
          <Route path="edit-doc" element={<EditDocument />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
