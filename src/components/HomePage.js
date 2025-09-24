import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

// Professional SVG Icons
const AptitudeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 3h.008v.008H8.25v-.008Zm0 3h.008v.008H8.25v-.008Zm3.75 0h.008v.008h-.008v-.008Zm0-3h.008v.008h-.008v-.008Zm0-3h.008v.008h-.008v-.008Zm3.75 0h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm-7.5-6h.008v.008H8.25v-.008Zm3.75 0h.008v.008h-.008v-.008Zm3.75 0h.008v.008h-.008v-.008ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const ReasoningIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>;
const ComputerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-1.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" /></svg>;
const EnglishIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>;
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>;

const HomePage = () => {
  const navigate = useNavigate();

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
          {/* Future links can be added here */}
        </nav>
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

             <section>
                <h3 className="section-title-elite">Performance Snapshot</h3>
                <div className="performance-snapshot">
                    <div className="snapshot-grid">
                        <div className="snapshot-item">
                            <h4>Tests Taken</h4>
                            <p>0</p>
                        </div>
                        <div className="snapshot-item">
                            <h4>Avg. Score</h4>
                            <p>0%</p>
                        </div>
                        <div className="snapshot-item">
                            <h4>Avg. Accuracy</h4>
                            <p>0%</p>
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

