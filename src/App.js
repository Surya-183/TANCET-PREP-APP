import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import TopicPage from './components/TopicPage';
import CustomTestForm from './components/CustomTestForm';
import TestConfigForm from './components/TestConfigForm';
import TestScreen from './components/TestScreen';
import ResultsScreen from './components/ResultsScreen';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/topic/:topicName" element={<TopicPage />} />
          <Route path="/custom-test" element={<CustomTestForm />} />
          <Route path="/configure/:topicName/:subtopic" element={<TestConfigForm />} />
          <Route path="/test/:testId" element={<TestScreen />} />
          <Route path="/results/:resultId" element={<ResultsScreen />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
