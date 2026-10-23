import React, { useState } from 'react';
import { useAppStore } from './store';
import { RoleSwitcher } from './components/RoleSwitcher';
import { PhoneFrame } from './components/PhoneFrame';
import { NotificationToast } from './components/NotificationToast';
import { LoginModal } from './components/LoginModal';
import { SwitchAccountModal } from './components/SwitchAccountModal';
import { ResidentView } from './components/ResidentView/ResidentView';
import { CreateTicketModal } from './components/ResidentView/CreateTicketModal';
import { AcceptanceModal } from './components/ResidentView/AcceptanceModal';
import { ManagementView } from './components/ManagementView/ManagementView';
import { AssignTechnicianModal } from './components/ManagementView/AssignTechnicianModal';
import { ClassifyTicketModal } from './components/ManagementView/ClassifyTicketModal';
import { VerifyComplaintModal } from './components/ManagementView/VerifyComplaintModal';
import { TechnicianView } from './components/TechnicianView/TechnicianView';
import { KtvActionModal } from './components/TechnicianView/KtvActionModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { MaintenanceTicket } from './types';

export default function App() {
  const {
    currentUser,
    tickets,
    notifications,
    periodicPlans,
    activeToast,
    dismissToast,
    login,
    logout,
    switchRole,
    switchAccount,
    createTicket,
    checkForDuplicates,
    followExistingTicket,
    classifyTicket,
    assignTechnician,
    ktvAcceptTicket,
    ktvSubmitCompletion,
    approveInspection,
    rejectInspection,
    verifyComplaint,
    autoCloseTicketAfter48h,
    completePeriodicMaintenance,
    createPeriodicPlan,
    addEquipment,
    updateEquipment,
    equipments,
    maintenanceHistory,
    resetToCleanSlate,
    loadSampleData,
  } = useAppStore();

  // Modal states
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSwitchAccountOpen, setIsSwitchAccountOpen] = useState(false);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  
  // Specific action modals
  const [ticketForClassify, setTicketForClassify] = useState<MaintenanceTicket | null>(null);
  const [ticketForAcceptance, setTicketForAcceptance] = useState<MaintenanceTicket | null>(null);
  const [ticketForAssign, setTicketForAssign] = useState<MaintenanceTicket | null>(null);
  const [ticketForVerifyComplaint, setTicketForVerifyComplaint] = useState<MaintenanceTicket | null>(null);
  const [ticketForKtv, setTicketForKtv] = useState<MaintenanceTicket | null>(null);

  // Determine current active role label with exact username
  const roleLabel = 
    currentUser.role === 'RESIDENT' ? `Cư Dân (${currentUser.username})` :
    currentUser.role === 'BQL' ? `Ban Quản Lý (${currentUser.username})` :
    `Kỹ Thuật Viên (${currentUser.username})`;

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      
      {/* Top Fixed Quick Switcher Bar for switching 3 Roles */}
      <RoleSwitcher
        currentUser={currentUser}
        tickets={tickets}
        notifications={notifications}
        onSwitchRole={switchRole}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={logout}
        onResetData={resetToCleanSlate}
        onLoadSampleData={loadSampleData}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 flex items-center justify-center p-0.5 overflow-hidden">
        <PhoneFrame activeRoleLabel={roleLabel}>
          
          {/* Real-time Floating Notification Toast */}
          <NotificationToast
            notification={activeToast}
            onDismiss={dismissToast}
            onOpenTicket={(ticketId) => {
              const found = tickets.find((t) => t.id === ticketId);
              if (found) setSelectedTicket(found);
            }}
          />

          {/* Active Role Screen */}
          {currentUser.role === 'RESIDENT' && (
            <ResidentView
              currentUser={currentUser}
              tickets={tickets}
              onOpenCreateModal={() => setIsCreateTicketOpen(true)}
              onSelectTicket={(ticket) => setSelectedTicket(ticket)}
              onOpenAcceptance={(ticket) => setTicketForAcceptance(ticket)}
              onOpenSwitchAccount={() => setIsSwitchAccountOpen(true)}
              onLogout={logout}
            />
          )}

          {currentUser.role === 'BQL' && (
            <ManagementView
              currentUser={currentUser}
              tickets={tickets}
              periodicPlans={periodicPlans}
              equipments={equipments}
              maintenanceHistory={maintenanceHistory}
              onCreatePeriodicPlan={createPeriodicPlan}
              onAddEquipment={addEquipment}
              onSelectTicket={(ticket) => setSelectedTicket(ticket)}
              onOpenClassifyModal={(ticket) => setTicketForClassify(ticket)}
              onOpenAssignModal={(ticket) => setTicketForAssign(ticket)}
              onOpenAcceptanceModal={(ticket) => setTicketForAcceptance(ticket)}
              onOpenVerifyComplaintModal={(ticket) => setTicketForVerifyComplaint(ticket)}
              onOpenSwitchAccount={() => setIsSwitchAccountOpen(true)}
              onLogout={logout}
            />
          )}

          {currentUser.role === 'KTV' && (
            <TechnicianView
              currentUser={currentUser}
              tickets={tickets}
              periodicPlans={periodicPlans}
              onSelectTicket={(ticket) => setSelectedTicket(ticket)}
              onOpenKtvAction={(ticket) => setTicketForKtv(ticket)}
              onCompleteMaintenance={completePeriodicMaintenance}
              onOpenSwitchAccount={() => setIsSwitchAccountOpen(true)}
              onLogout={logout}
            />
          )}

          {/* --- ALL MODALS ARE STRICTLY CONTAINED INSIDE THIS PHONE FRAME --- */}

          {/* 1. Resident Create Ticket Modal */}
          <CreateTicketModal
            isOpen={isCreateTicketOpen}
            onClose={() => setIsCreateTicketOpen(false)}
            currentUser={currentUser}
            onSubmit={(params) => {
              const newTicket = createTicket(params);
              return newTicket;
            }}
            checkForDuplicates={checkForDuplicates}
            onFollowExisting={followExistingTicket}
          />

          {/* 2. BQL Classify Ticket Modal (Priority, Responsibility, Tech Dept) */}
          {ticketForClassify && (
            <ClassifyTicketModal
              isOpen={Boolean(ticketForClassify)}
              onClose={() => setTicketForClassify(null)}
              ticket={ticketForClassify}
              onSaveClassification={classifyTicket}
              onProceedToAssign={(t) => {
                setTicketForAssign(t);
              }}
            />
          )}

          {/* 3. Acceptance Verification Modal (Nghiệm thu đạt / Gửi khiếu nại chưa đạt) */}
          {ticketForAcceptance && (
            <AcceptanceModal
              isOpen={Boolean(ticketForAcceptance)}
              onClose={() => setTicketForAcceptance(null)}
              ticket={ticketForAcceptance}
              currentUser={currentUser}
              onApprove={approveInspection}
              onReject={rejectInspection}
              onAutoCloseSimulation={autoCloseTicketAfter48h}
            />
          )}

          {/* 4. BQL Verify Resident Complaint & Reassign KTV Modal */}
          {ticketForVerifyComplaint && (
            <VerifyComplaintModal
              isOpen={Boolean(ticketForVerifyComplaint)}
              onClose={() => setTicketForVerifyComplaint(null)}
              ticket={ticketForVerifyComplaint}
              onVerifyComplaint={verifyComplaint}
            />
          )}

          {/* 5. BQL Assignment Modal */}
          {ticketForAssign && (
            <AssignTechnicianModal
              isOpen={Boolean(ticketForAssign)}
              onClose={() => setTicketForAssign(null)}
              ticket={ticketForAssign}
              onAssign={assignTechnician}
            />
          )}

          {/* 6. KTV Action Modal (Before photo & material completion) */}
          {ticketForKtv && (
            <KtvActionModal
              isOpen={Boolean(ticketForKtv)}
              onClose={() => setTicketForKtv(null)}
              ticket={ticketForKtv}
              onAcceptWithBefore={ktvAcceptTicket}
              onSubmitCompletion={ktvSubmitCompletion}
            />
          )}

          {/* 7. General Ticket Detail Modal (Progress timeline) */}
          {selectedTicket && (
            <TicketDetailModal
              isOpen={Boolean(selectedTicket)}
              onClose={() => setSelectedTicket(null)}
              ticket={tickets.find((t) => t.id === selectedTicket.id) || selectedTicket}
              currentUserRole={currentUser.role}
              onOpenClassify={(ticket) => setTicketForClassify(ticket)}
              onOpenAcceptance={(ticket) => setTicketForAcceptance(ticket)}
              onOpenAssign={(ticket) => setTicketForAssign(ticket)}
              onOpenVerifyComplaint={(ticket) => setTicketForVerifyComplaint(ticket)}
              onKtvAction={(ticket) => setTicketForKtv(ticket)}
            />
          )}

          {/* 6. Switch Account Modal (Role-specific: between BQLs, between KTVs, between Residents) */}
          <SwitchAccountModal
            isOpen={isSwitchAccountOpen}
            onClose={() => setIsSwitchAccountOpen(false)}
            currentUser={currentUser}
            onSwitchAccount={switchAccount}
            onLogin={login}
            onLogout={logout}
          />

          {/* 7. General Login Modal */}
          <LoginModal
            isOpen={isLoginOpen}
            onClose={() => setIsLoginOpen(false)}
            onLogin={login}
          />

        </PhoneFrame>
      </main>

    </div>
  );
}
