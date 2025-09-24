import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TestConfigForm.css';

const TestConfigForm = () => {
  const { topicName, subtopic } = useParams();
  const navigate = useNavigate();
  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'https://hcdufuk4fh.execute-api.us-east-1.amazonaws.com/dev';

  const handleStartTest = async () => {
    console.log("Start Test button clicked!");
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/generate-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topicName,
          subtopic: subtopic,
          questionCount: questionCount
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate test');
      }

      const data = await response.json();
      navigate(`/test/${data.testId}`);
    } catch (error) {
      console.error('Error generating test:', error);
      alert('Error generating test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const questionOptions = [5, 10, 15, 20, 25, 30];
  const duration = Math.ceil(questionCount * 1.5);
  const totalMarks = questionCount;

  return (
    <div className="test-config-form">
      <div className="config-container">
        <div className="config-header">
          <h1>Configure Your Test</h1>
          <p>{topicName} - {subtopic}</p>
        </div>

        <div className="config-content">
          <div className="form-section">
            <label>Number of Questions:</label>
            <select 
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
            >
              {questionOptions.map(count => (
                <option key={count} value={count}>
                  {count} Questions
                </option>
              ))}
            </select>
          </div>

          <div className="test-summary">
            <div className="summary-item">
              <span className="summary-icon">📝</span>
              <span className="summary-label">Questions:</span>
              <span className="summary-value">{questionCount}</span>
            </div>
            <div className="summary-item">
              <span className="summary-icon">⏱️</span>
              <span className="summary-label">Duration:</span>
              <span className="summary-value">{duration} minutes</span>
            </div>
            <div className="summary-item">
              <span className="summary-icon">🎯</span>
              <span className="summary-label">Total Marks:</span>
              <span className="summary-value">{totalMarks}</span>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="back-btn"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
            <button 
              className="start-btn"
              onClick={handleStartTest}
              disabled={loading}
            >
              {loading ? (
                <span className="loading-content">
                  <span className="loading-spinner"></span>
                  Starting...
                </span>
              ) : (
                'Start Test'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestConfigForm;
