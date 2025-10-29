import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@aws-amplify/auth';
import './TestScreen.css';

const TestScreen = ({ onSignOut }) => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewFlags, setReviewFlags] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testInfo, setTestInfo] = useState({});
  const [error, setError] = useState(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const timerRef = useRef(null);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL ||
    'https://hcdufuk4fh.execute-api.us-east-1.amazonaws.com/dev';

  // ✅ Function to normalize DynamoDB-typed JSON to plain JS objects
  const normalizeQuestions = (questionList) => {
    return questionList.map((q) => {
      const normalized = { ...q };

      // Normalize options array
      if (Array.isArray(q.options)) {
        normalized.options = q.options.map((opt) => {
          if (opt && typeof opt === 'object') {
            if ('S' in opt) return opt.S;
            if ('N' in opt) return opt.N;
          }
          return opt;
        });
      }

      // Normalize answer
      if (q.answer && typeof q.answer === 'object' && 'S' in q.answer) {
        normalized.answer = q.answer.S;
      }

      // Normalize solution
      if (q.solution && typeof q.solution === 'object' && 'S' in q.solution) {
        normalized.solution = q.solution.S;
      }

      return normalized;
    });
  };

  const fetchTestData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/tests/${testId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch test data');
      }
      const data = await response.json();
      const rawQuestions = data.questions || [];

      // ✅ Normalize DynamoDB typed data to plain values
      const testQuestions = normalizeQuestions(rawQuestions);

      const storageKey = `testState_${testId}`;
      const savedStateJSON = sessionStorage.getItem(storageKey);
      const savedState = savedStateJSON ? JSON.parse(savedStateJSON) : null;

      setQuestions(testQuestions);
      const initialDuration = (data.durationMins || testQuestions.length) * 60;

      setTestInfo({
        testName: data.testName || 'Practice Test',
        questionCount: testQuestions.length,
        durationMins: data.durationMins || testQuestions.length,
      });

      setReviewFlags(new Set(savedState?.savedReviewFlags || []));
      setAnswers(savedState?.savedAnswers || {});
      setCurrentQuestion(savedState?.savedCurrentQuestion || 0);
      setTimeLeft(
        savedState?.savedTimeLeft !== undefined
          ? savedState.savedTimeLeft
          : initialDuration
      );
    } catch (err) {
      console.error('Error fetching test data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save session state
  useEffect(() => {
    if (!loading && testId && timeLeft !== null) {
      const stateToSave = {
        savedAnswers: answers,
        savedCurrentQuestion: currentQuestion,
        savedTimeLeft: timeLeft,
        savedReviewFlags: Array.from(reviewFlags),
      };
      sessionStorage.setItem(
        `testState_${testId}`,
        JSON.stringify(stateToSave)
      );
    }
  }, [answers, currentQuestion, timeLeft, testId, loading, reviewFlags]);

  // Load test data
  useEffect(() => {
    if (testId) {
      fetchTestData();
    }
  }, [testId]);

  // Timer logic
  useEffect(() => {
    if (!loading && questions.length > 0 && timeLeft > 0) {
      startTimer();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [loading, questions, timeLeft]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
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
    if (seconds === null) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionIndex, selectedOptionIndex) => {
    setAnswers((prev) => {
      if (prev[questionIndex] === selectedOptionIndex) {
        const newAnswers = { ...prev };
        delete newAnswers[questionIndex];
        return newAnswers;
      } else {
        return { ...prev, [questionIndex]: selectedOptionIndex };
      }
    });
  };

  const handleMarkForReview = () => {
    setReviewFlags((prev) => {
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
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handleQuestionNavigation = (questionIndex) => {
    setCurrentQuestion(questionIndex);
  };

  const getQuestionStatus = (questionIndex) => {
    if (questionIndex === currentQuestion) return 'current';
    if (answers[questionIndex] !== undefined && reviewFlags.has(questionIndex))
      return 'answered review';
    if (answers[questionIndex] !== undefined) return 'answered';
    if (reviewFlags.has(questionIndex)) return 'review';
    return '';
  };

  const handleSubmitTest = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    try {
      const currentUser = await getCurrentUser();
      const userId = currentUser?.userId || currentUser?.username || 'anonymous';
      const userEmail = currentUser?.signInDetails?.loginId || 'anonymous@example.com';

      const resultData = {
        testId,
        answers: answers,
        timeSpent: (testInfo.durationMins * 60) - timeLeft,
        userId,
        userEmail
      };

      const response = await fetch(`${API_BASE_URL}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit test');
      }

      const result = await response.json();
      sessionStorage.removeItem(`testState_${testId}`);
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
      <div className="test-header">
        <div className="header-left">
          <div className="test-logo">TANCET Preparation</div>
          <div className="test-title">{testInfo.testName}</div>
        </div>
        <div className="header-right">
          <div className="timer">
            Time Left<br />
            <span className="timer-value">{formatTime(timeLeft)}</span>
          </div>
          <div className="question-info">
            Question No. {currentQuestion + 1}
          </div>
        </div>
      </div>

      <div className="test-body">
        <div className="test-sidebar">
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
            <div className="analysis-stats">
              <div className="stat-item">
                <span className="stat-label">Answered</span>
                <span className="stat-value">{answeredCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Not Answered</span>
                <span className="stat-value">
                  {questions.length - answeredCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="test-content">
          <div className="question-header">
            <span>Question No. {currentQuestion + 1}</span>
            <div className="question-actions">
              <button
                className="action-btn mark-review-btn"
                onClick={handleMarkForReview}
              >
                {reviewFlags.has(currentQuestion)
                  ? 'Unmark for Review'
                  : 'Mark for Review'}
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
                    onClick={() =>
                      handleAnswerSelect(currentQuestion, optionIndex)
                    }
                    readOnly
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {showSubmitDialog && (
        <div className="submit-dialog-overlay">
          <div className="submit-dialog">
            <h3>Submit Test</h3>
            <p>Are you sure you want to submit the test?</p>
            <p>
              <strong>Total Questions:</strong> {questions.length}
            </p>
            <p>
              <strong>Answered:</strong> {answeredCount}
            </p>
            <p>
              <strong>Not Answered:</strong>{' '}
              {questions.length - answeredCount}
            </p>
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
