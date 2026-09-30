import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/views/DashboardView';
import { ProjectsView } from './components/views/ProjectsView';
import { ProposalsView } from './components/views/ProposalsView';
import { WorkspaceView } from './components/views/WorkspaceView';
import { FreelancersDirectoryView } from './components/views/FreelancersDirectoryView';
import { WalletView } from './components/views/WalletView';
import { DisputesView } from './components/views/DisputesView';
import { ReviewsView } from './components/views/ReviewsView';
import { SettingsView } from './components/views/SettingsView';

import { CreateProjectModal } from './components/modals/CreateProjectModal';
import { TopUpModal } from './components/modals/TopUpModal';
import { ReviewModal } from './components/modals/ReviewModal';
import { AiAssistantModal } from './components/modals/AiAssistantModal';

import {
  initialClientProfile,
  initialProjects,
  initialProposals,
  initialContracts,
  initialFreelancers,
  initialTransactions,
  initialDisputes,
  initialReviews,
  initialNotifications
} from './data/mockData';
import {
  ClientProfile,
  Project,
  Proposal,
  Contract,
  FreelancerItem,
  WalletTransaction,
  DisputeRecord,
  ReviewRecord,
  NotificationItem,
  TaskItem,
  ScopeChangeRequest,
  ChatMessage
} from './types';

