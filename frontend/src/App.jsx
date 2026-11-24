import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import FlightSchedulesPage from './pages/FlightSchedulesPage';
import GroupsExplorerPage from './pages/GroupsExplorerPage';
import TravelRequestPage from './pages/TravelRequestPage';
import CreateGroupPage from './pages/CreateGroupPage';
import GroupDetailsPage from './pages/GroupDetailsPage';
import AIAssistantPage from './pages/AIAssistantPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AIAdvisorWidget from './components/AIAdvisorWidget';

function MainApp() {
  const [activePage, setActivePage] = useState('landing');
  const [selectedGroupId, setSelectedGroupId] = useState('grp_bom_goi');
  const [searchQuery, setSearchQuery] = useState(null);
  const [prepopulatedFlight, setPrepopulatedFlight] = useState(null);

  const renderPage = () => {
    switch (activePage) {
      case 'landing':
        return (
          <LandingPage
            setActivePage={setActivePage}
            setSelectedGroupId={setSelectedGroupId}
            setSearchQuery={setSearchQuery}
            setPrepopulatedFlight={setPrepopulatedFlight}
          />
        );
      case 'flights':
        return (
          <FlightSchedulesPage
            setActivePage={setActivePage}
            setPrepopulatedFlight={setPrepopulatedFlight}
            setSearchQuery={setSearchQuery}
          />
        );
      case 'explore':
        return (
          <GroupsExplorerPage
            setActivePage={setActivePage}
            setSelectedGroupId={setSelectedGroupId}
            initialSearch={searchQuery}
          />
        );
      case 'request':
        return (
          <TravelRequestPage
            setActivePage={setActivePage}
            setSelectedGroupId={setSelectedGroupId}
          />
        );
      case 'create':
        return (
          <CreateGroupPage
            setActivePage={setActivePage}
            setSelectedGroupId={setSelectedGroupId}
            prepopulatedFlight={prepopulatedFlight}
          />
        );
      case 'details':
        return (
          <GroupDetailsPage
            groupId={selectedGroupId}
            setActivePage={setActivePage}
          />
        );
      case 'assistant':
        return (
          <AIAssistantPage
            setActivePage={setActivePage}
            setSelectedGroupId={setSelectedGroupId}
          />
        );
      case 'admin':
        return (
          <AdminDashboardPage
            setActivePage={setActivePage}
            setSelectedGroupId={setSelectedGroupId}
          />
        );
      default:
        return (
          <LandingPage
            setActivePage={setActivePage}
            setSelectedGroupId={setSelectedGroupId}
            setSearchQuery={setSearchQuery}
            setPrepopulatedFlight={setPrepopulatedFlight}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1120] text-slate-100 selection:bg-blue-600 selection:text-white">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      
      <main className="flex-1">
        {renderPage()}
      </main>

      <Footer setActivePage={setActivePage} />

      {/* Floating AI Travel Assistant Widget */}
      <AIAdvisorWidget
        currentGroupId={selectedGroupId}
        onSelectGroup={(gid) => {
          setSelectedGroupId(gid);
          setActivePage('details');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </AuthProvider>
  );
}
