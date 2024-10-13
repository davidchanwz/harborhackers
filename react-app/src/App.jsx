import React, {useState} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar'; // Import the Sidebar Component
import Home from './pages/Home';
import PortPal from './pages/PortPal';
import Login from './pages/Login';
import Compass from './pages/Compass';
import DockWorks from './pages/DockWorks';
import Settings from './pages/Settings';
import User from './pages/User';
import Metrics from './pages/Metrics';
import Milestones from './pages/Milestones'
import { AuthProvider } from './context/AuthContext'
import TaskList from './components/TaskList';
function App() {
  const [userPoints, setUserPoints] = useState(0); // State to hold total points

  return (
    <Router>
      <AuthProvider>
        <Sidebar>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/portpal" element={<PortPal />} />
            <Route path="/compass" element={<Compass />} />
            <Route path="/dockworks" element={<DockWorks setUserPoints={setUserPoints} />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/user" element={<User />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/milestones" element={<Milestones userPoints={userPoints} />} />
          </Routes>
        </Sidebar>
      </AuthProvider>
    </Router>
  );
}

export default App;
