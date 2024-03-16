import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login';
import Dashboard from './components/dashboard'; // Placeholder for the dashboard component
import AddTask from './components/addtask';
import SubtaskPage from './components/subtask-list';
import CallsPage from './components/admincalls';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/add-task" element={<AddTask />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/subtaskslist/:taskId" element={<SubtaskPage />} />
        <Route path="/calls" element={<CallsPage />}/>
      </Routes>
    </Router>
  );
}

export default App;
