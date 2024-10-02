import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { setTargetFile } = useContext(AppContext);
  const navigate = useNavigate();
  return (
    <div>
      <h1>Home</h1>
      <input
        type="file"
        onChange={(e) => {
          if (e.target.files) {
            setTargetFile(e.target.files[0]);
          }
        }}
      />
      <button onClick={() => navigate("/edit-doc")}>Edit Document</button>
      <button>Submit</button>
    </div>
  );
};
export default Home;
