import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TestScreen.css';

const TestScreen = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewFlags, setReviewFlags] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(600);
  const [loading, setLoading] = useState(true);
  const [testInfo, setTestInfo] = useState({});
  const [error, setError] = useState(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const timerRef = useRef(null);

  const API_BASE_URL = 'https://hcdufuk4fh.execute-api.us-east-1.amazonaws.com/dev';

  const fetchTestData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/tests/${testId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch test data');
      }
      const data = await response.json();
      const testQuestions = data.questions || [];
      setQuestions(testQuestions);
      setTestInfo({
        testName: data.testName || 'Syllogism - 01',
        questionCount: testQuestions.length,
        durationMins: data.durationMins || Math.ceil(testQuestions.length * 1.5)
      });
      setTimeLeft((data.durationMins || Math.ceil(testQuestions.length * 1.5)) * 60);
    } catch (err) {
      console.error('Error fetching test data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (testId) {
      fetchTestData();
    }
  }, [testId]);

  useEffect(() => {
    if (!loading && questions.length > 0) {
      startTimer();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loading, questions]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionIndex, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedOption
    }));
  };

  const handleMarkForReview = () => {
    setReviewFlags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion);
      } else {
        newSet.add(currentQuestion);
      }
      return newSet;
    });
  };

  const handleSaveAndNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleQuestionNavigation = (questionIndex) => {
    setCurrentQuestion(questionIndex);
  };

  const getQuestionStatus = (questionIndex) => {
    if (questionIndex === currentQuestion) return 'current';
    if (answers[questionIndex] !== undefined && reviewFlags.has(questionIndex)) return 'answered review';
    if (answers[questionIndex] !== undefined) return 'answered';
    if (reviewFlags.has(questionIndex)) return 'review';
    return '';
  };

  const handleSubmitTest = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const finalAnswers = {};
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] !== undefined) {
        finalAnswers[i] = answers[i];
      }
    }

    try {
      const resultData = {
        testId,
        answers: finalAnswers,
        timeSpent: (testInfo.durationMins * 60) - timeLeft,
      };

      const response = await fetch(`${API_BASE_URL}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resultData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit test');
      }

      const result = await response.json();
      navigate(`/results/${result.resultId}`);
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Error submitting test. Please try again.');
    }
  };

  const confirmSubmit = () => setShowSubmitDialog(true);
  const cancelSubmit = () => setShowSubmitDialog(false);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading test...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Test</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="error-container">
        <h2>No Questions Available</h2>
        <p>This test could not be loaded or contains no questions.</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="test-screen">
      {/* Header */}
      <div className="test-header">
        <div className="header-left">
          <div className="test-logo"> TANCET Preparation</div>
          <div className="test-title">{testInfo.testName || 'Syllogism - 01'}</div>
          
        </div>
        
        <div className="header-center">
          {/* Removed Zoom buttons */}
        </div>
        
        <div className="header-right">
          <div className="timer">
            Time Left<br />
            <span className="timer-value">{formatTime(timeLeft)}</span>
          </div>
          <div className="question-info">
            Question No. {currentQuestion + 1}
          </div>
          <div className="user-info">
            <div className="profile-pics">
        
            </div>
          </div>
        </div>
      </div>

      <div className="test-body">
        {/* Left Sidebar */}
        <div className="test-sidebar">
          <div className="symbols-instructions">
            <button className="tab-btn active">SYMBOLS</button>
            <button className="tab-btn">INSTRUCTIONS</button>
          </div>
          
          <div className="part-section">
            <div className="part-label">PART-A</div>
          </div>
          
          <div className="test-label">Test</div>
          
          <div className="question-palette">
            <div className="palette-grid">
              {questions.map((_, index) => (
                <button
                  key={index}
                  className={`palette-btn ${getQuestionStatus(index)}`}
                  onClick={() => handleQuestionNavigation(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
          
          <div className="part-analysis">
            <div className="analysis-title">PART-A Analysis</div>
            <div className="analysis-stats">
              <div className="stat-item">
                <span className="stat-label">Answered</span>
                <span className="stat-value">{answeredCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Not Answered</span>
                <span className="stat-value">{questions.length - answeredCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="test-content">
          <div className="question-header">
            <span>Question No. {currentQuestion + 1}</span>
            <div className="question-actions">
              <button 
                className="action-btn mark-review-btn"
                onClick={handleMarkForReview}
              >
                Mark for Review
              </button>
              <button 
                className="action-btn save-next-btn"
                onClick={handleSaveAndNext}
              >
                Save & Next
              </button>
              <button 
                className="action-btn submit-test-btn"
                onClick={confirmSubmit}
              >
                Submit Test
              </button>
            </div>
          </div>

          <div className="question-text">
            <p>{currentQ?.question || 'Question text will appear here'}</p>
          </div>

          {currentQ?.options && (
            <div className="options-list">
              {currentQ.options.map((option, optionIndex) => (
                <label key={optionIndex} className="option-item">
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={optionIndex}
                    checked={answers[currentQuestion] === optionIndex}
                    onChange={() => handleAnswerSelect(currentQuestion, optionIndex)}
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="test-right-sidebar">
          <div className="answered-stats">
            <div className="stats-title">Total Questions Answered: {answeredCount}</div>
            <div className="time-info">
              <div className="last-time">Last <span className="time-highlight">{formatTime((testInfo.durationMins * 60) - timeLeft)}</span> Minutes</div>
            </div>
          </div>
          
          {/* Removed Language Section */}
        </div>
      </div>

      {/* Submit Dialog */}
      {showSubmitDialog && (
        <div className="submit-dialog-overlay">
          <div className="submit-dialog">
            <h3>Submit Test</h3>
            <p>Are you sure you want to submit the test?</p>
            <p><strong>Total Questions:</strong> {questions.length}</p>
            <p><strong>Answered:</strong> {answeredCount}</p>
            <p><strong>Not Answered:</strong> {questions.length - answeredCount}</p>
            <div className="dialog-actions">
              <button className="dialog-btn cancel" onClick={cancelSubmit}>
                Cancel
              </button>
              <button className="dialog-btn confirm" onClick={handleSubmitTest}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestScreen;
