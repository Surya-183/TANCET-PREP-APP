import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, fetchAuthSession } from '@aws-amplify/auth';
import './HomePage.css';

// Professional SVG Icons
const AptitudeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 3h.008v.008H8.25v-.008Zm0 3h.008v.008H8.25v-.008Zm3.75 0h.008v.008h-.008v-.008Zm0-3h.008v.008h-.008v-.008Zm0-3h.008v.008h-.008v-.008Zm3.75 0h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm-7.5-6h.008v.008H8.25v-.008Zm3.75 0h.008v.008h-.008v-.008Zm3.75 0h.008v.008h-.008v-.008ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const ReasoningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>;
const ComputerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-1.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" /></svg>;
const EnglishIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>;
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>;

const HomePage = ({ onSignOut }) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [publishedTests, setPublishedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [performanceStats, setPerformanceStats] = useState({
    testsTaken: 0,
    avgScore: 0,
    bestScore: 0,
    totalQuestions: 0
  });

  const API_BASE_URL = 'https://hcdufuk4fh.execute-api.us-east-1.amazonaws.com/dev';

  useEffect(() => {
    checkUserRole();
    fetchPublishedTests();
    fetchPerformanceStats();
  }, []);

  const checkUserRole = async () => {
    try {
      const user = await getCurrentUser();
      console.log('Current user found:', user);
      
      // In Amplify v6, we need to get the session to access tokens
      const { tokens } = await fetchAuthSession();
      const groups = tokens?.idToken?.payload?.['cognito:groups'] || [];
      console.log('User groups:', groups);
      
      const adminStatus = groups.includes('admin');
      console.log('Setting isAdmin to:', adminStatus);
      setIsAdmin(adminStatus);
    } catch (err) {
      console.error('Error checking user role:', err);
    }
  };

  const fetchPublishedTests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tests?published=true`);
      if (response.ok) {
        const data = await response.json();
        setPublishedTests(Array.isArray(data) ? data : []);
      } else if (response.status === 404) {
        console.log('Tests endpoint not implemented yet');
      }
    } catch (err) {
      console.error('Error fetching published tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceStats = async () => {
    try {
      const user = await getCurrentUser();
      const userId = user.username;
      
      // Try to fetch from backend first
      try {
        const response = await fetch(`${API_BASE_URL}/results/user/${userId}`);
        if (response.ok) {
          const results = await response.json();
          if (Array.isArray(results) && results.length > 0) {
            const testsTaken = results.length;
            const totalScore = results.reduce((sum, r) => sum + (r.score || 0), 0);
            const avgScore = Math.round(totalScore / testsTaken);
            const bestScore = Math.max(...results.map(r => r.score || 0));
            const totalQuestions = results.reduce((sum, r) => sum + (r.totalQuestions || 0), 0);
            
            setPerformanceStats({ testsTaken, avgScore, bestScore, totalQuestions });
            return;
          }
        }
      } catch (apiErr) {
        console.log('Backend endpoint not available, using localStorage');
      }
      
      // Fallback to localStorage
      const statsKey = `userStats_${userId}`;
      const savedStats = localStorage.getItem(statsKey);
      if (savedStats) {
        setPerformanceStats(JSON.parse(savedStats));
      }
    } catch (err) {
      console.error('Error fetching performance stats:', err);
    }
  };

  const topics = [
    { name: 'Quantitative Aptitude', description: 'Sharpen your quantitative and problem-solving skills.', icon: <AptitudeIcon />, color: '#EF4444' },
    { name: 'Reasoning', description: 'Enhance your logical and analytical thinking abilities.', icon: <ReasoningIcon />, color: '#8B5CF6' },
    { name: 'Computer', description: 'Test your knowledge of computer fundamentals.', icon: <ComputerIcon />, color: '#3B82F6' },
    { name: 'English', description: 'Improve your vocabulary, grammar, and comprehension.', icon: <EnglishIcon />, color: '#10B981' }
  ];
  
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="homepage-elite">
       <aside className="homepage-sidebar-elite">
        <header className="sidebar-header-elite">
            <h1>TANCET Prep</h1>
        </header>
        <nav className="sidebar-nav-elite">
          <a href="#" className="active">
             <DashboardIcon />
            Dashboard
          </a>
          {isAdmin && (
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/admin'); }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              Admin Panel
            </a>
          )}
        </nav>
        
         {/* 🔹 Added Sign-Out Button */}
        <footer className="sidebar-footer-elite">
          <button className="logout-btn-sidebar" onClick={onSignOut}>
            <span className="logout-icon">🚪</span>
            <span>Sign Out</span>
          </button>
        </footer>
      </aside>

      <main className="homepage-main-content-elite">
        <header className="homepage-main-header-elite">
            <div className="user-welcome">
                Welcome, Aspirant!
            </div>
        </header>
        
        <div className="homepage-body-elite">
            <h2 className="page-title">Dashboard</h2>
            <p className="page-subtitle">Your central hub for TANCET preparation. Let's get started!</p>

            <section>
                <h3 className="section-title-elite">Quick Actions</h3>
                <div className="quick-actions-elite">
                    <div className="action-card-elite">
                        <h3>Create a Custom Test</h3>
                        <p>Personalize your practice by topic, difficulty, and number of questions to target your weak areas.</p>
                        <button onClick={() => handleNavigation('/custom-test')} className="action-btn-elite">
                            Build Your Test
                        </button>
                    </div>
                    <div className="action-card-elite">
                        <h3>Full Mock Test</h3>
                        <p>Experience the real exam pattern with a full-length mock test simulation to gauge your readiness.</p>
                        <button onClick={() => handleNavigation('/test/MOCK-TEST-01')} className="action-btn-elite">
                            Start Mock Exam
                        </button>
                    </div>
                </div>
            </section>

             {publishedTests.length > 0 && (
              <section>
                <h3 className="section-title-elite">Published Tests</h3>
                <div className="published-tests-grid">
                  {publishedTests.map((test) => (
                    <div key={test.testId} className="published-test-card">
                      <h4>{test.testName || 'Untitled Test'}</h4>
                      <p className="test-info">
                        <span>{test.questionCount || 0} Questions</span>
                        <span>•</span>
                        <span>{test.durationMins || 0} Minutes</span>
                      </p>
                      <button 
                        onClick={() => navigate(`/test/${test.testId}`)}
                        className="start-test-btn"
                      >
                        Start Test
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
                <h3 className="section-title-elite">Performance Snapshot</h3>
                <div className="performance-snapshot">
                    <div className="snapshot-grid">
                        <div className="snapshot-item">
                            <h4>Tests Taken</h4>
                            <p>{performanceStats.testsTaken}</p>
                        </div>
                        <div className="snapshot-item">
                            <h4>Avg. Score</h4>
                            <p>{performanceStats.avgScore}%</p>
                        </div>
                        <div className="snapshot-item">
                            <h4>Best Score</h4>
                            <p>{performanceStats.bestScore}%</p>
                        </div>
                        <div className="snapshot-item">
                            <h4>Questions Solved</h4>
                            <p>{performanceStats.totalQuestions}</p>
                        </div>
                    </div>
                </div>
            </section>
            
            <section>
                <h3 className="section-title-elite">Practice by Topic</h3>
                <div className="topics-grid-elite">
                {topics.map(topic => (
                    <div 
                        key={topic.name} 
                        className="topic-card-elite"
                        onClick={() => handleNavigation(`/topic/${encodeURIComponent(topic.name)}`)}
                    >
                        <div className="topic-card-header-elite">
                            <div className="topic-card-icon-elite" style={{ backgroundColor: topic.color }}>
                                {topic.icon}
                            </div>
                            <div className="topic-card-title-elite">
                                <h4>{topic.name}</h4>
                            </div>
                        </div>
                        <div className="topic-card-body-elite">
                        <p>{topic.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            </section>
        </div>
    </main>
    </div>
);
};

export default HomePage;

