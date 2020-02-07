import React from "react";
// import logo from "./logo.svg";
import "./App.css";
import FileUpload from "./fileupload";
import * as env from "./env.json";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      socketId: null
    };
  }

  render() {
    return (
      <div className="App container mt-4">
        <h2 className="App-logo">ML File Convertor</h2>
        <FileUpload apiUrl={env.prod} />
      </div>
    );
  }
}

export default App;
