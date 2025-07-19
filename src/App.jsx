import { useState } from "react";
import Homepage from "./components/Homepage";
import SplitScreen from "./components/SplitScreen";
import FileWatcher from "./components/FileWatcher";
import "./App.css";

function App() {
  const [currentMode, setCurrentMode] = useState('home');

  const handleSelectMode = (mode) => {
    setCurrentMode(mode);
  };

  const handleBackToHome = () => {
    setCurrentMode('home');
  };

  const renderCurrentMode = () => {
    switch (currentMode) {
      case 'editor':
        return <SplitScreen onBack={handleBackToHome} />;
      case 'watcher':
        return <FileWatcher onBack={handleBackToHome} />;
      default:
        return <Homepage onSelectMode={handleSelectMode} />;
    }
  };

  return (
    <div className="app">
      {renderCurrentMode()}
    </div>
  );
}

export default App;
