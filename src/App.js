import React from "react";
import Home from "./pages/home"; // 使用小寫名稱
import "./scss/App.scss";//檔案

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Home /> {/* 使用 Home 元件 */}
      </header>
    </div>
  );
}

export default App;