export default function App() {
  // Persistence state
  const [clientProfile, setClientProfile] = useState<ClientProfile>(() => {
    const saved = localStorage.getItem('hf_client_profile');
    return saved ? JSON.parse(saved) : initialClientProfile;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('hf_client_projects');
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const saved = localStorage.getItem('hf_client_proposals');
    return saved ? JSON.parse(saved) : initialProposals;
  });

  const [contracts, setContracts] = useState<Contract[]>(() => {
    const saved = localStorage.getItem('hf_client_contracts');
    return saved ? JSON.parse(saved) : initialContracts;
  });

  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem('hf_client_transactions');
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [disputes, setDisputes] = useState<DisputeRecord[]>(() => {
    const saved = localStorage.getItem('hf_client_disputes');
    return saved ? JSON.parse(saved) : initialDisputes;
  });

  const [reviews, setReviews] = useState<ReviewRecord[]>(() => {
    const saved = localStorage.getItem('hf_client_reviews');
    return saved ? JSON.parse(saved) : initialReviews;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('hf_client_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>('proj-1');
  const [activeContractId, setActiveContractId] = useState<string>('cont-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [isArabic, setIsArabic] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Modals state
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [contractForReview, setContractForReview] = useState<Contract | null>(null);
  const [isAiAssistantModalOpen, setIsAiAssistantModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('hf_client_profile', JSON.stringify(clientProfile));
  }, [clientProfile]);

  useEffect(() => {
    localStorage.setItem('hf_client_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('hf_client_proposals', JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem('hf_client_contracts', JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem('hf_client_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('hf_client_disputes', JSON.stringify(disputes));
  }, [disputes]);

  useEffect(() => {
    localStorage.setItem('hf_client_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('hf_client_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Adjust HTML dir and lang on change
  useEffect(() => {
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = isArabic ? 'ar' : 'en';
  }, [isArabic]);

  // Handle language toggle
  const toggleLanguage = () => {
    setIsArabic((prev) => !prev);
  };

  // Notification handlers
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  // Handle New Project Creation
  const handleSaveProject = (
    projectData: Omit<Project, 'id' | 'clientId' | 'proposalsCount' | 'publishedAt'>
  ) => {
    const newId = `proj-${Date.now()}`;
    const newProject: Project = {
      ...projectData,
      id: newId,
      clientId: clientProfile.id,
      proposalsCount: 0,
      publishedAt: new Date().toISOString().split('T')[0]
    };

    setProjects((prev) => [newProject, ...prev]);

    // Add notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: isArabic ? 'تم نشر مشروع جديد بنجاح' : 'Project Published',
        message: isArabic
          ? `مشروعك "${newProject.title}" أصبح متاحاً لتلقي عروض المستقلين.`
          : `Your project "${newProject.title}" is now open for bids.`,
        type: 'system',
        isRead: false,
        createdAt: isArabic ? 'الآن' : 'Just now',
        linkTab: 'projects'
      },
      ...prev
    ]);

    setActiveTab('projects');
  };

  // Handle Proposal Acceptance -> Creates Contract & Escrow Lock!
  const handleAcceptProposal = (proposalId: string) => {
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal) return;

    const project = projects.find((p) => p.id === proposal.projectId);
    const contractId = `cont-${Date.now()}`;
    const orderNum = `ORD-${Math.floor(100 + Math.random() * 900)}`;

    // 1. Create new Contract
    const newContract: Contract = {
      id: contractId,
      orderNumber: orderNum,
      projectId: proposal.projectId,
      projectTitle: proposal.projectTitle || project?.title || 'مشروع جديد',
      clientId: clientProfile.id,
      clientName: clientProfile.name,
      freelancerId: proposal.freelancerId,
      freelancerName: proposal.freelancerName,
      freelancerAvatar: proposal.freelancerAvatar,
      freelancerSpecialty: proposal.freelancerTitle,
      contractValue: proposal.proposedPrice,
      escrowHeld: proposal.proposedPrice,
      commission: Math.round(proposal.proposedPrice * 0.1),
      status: 'in_progress',
      paymentStatus: 'escrow_held',
      startDate: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(
        Date.now() + proposal.proposedDurationDays * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0],
      tasks: [
        {
          id: `task-${Date.now()}-1`,
          contractId,
          title: isArabic ? 'جلسة التدشين والاتفاق المبدئي' : 'Kickoff & Initial Alignment',
          status: 'completed',
          dueDate: new Date().toISOString().split('T')[0],
          assignedTo: proposal.freelancerName
        },
        {
          id: `task-${Date.now()}-2`,
          contractId,
          title: isArabic ? 'تنفيذ وتسليم النسخة الأولية' : 'Milestone 1 Implementation',
          status: 'in_progress',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          assignedTo: proposal.freelancerName
        }
      ],
      scopeChanges: [],
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderId: clientProfile.id,
          senderName: clientProfile.name,
          senderRole: 'client',
          text: isArabic
            ? `مرحباً ${proposal.freelancerName}، تم قبول عرضك وإيداع مبلغ العقد ($${proposal.proposedPrice}) في حساب الضمان Escrow. بالتوفيق في التنفيذ!`
            : `Hello ${proposal.freelancerName}, your proposal has been accepted and $${proposal.proposedPrice} is securely locked in Escrow. Let's build!`,
          timestamp: isArabic ? 'الآن' : 'Just now'
        }
      ]
    };

    // 2. Update proposals status
    setProposals((prev) =>
      prev.map((pr) =>
        pr.id === proposalId
          ? { ...pr, status: 'accepted' }
          : pr.projectId === proposal.projectId
          ? { ...pr, status: 'rejected' }
          : pr
      )
    );

    // 3. Update project status
    setProjects((prev) =>
      prev.map((proj) =>
        proj.id === proposal.projectId
          ? { ...proj, status: 'in_progress', chosenFreelancerId: proposal.freelancerId }
          : proj
      )
    );

    // 4. Append Contract & Transaction
    setContracts((prev) => [newContract, ...prev]);

    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        transactionNumber: `TX-${Math.floor(800 + Math.random() * 200)}`,
        contractId: newContract.id,
        projectTitle: newContract.projectTitle,
        counterpartyName: newContract.freelancerName,
        type: 'escrow_lock',
        amount: newContract.contractValue,
        platformFee: 0,
        status: 'completed',
        date: new Date().toISOString().split('T')[0],
        description: isArabic
          ? `حجز ضمان مالي لعقد ${orderNum} (${newContract.freelancerName})`
          : `Escrow lock for contract ${orderNum}`
      },
      ...prev
    ]);

    // 5. Notify & Navigate
    setActiveContractId(newContract.id);
    setActiveTab('workspace');

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: isArabic ? 'تم تفعيل العقد وحجز الضمان' : 'Contract Activated',
        message: isArabic
          ? `تم بدء العقد مع ${proposal.freelancerName} وتأمين مبلغ $${proposal.proposedPrice} في الضمان.`
          : `Started contract with ${proposal.freelancerName}, $${proposal.proposedPrice} secured in escrow.`,
        type: 'milestone',
        isRead: false,
        createdAt: isArabic ? 'الآن' : 'Just now',
        linkTab: 'workspace'
      },
      ...prev
    ]);
  };

  const handleRejectProposal = (proposalId: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, status: 'rejected' } : p))
    );
  };

  // Scope Change Decision (Approve / Reject)
  const handleApproveScopeChange = (contractId: string, scopeChangeId: string) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        const change = c.scopeChanges.find((sc) => sc.id === scopeChangeId);
        if (!change) return c;

        const updatedPrice = c.contractValue + change.priceAdjustment;
        const updatedEscrow = c.escrowHeld + change.priceAdjustment;

        return {
          ...c,
          contractValue: updatedPrice,
          escrowHeld: updatedEscrow,
          scopeChanges: c.scopeChanges.map((sc) =>
            sc.id === scopeChangeId
              ? { ...sc, status: 'approved', responseNote: 'تمت الموافقة من العميل' }
              : sc
          ),
          messages: [
            ...c.messages,
            {
              id: `msg-${Date.now()}`,
              senderId: clientProfile.id,
              senderName: clientProfile.name,
              senderRole: 'client',
              text: isArabic
                ? `وافقت على طلب تعديل النطاق (+${change.priceAdjustment}$ و +${change.durationAdjustment} أيام). تم تحديث الضمان المالي تلقائياً.`
                : `Approved scope change (+ $${change.priceAdjustment} & +${change.durationAdjustment} days). Escrow updated.`,
              timestamp: isArabic ? 'الآن' : 'Just now'
            }
          ]
        };
      })
    );

    // Record extra escrow lock in transactions
    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        transactionNumber: `TX-${Math.floor(900 + Math.random() * 100)}`,
        contractId,
        type: 'escrow_lock',
        amount: 150,
        platformFee: 0,
        status: 'completed',
        date: new Date().toISOString().split('T')[0],
        description: isArabic
          ? 'إيداع إضافي في الضمان المالي لتعديل نطاق العمل المعتمد'
          : 'Additional escrow deposit for approved scope change'
      },
      ...prev
    ]);
  };

  const handleRejectScopeChange = (contractId: string, scopeChangeId: string) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        return {
          ...c,
          scopeChanges: c.scopeChanges.map((sc) =>
            sc.id === scopeChangeId
              ? { ...sc, status: 'rejected', responseNote: 'رفض العميل التعديل' }
              : sc
          )
        };
      })
    );
  };

  // Task status toggle
  const handleToggleTaskStatus = (contractId: string, taskId: string) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        return {
          ...c,
          tasks: c.tasks.map((t) =>
            t.id === taskId
              ? { ...t, status: t.status === 'completed' ? 'in_progress' : 'completed' }
              : t
          )
        };
      })
    );
  };

  // Add task
  const handleAddTask = (
    contractId: string,
    taskData: Omit<TaskItem, 'id' | 'contractId'>
  ) => {
    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        const newTask: TaskItem = {
          ...taskData,
          id: `task-${Date.now()}`,
          contractId
        };
        return {
          ...c,
          tasks: [...c.tasks, newTask]
        };
      })
    );
  };

  // Live Chat send message
  const handleSendMessage = (
    contractId: string,
    messageText: string,
    attachmentName?: string
  ) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: clientProfile.id,
      senderName: clientProfile.name,
      senderRole: 'client',
      text: messageText,
      timestamp: isArabic ? 'الآن' : 'Just now',
      attachment: attachmentName
        ? {
            name: attachmentName,
            size: '2.4 MB',
            type: 'pdf'
          }
        : undefined
    };

    setContracts((prev) =>
      prev.map((c) => {
        if (c.id !== contractId) return c;
        return {
          ...c,
          messages: [...c.messages, newMsg]
        };
      })
    );
  };

  // Release Escrow & complete project
  const handleReleaseEscrow = (contractId: string) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return;

    // 1. Update contract
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? {
              ...c,
              status: 'completed',
              paymentStatus: 'released',
              escrowHeld: 0
            }
          : c
      )
    );

    // 2. Record transaction release
    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        transactionNumber: `TX-${Math.floor(950 + Math.random() * 50)}`,
        contractId,
        projectTitle: contract.projectTitle,
        counterpartyName: contract.freelancerName,
        type: 'release',
        amount: contract.contractValue,
        platformFee: contract.commission,
        status: 'completed',
        date: new Date().toISOString().split('T')[0],
        description: isArabic
          ? `تحرير مستحقات العقد (${contract.orderNumber}) للمستقل بعد اعتماد المخرجات`
          : `Escrow funds release to ${contract.freelancerName}`
      },
      ...prev
    ]);

    // 3. Prompt review modal
    setContractForReview(contract);
    setIsReviewModalOpen(true);
  };

  // Top Up Wallet Balance
  const handleTopUpSuccess = (amount: number, method: string) => {
    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        transactionNumber: `TX-${Math.floor(700 + Math.random() * 200)}`,
        type: 'deposit',
        amount,
        platformFee: 0,
        status: 'completed',
        date: new Date().toISOString().split('T')[0],
        description: isArabic
          ? `إيداع رصيد بالمحفظة عبر ${method}`
          : `Wallet balance deposit via ${method}`
      },
      ...prev
    ]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: isArabic ? 'إيداع رصيد ناجح' : 'Deposit Successful',
        message: isArabic
          ? `تم إضافة $${amount} إلى محفظتك الرقمية بنجاح.`
          : `$${amount} was successfully credited to your wallet.`,
        type: 'payment',
        isRead: false,
        createdAt: isArabic ? 'الآن' : 'Just now',
        linkTab: 'wallet'
      },
      ...prev
    ]);
  };

  // Submit Review
  const handleSubmitReview = (
    contractId: string,
    rating: number,
    feedback: string,
    tags: string[]
  ) => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) return;

    const newRev: ReviewRecord = {
      id: `rev-${Date.now()}`,
      contractId,
      projectTitle: contract.projectTitle,
      freelancerId: contract.freelancerId,
      freelancerName: contract.freelancerName,
      freelancerAvatar: contract.freelancerAvatar,
      freelancerSpecialty: contract.freelancerSpecialty,
      rating,
      feedback,
      tags,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setReviews((prev) => [newRev, ...prev]);
    setActiveTab('reviews');
  };

  // Open Dispute
  const handleOpenNewDispute = (
    disputeData: Omit<DisputeRecord, 'id' | 'disputeNumber' | 'filedAt' | 'status'>
  ) => {
    const newDisp: DisputeRecord = {
      ...disputeData,
      id: `disp-${Date.now()}`,
      disputeNumber: `DSP-${Math.floor(100 + Math.random() * 900)}`,
      status: 'under_review',
      filedAt: new Date().toISOString().split('T')[0],
      resolution: isArabic
        ? 'تم استلام البلاغ، وفريق الوساطة يراجع محادثات العقد وملفات التسليم حالياً.'
        : 'Dispute submitted. Mediation team is reviewing.'
    };

    setDisputes((prev) => [newDisp, ...prev]);
    setActiveTab('disputes');
  };

  // Quick navigation helpers
  const handleSelectProjectProposals = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveTab('proposals');
  };

  const handleOpenWorkspaceForProject = (projectId: string) => {
    const foundContract = contracts.find((c) => c.projectId === projectId);
    if (foundContract) {
      setActiveContractId(foundContract.id);
    }
    setActiveTab('workspace');
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm(isArabic ? 'هل أنت متأكد من حذف هذا المشروع؟' : 'Delete this project?')) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    }
  };

  const handleOpenChatWithFreelancer = (freelancerId: string, freelancerName: string) => {
    const matchedContract = contracts.find((c) => c.freelancerId === freelancerId);
    if (matchedContract) {
      setActiveContractId(matchedContract.id);
      setActiveTab('workspace');
    } else {
      alert(isArabic ? `يمكنك مراسلة ${freelancerName} فور قبول عرضه وبدء العقد.` : `You can chat with ${freelancerName} once contracted.`);
    }
  };

  const handleInviteFreelancer = (freelancer: FreelancerItem) => {
    alert(isArabic ? `تم إرسال دعوة للمستقل ${freelancer.name} للتقديم على مشاريعك المفتوحة!` : `Invitation sent to ${freelancer.name}!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800 font-sans">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <div
        className={`fixed md:sticky top-0 h-screen z-50 transition-transform duration-300 ${
          isMobileMenuOpen
            ? 'translate-x-0'
            : isArabic
            ? 'translate-x-full md:translate-x-0'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsMobileMenuOpen(false);
          }}
          openNewProjectModal={() => setIsNewProjectModalOpen(true)}
          isArabic={isArabic}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <Header
          notifications={notifications}
          markNotificationRead={markNotificationRead}
          onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
          isArabic={isArabic}
          toggleLanguage={toggleLanguage}
          openAiAssistantModal={() => setIsAiAssistantModalOpen(true)}
          clientProfile={clientProfile}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              clientProfile={clientProfile}
              projects={projects}
              contracts={contracts}
              proposals={proposals}
              setActiveTab={setActiveTab}
              openNewProjectModal={() => setIsNewProjectModalOpen(true)}
              onSelectProjectProposals={handleSelectProjectProposals}
              onSelectContract={(id) => {
                setActiveContractId(id);
                setActiveTab('workspace');
              }}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              projects={projects}
              openNewProjectModal={() => setIsNewProjectModalOpen(true)}
              onSelectProjectProposals={handleSelectProjectProposals}
              onOpenWorkspaceForProject={handleOpenWorkspaceForProject}
              onDeleteProject={handleDeleteProject}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'proposals' && (
            <ProposalsView
              projects={projects}
              proposals={proposals}
              selectedProjectId={selectedProjectId}
              setSelectedProjectId={setSelectedProjectId}
              onAcceptProposal={handleAcceptProposal}
              onRejectProposal={handleRejectProposal}
              onOpenChatWithFreelancer={handleOpenChatWithFreelancer}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'workspace' && (
            <WorkspaceView
              contracts={contracts}
              activeContractId={activeContractId}
              setActiveContractId={setActiveContractId}
              onApproveScopeChange={handleApproveScopeChange}
              onRejectScopeChange={handleRejectScopeChange}
              onToggleTaskStatus={handleToggleTaskStatus}
              onAddTask={handleAddTask}
              onSendMessage={handleSendMessage}
              onReleaseEscrow={handleReleaseEscrow}
              onOpenDispute={() => setActiveTab('disputes')}
              onOpenReviewModal={(c) => {
                setContractForReview(c);
                setIsReviewModalOpen(true);
              }}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'freelancers' && (
            <FreelancersDirectoryView
              freelancers={initialFreelancers}
              onInviteFreelancer={handleInviteFreelancer}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'wallet' && (
            <WalletView
              transactions={transactions}
              openTopUpModal={() => setIsTopUpModalOpen(true)}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'disputes' && (
            <DisputesView
              disputes={disputes}
              contracts={contracts}
              onOpenNewDispute={handleOpenNewDispute}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsView
              reviews={reviews}
              contracts={contracts}
              onOpenReviewModal={(c) => {
                setContractForReview(c);
                setIsReviewModalOpen(true);
              }}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              clientProfile={clientProfile}
              onUpdateProfile={(updated) =>
                setClientProfile((prev) => ({ ...prev, ...updated }))
              }
              isArabic={isArabic}
              toggleLanguage={toggleLanguage}
            />
          )}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <CreateProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSaveProject={handleSaveProject}
        isArabic={isArabic}
      />

      <TopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        onTopUpSuccess={handleTopUpSuccess}
        isArabic={isArabic}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        contract={contractForReview}
        onSubmitReview={handleSubmitReview}
        isArabic={isArabic}
      />

      <AiAssistantModal
        isOpen={isAiAssistantModalOpen}
        onClose={() => setIsAiAssistantModalOpen(false)}
        openNewProjectModal={() => {
          setIsAiAssistantModalOpen(false);
          setIsNewProjectModalOpen(true);
        }}
        isArabic={isArabic}
      />
    </div>
  );
}
