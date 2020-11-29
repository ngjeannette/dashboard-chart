import "./App.css";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./Component/Home";

function App() {
  return (
    <Router>
      <Route
        exact
        path="/"
        render={(props) => <Home {...props} isAuthed={true} />}
      />
    </Router>
  );
}

export default App;
