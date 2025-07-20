import { useState, useEffect } from "react";
import Homepage from "./components/Homepage";
import SplitScreen from "./components/SplitScreen";
import FileWatcher from "./components/FileWatcher";
import { storage } from "./services/storage";
import "./App.css";

function App() {
  const [currentMode, setCurrentMode] = useState('home');
  const [isRestoring, setIsRestoring] = useState(false);

  const handleSelectMode = (mode) => {
    setCurrentMode(mode);
    storage.saveLastMode(mode);
  };

  const handleBackToHome = () => {
    setCurrentMode('home');
  };

  const handleContinue = () => {
    setIsRestoring(true);
    const lastMode = storage.getLastMode();
    if (lastMode) {
      setCurrentMode(lastMode);
    }
  };

  const renderCurrentMode = () => {
    switch (currentMode) {
      case 'editor':
        return <SplitScreen onBack={handleBackToHome} isRestoring={isRestoring} />;
      case 'watcher':
        return <FileWatcher onBack={handleBackToHome} isRestoring={isRestoring} />;
      default:
        return <Homepage onSelectMode={handleSelectMode} onContinue={handleContinue} />;
    }
  };

  // Reset restoring flag when mode changes
  useEffect(() => {
    if (currentMode !== 'home') {
      setIsRestoring(false);
    }
  }, [currentMode]);

  return (
    <div className="h-screen m-0 p-0 font-sans overflow-hidden">
      {renderCurrentMode()}
    </div>
  );
}

export default App;
