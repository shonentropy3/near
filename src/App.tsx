import React from 'react';
import './App.css';
import {ConnectionContextProvider} from "./ConnectionContext";
import {HomePage} from "./home.page";

function App() {
  return (
    <div className="App">
        <ConnectionContextProvider>
            <HomePage/>
        </ConnectionContextProvider>
    </div>
  );
}

export default App;
