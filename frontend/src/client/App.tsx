import React, { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
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
import { ClientSubscriptionsView } from './components/views/ClientSubscriptionsView';

import { CreateProjectModal } from './components/modals/CreateProjectModal';
import { TopUpModal } from './components/modals/TopUpModal';
import { ReviewModal } from './components/modals/ReviewModal';
import { AiAssistantModal } from './components/modals/AiAssistantModal';

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
  ChatMessage,
  AiMatchingBreakdown
} from './types';
import { API_BASE, API_ORIGIN } from '../shared/apiConfig.js';
import { initialsAvatar } from '../shared/avatar.js';
import { clientRequest, errorText } from './api';
import { InviteFreelancerModal } from './components/modals/InviteFreelancerModal';

const readHubUser = () => {
  try {
    const raw = localStorage.getItem('hub_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const buildInitialClientProfile = (): ClientProfile => {
  const hubUser = readHubUser();
  const name = hubUser?.name ? String(hubUser.name) : '';

  return {
    id: hubUser?.profile?.id != null ? String(hubUser.profile.id) : '',
    userId: hubUser?.id != null ? String(hubUser.id) : '',
    name,
    companyName: '',
    email: hubUser?.email ? String(hubUser.email) : '',
    phone: hubUser?.phone ? String(hubUser.phone) : '',
    logo: hubUser?.profile_image || initialsAvatar(name),
    bio: '',
    location: '',
    website: '',
    joinedDate: hubUser?.created_at ? String(hubUser.created_at).slice(0, 10) : '',
    accountStatus: hubUser?.account_status === 'disabled' ? 'disabled' : 'active'
  };
};

const mapBackendClientProfile = (
  data: {
    id: number;
    user_id: number;
    company_name: string | null;
    logo: string | null;
    bio?: string | null;
    location?: string | null;
    website?: string | null;
  },
  hubUser: {
    id?: number;
    name?: string;
    email?: string;
    phone?: string | null;
    profile_image?: string | null;
    account_status?: string;
    created_at?: string;
  } | null,
  fallback: ClientProfile
): ClientProfile => ({
  id: String(data.id),
  userId: String(data.user_id ?? hubUser?.id ?? fallback.userId),
  name: hubUser?.name ? String(hubUser.name) : fallback.name,
  companyName: data.company_name == null ? '' : String(data.company_name),
  email: hubUser?.email ? String(hubUser.email) : fallback.email,
  phone: hubUser?.phone == null ? '' : String(hubUser.phone),
  logo: data.logo || hubUser?.profile_image || initialsAvatar(hubUser?.name || fallback.name),
  bio: data.bio == null ? '' : String(data.bio),
  location: data.location == null ? '' : String(data.location),
  website: data.website == null ? '' : String(data.website),
  joinedDate: hubUser?.created_at
    ? String(hubUser.created_at).slice(0, 10)
    : fallback.joinedDate,
  accountStatus: hubUser?.account_status === 'disabled' ? 'disabled' : 'active'
});

const toProjectNumber = (value: unknown, fallback = 0) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : fallback;
};

const deriveProjectDeadline = (publishedAt: string, durationDays: number) => {
  if (!publishedAt || !durationDays) {
    return '';
  }

  const start = new Date(publishedAt);
  if (Number.isNaN(start.getTime())) {
    return '';
  }

  start.setUTCDate(start.getUTCDate() + durationDays);
  return start.toISOString().slice(0, 10);
};

const mapBackendProject = (data: Record<string, unknown>): Project => {
  const durationDays = Math.max(0, Math.trunc(toProjectNumber(data.duration)));
  const publishedAt = data.published_at == null ? '' : String(data.published_at).slice(0, 10);
  const chosenId = data.chosen_freelancer_id;

  return {
    id: String(data.id),
    clientId: String(data.client_id),
    title: data.title == null ? '' : String(data.title),
    description: data.description == null ? '' : String(data.description),
    category: data.category == null ? '' : String(data.category),
    budgetMin: toProjectNumber(data.budget_min),
    budgetMax: toProjectNumber(data.budget_max),
    durationDays,
    requiredSkills: Array.isArray(data.required_skills)
      ? data.required_skills.map((skill) => String(skill))
      : [],
    attachments: Array.isArray(data.attachments)
      ? data.attachments.map((item) => String(item))
      : [],
    status: (data.status == null ? 'draft' : String(data.status)) as Project['status'],
    proposalsCount: 0,
    ...(chosenId == null ? {} : { chosenFreelancerId: String(chosenId) }),
    publishedAt,
    deadline: deriveProjectDeadline(publishedAt, durationDays)
  };
};

const PLACEHOLDER_AVATAR =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect fill="#e2e8f0" width="56" height="56"/></svg>'
  );

const isBackendProjectId = (value: string | null | undefined) =>
  Boolean(value && /^\d+$/.test(String(value)));

const toConversationNumericId = (value: string | null | undefined): number | null => {
  if (!isBackendProjectId(value)) {
    return null;
  }
  return Number(value);
};

type ChatAck = {
  success?: boolean;
  message?: string;
  statusCode?: number;
  data?: unknown;
};

const mapBackendProposal = (data: Record<string, unknown>): Proposal => ({
  id: String(data.id),
  projectId: String(data.project_id),
  freelancerId: String(data.freelancer_id),
  freelancerName: '—',
  freelancerAvatar: PLACEHOLDER_AVATAR,
  freelancerTitle: '',
  freelancerRating: 0,
  freelancerCompletedCount: 0,
  proposedPrice: toProjectNumber(data.proposed_price),
  proposedDurationDays: Math.max(0, Math.trunc(toProjectNumber(data.proposed_duration))),
  coverLetter: data.message == null ? '' : String(data.message),
  status: (data.status == null ? 'pending' : String(data.status)) as Proposal['status'],
  submittedAt: data.submitted_at == null ? '' : String(data.submitted_at),
  aiMatching: null
});

const mapBackendContract = (data: Record<string, unknown>): Contract => ({
  id: String(data.id),
  orderNumber: '',
  projectId: String(data.project_id),
  projectTitle: data.project_title == null ? '' : String(data.project_title),
  clientId: String(data.client_id),
  clientName: data.client_name == null ? '' : String(data.client_name),
  freelancerId: String(data.freelancer_id),
  freelancerName: data.freelancer_name == null ? '' : String(data.freelancer_name),
  freelancerAvatar: initialsAvatar(data.freelancer_name == null ? '' : String(data.freelancer_name)),
  freelancerSpecialty: '',
  contractValue: toProjectNumber(data.contract_value),
  escrowHeld: 0,
  commission: data.commission == null ? 0 : toProjectNumber(data.commission),
  status: (data.status == null ? 'in_progress' : String(data.status)) as Contract['status'],
  paymentStatus: (data.payment_status === 'released' ? 'released' : 'pending') as Contract['paymentStatus'],
  startDate: data.start_date == null ? '' : String(data.start_date),
  deliveryDate: data.delivery_date == null ? null : String(data.delivery_date),
  tasks: [],
  scopeChanges: [],
  messages: []
});

const mapBackendTask = (data: Record<string, unknown>): TaskItem => {
  const status = String(data.status ?? '');
  const description = data.description == null ? '' : String(data.description);

  return {
    id: String(data.id),
    contractId: String(data.contract_id),
    title: data.title == null ? '' : String(data.title),
    ...(description ? { description } : {}),
    status:
      status === 'todo' || status === 'in_progress' || status === 'completed'
        ? status
        : 'todo',
    dueDate: data.due_date == null ? '' : String(data.due_date),
    assignedTo: ''
  };
};

const mapBackendScopeChange = (data: Record<string, unknown>): ScopeChangeRequest => {
  const status = String(data.status ?? '');

  return {
    id: String(data.id),
    contractId: String(data.contract_id ?? ''),
    requestedBy: data.requested_by == null ? '' : String(data.requested_by),
    description: data.description == null ? '' : String(data.description),
    priceAdjustment: toProjectNumber(data.price_adjustment),
    durationAdjustment: Math.trunc(toProjectNumber(data.duration_adjustment)),
    status:
      status === 'approved' || status === 'rejected' || status === 'pending'
        ? status
        : 'pending',
    requestedAt: ''
  };
};

const mapBackendReview = (
  data: Record<string, unknown>,
  contract: Contract
): ReviewRecord => ({
  id: String(data.id),
  contractId: String(data.contract_id ?? contract.id),
  projectTitle: contract.projectTitle,
  freelancerId: contract.freelancerId,
  freelancerName: contract.freelancerName,
  freelancerAvatar: contract.freelancerAvatar,
  freelancerSpecialty: contract.freelancerSpecialty,
  ...(data.rating == null ? { rating: 0 } : { rating: toProjectNumber(data.rating) }),
  feedback: data.comment == null ? '' : String(data.comment),
  createdAt: '',
  tags: []
});

const loadBackendReviewsForContracts = async ({
  contractList,
  token,
  reviewerUserId
}: {
  contractList: Contract[];
  token: string;
  reviewerUserId: string;
}): Promise<ReviewRecord[]> => {
  const realContracts = contractList.filter(
    (contract) =>
      isBackendProjectId(contract.id) && isBackendProjectId(contract.freelancerId)
  );

  const contractsByFreelancer = new Map<string, Contract[]>();
  for (const contract of realContracts) {
    const existing = contractsByFreelancer.get(contract.freelancerId) || [];
    existing.push(contract);
    contractsByFreelancer.set(contract.freelancerId, existing);
  }

  const collected: ReviewRecord[] = [];

  for (const [freelancerId, relatedContracts] of contractsByFreelancer) {
    const reviewsData = await readSuccessData(
      `${API_BASE}/freelancers/${freelancerId}/reviews`,
      token
    );

    if (!Array.isArray(reviewsData)) {
      continue;
    }

    for (const row of reviewsData) {
      const record = asRecord(row);
      if (!record) {
        continue;
      }

      const contract = relatedContracts.find(
        (item) => String(item.id) === String(record.contract_id)
      );
      if (!contract) {
        continue;
      }

      if (
        reviewerUserId &&
        record.reviewer_id != null &&
        String(record.reviewer_id) !== reviewerUserId
      ) {
        continue;
      }

      collected.push(mapBackendReview(record, contract));
    }
  }

  return collected;
};

const mapBackendNotificationType = (
  value: unknown
): NotificationItem['type'] => {
  const type = String(value ?? '').toUpperCase();
  if (type.includes('PROPOSAL')) return 'proposal';
  if (type.includes('SCOPE_CHANGE')) return 'scope_change';
  if (type.includes('PAYMENT') || type.includes('ESCROW')) return 'payment';
  if (type.includes('CONTRACT') || type.includes('DELIVER')) return 'milestone';
  return 'system';
};

const mapBackendNotification = (data: Record<string, unknown>): NotificationItem => {
  const type = mapBackendNotificationType(data.type);
  const rawType = data.type == null ? '' : String(data.type);

  return {
    id: String(data.id),
    title: rawType ? rawType.replace(/_/g, ' ') : 'Notification',
    message: data.message == null ? '' : String(data.message),
    type,
    isRead: Boolean(data.is_read),
    createdAt: data.created_at == null ? '' : String(data.created_at)
  };
};

const mapBackendFreelancer = (data: Record<string, unknown>): FreelancerItem => ({
  id: String(data.id),
  name: '',
  avatar: PLACEHOLDER_AVATAR,
  specialty: '',
  category: '',
  bio: data.bio == null ? '' : String(data.bio),
  experienceYears: Math.max(0, Math.trunc(toProjectNumber(data.experience_years))),
  hourlyRate: 0,
  ratingAvg: toProjectNumber(data.rating_avg),
  completedProjectsCount: Math.max(
    0,
    Math.trunc(toProjectNumber(data.completed_projects_count))
  ),
  skills: [],
  portfolio: []
});

const enrichMappedFreelancer = async ({
  freelancer,
  token,
  userId,
  specialtyId,
  specialtyNameById
}: {
  freelancer: FreelancerItem;
  token: string;
  userId: unknown;
  specialtyId: unknown;
  specialtyNameById: Map<string, string>;
}): Promise<FreelancerItem> => {
  let name = freelancer.name;
  let avatar = freelancer.avatar;
  let specialty = freelancer.specialty;
  let portfolio = freelancer.portfolio;

  if (specialtyId != null && String(specialtyId).trim() !== '') {
    const matched = specialtyNameById.get(String(specialtyId));
    if (matched) {
      specialty = matched;
    }
  }

  if (userId != null && String(userId).trim() !== '') {
    const userData = asRecord(
      await readSuccessData(`${API_BASE}/users/${userId}`, token)
    );
    if (userData?.name != null && String(userData.name).trim()) {
      name = String(userData.name);
    }
    if (userData?.profile_image != null && String(userData.profile_image).trim()) {
      avatar = String(userData.profile_image);
    }
  }

  const portfolioData = await readSuccessData(
    `${API_BASE}/freelancers/${freelancer.id}/portfolio`,
    token
  );
  if (Array.isArray(portfolioData)) {
    portfolio = portfolioData
      .map((row) => asRecord(row))
      .filter((row): row is Record<string, unknown> => Boolean(row))
      .map((row) => ({
        title: row.title == null ? '' : String(row.title),
        image: row.image_url == null ? '' : String(row.image_url),
        ...(row.project_url == null || !String(row.project_url).trim()
          ? {}
          : { link: String(row.project_url) })
      }))
      .filter((item) => Boolean(item.image));
  }

  return {
    ...freelancer,
    name,
    avatar,
    specialty,
    portfolio
  };
};

const mapBackendMessage = (
  data: Record<string, unknown>,
  ctx: {
    hubUserId: string;
    clientName: string;
    freelancerName: string;
    freelancerAvatar: string;
  }
): ChatMessage => {
  const senderId = String(data.sender_id ?? '');
  const isOwn = Boolean(ctx.hubUserId) && senderId === ctx.hubUserId;
  const attachments = data.attachments;
  let attachment: ChatMessage['attachment'];

  if (Array.isArray(attachments) && attachments.length > 0) {
    const first = attachments[0];
    if (typeof first === 'string' && first.trim()) {
      const url = first.trim();
      const isUrl = /^https?:\/\//i.test(url);
      const fileName = isUrl ? decodeURIComponent(url.split('/').pop() || url) : url;
      attachment = {
        name: isUrl && data.message ? String(data.message) : fileName,
        size: '',
        type: '',
        ...(isUrl ? { url } : {})
      };
    }
  }

  return {
    id: String(data.id),
    senderId,
    senderName: isOwn ? ctx.clientName : ctx.freelancerName,
    senderRole: isOwn ? 'client' : 'freelancer',
    ...(isOwn || !ctx.freelancerAvatar ? {} : { avatar: ctx.freelancerAvatar }),
    text: data.message == null ? '' : String(data.message),
    timestamp: data.created_at == null ? '' : String(data.created_at),
    ...(attachment ? { attachment } : {})
  };
};

const mapBackendTransaction = (data: Record<string, unknown>): WalletTransaction => {
  const backendType = String(data.type ?? '');
  const type: WalletTransaction['type'] =
    backendType === 'escrow'
      ? 'escrow_lock'
      : backendType === 'release'
        ? 'release'
        : backendType === 'refund'
          ? 'refund'
          : 'deposit';

  return {
    id: String(data.id),
    transactionNumber: String(data.id),
    ...(data.contract_id == null ? {} : { contractId: String(data.contract_id) }),
    type,
    amount: toProjectNumber(data.amount),
    platformFee: data.commission == null ? 0 : toProjectNumber(data.commission),
    status: 'completed',
    date: data.created_at ? String(data.created_at).slice(0, 10) : '',
    description: ''
  };
};

const applyEscrowHeldFromTransactions = (
  contractList: Contract[],
  txList: WalletTransaction[]
): Contract[] =>
  contractList.map((contract) => {
    if (!isBackendProjectId(contract.id)) {
      return contract;
    }

    const released = txList.find(
      (tx) => tx.contractId === contract.id && tx.type === 'release'
    );

    if (released || contract.paymentStatus === 'released') {
      return {
        ...contract,
        escrowHeld: 0
      };
    }

    const funded = txList.find(
      (tx) => tx.contractId === contract.id && tx.type === 'escrow_lock'
    );

    return {
      ...contract,
      escrowHeld: funded ? funded.amount : 0
    };
  });

const readSuccessData = async (url: string, token?: string): Promise<unknown> => {
  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok || !payload?.success) {
      return null;
    }

    return payload.data ?? null;
  } catch {
    return null;
  }
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const resolveConversationId = async ({
  projectId,
  token,
  preferredId
}: {
  projectId: string;
  token: string;
  preferredId?: string;
}): Promise<string | null> => {
  const conversationsData = await readSuccessData(
    `${API_BASE}/conversations`,
    token
  );

  if (Array.isArray(conversationsData)) {
    const rows = conversationsData
      .map((row) => asRecord(row))
      .filter((row): row is Record<string, unknown> => Boolean(row));

    if (preferredId && isBackendProjectId(preferredId)) {
      const preferred = rows.find(
        (row) =>
          String(row.id) === preferredId && String(row.project_id) === String(projectId)
      );
      if (preferred) {
        return String(preferred.id);
      }
    }

    const byProject = rows.find((row) => String(row.project_id) === String(projectId));
    if (byProject) {
      return String(byProject.id);
    }

    return null;
  }

  if (preferredId && isBackendProjectId(preferredId)) {
    return preferredId;
  }

  return null;
};

const enrichMappedContract = async ({
  contract,
  token,
  projects,
  clientProfile
}: {
  contract: Contract;
  token: string;
  projects: Project[];
  clientProfile: ClientProfile;
}): Promise<Contract> => {
  let projectTitle = contract.projectTitle;
  let freelancerName = contract.freelancerName;
  let freelancerAvatar = contract.freelancerAvatar;
  let freelancerSpecialty = contract.freelancerSpecialty;
  let clientName = contract.clientName;

  const localProject = projects.find((project) => project.id === contract.projectId);
  if (localProject) {
    projectTitle = localProject.title || '';
  } else if (contract.projectId) {
    const projectData = asRecord(
      await readSuccessData(
        `${API_BASE}/projects/${contract.projectId}`,
        token
      )
    );
    if (projectData?.title != null) {
      projectTitle = String(projectData.title);
    }
  }

  let specialtyId: unknown = null;
  if (contract.freelancerId) {
    const freelancerData = asRecord(
      await readSuccessData(
        `${API_BASE}/freelancers/${contract.freelancerId}`,
        token
      )
    );
    if (freelancerData) {
      specialtyId = freelancerData.specialty_id;
      if (freelancerData.user_id != null) {
        const userData = asRecord(
          await readSuccessData(
            `${API_BASE}/users/${freelancerData.user_id}`,
            token
          )
        );
        if (userData?.name != null && String(userData.name).trim()) {
          freelancerName = String(userData.name);
        }
        if (userData?.profile_image != null && String(userData.profile_image).trim()) {
          freelancerAvatar = String(userData.profile_image);
        }
      }
    }
  }

  if (specialtyId != null && String(specialtyId).trim() !== '') {
    const specialtiesData = await readSuccessData(
      `${API_BASE}/specialties`,
      token
    );
    if (Array.isArray(specialtiesData)) {
      const matched = specialtiesData
        .map((item) => asRecord(item))
        .find((item) => item?.id != null && String(item.id) === String(specialtyId));
      if (matched?.name != null && String(matched.name).trim()) {
        freelancerSpecialty = String(matched.name);
      }
    }
  }

  if (clientProfile.id && contract.clientId === clientProfile.id) {
    if (clientProfile.name) {
      clientName = clientProfile.name;
    }
  } else if (contract.clientId) {
    const clientData = asRecord(
      await readSuccessData(`${API_BASE}/clients/${contract.clientId}`, token)
    );
    if (clientData?.user_id != null) {
      const clientUser = asRecord(
        await readSuccessData(`${API_BASE}/users/${clientData.user_id}`, token)
      );
      if (clientUser?.name != null && String(clientUser.name).trim()) {
        clientName = String(clientUser.name);
      }
    }
  }

  return {
    ...contract,
    projectTitle,
    freelancerName,
    freelancerAvatar,
    freelancerSpecialty,
    clientName,
    orderNumber: ''
  };
};

export default function App() {
  // Persistence state
  const [clientProfile, setClientProfile] = useState<ClientProfile>(buildInitialClientProfile);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState('');
  const deletingProjectIds = useRef(new Set());

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [proposalsError, setProposalsError] = useState('');
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [matchingError, setMatchingError] = useState<string | null>(null);
  const [matchingUsage, setMatchingUsage] = useState<{
    limit: number | null;
    used: number;
    remaining: number | null;
    configured: boolean;
  } | null>(null);
  const rejectingProposalIds = useRef(new Set());
  const acceptingProposalIds = useRef(new Set());
  const matchingInFlight = useRef(false);
  const [tasksError, setTasksError] = useState('');
  const addingTaskContractIds = useRef(new Set());
  const togglingTaskIds = useRef(new Set());
  const attachingTaskContractIds = useRef(new Set());
  const loadedTaskContractIds = useRef(new Set());
  const [scopeChangesError, setScopeChangesError] = useState('');
  const approvingScopeChangeIds = useRef(new Set());
  const rejectingScopeChangeIds = useRef(new Set());
  const attachingScopeContractIds = useRef(new Set());
  const loadedScopeContractIds = useRef(new Set());
  const [chatError, setChatError] = useState('');
  const sendingConversationIds = useRef(new Set());
  const attachingChatContractIds = useRef(new Set());
  const socketRef = useRef<Socket | null>(null);
  const activeConversationIdRef = useRef<string | undefined>(undefined);
  const [socketConnected, setSocketConnected] = useState(false);

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [acceptedContractId, setAcceptedContractId] = useState<string | null>(null);
  const [acceptedConversationId, setAcceptedConversationId] = useState<string | null>(null);

  const [walletBalance, setWalletBalance] = useState(0);
  const [walletEscrowBalance, setWalletEscrowBalance] = useState(0);
  const [walletError, setWalletError] = useState('');
  const [escrowError, setEscrowError] = useState('');
  const fundingContractIds = useRef(new Set());
  const releasingContractIds = useRef(new Set());

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [inviteTarget, setInviteTarget] = useState<FreelancerItem | null>(null);
  const [disputesError, setDisputesError] = useState('');
  const submittingDispute = useRef(false);

  const [realReviews, setRealReviews] = useState<ReviewRecord[]>([]);
  const [reviewsError, setReviewsError] = useState('');
  const submittingReviewIds = useRef(new Set());

  const [freelancers, setFreelancers] = useState<FreelancerItem[]>([]);
  const [freelancersLoading, setFreelancersLoading] = useState(false);
  const [freelancersError, setFreelancersError] = useState('');

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const markingNotificationIds = useRef(new Set());

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeContractId, setActiveContractId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isArabic, setIsArabic] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Modals state
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [contractForReview, setContractForReview] = useState<Contract | null>(null);
  const [isAiAssistantModalOpen, setIsAiAssistantModalOpen] = useState(false);

  const activeConversationId = (
    contracts.find((contract) => contract.id === activeContractId) || contracts[0]
  )?.conversationId;
  activeConversationIdRef.current = activeConversationId;

  useEffect(() => {
    let cancelled = false;

    const loadClientProfile = async () => {
      const token = localStorage.getItem('hub_token');
      const hubUser = readHubUser();
      const profileId = hubUser?.profile?.id;

      if (!token || profileId == null || profileId === '') {
        if (!cancelled) {
          setProfileLoading(false);
          setProfileError('Unable to load profile.');
        }
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/clients/${profileId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 401 || response.status === 403) {
          if (!cancelled) {
            setProfileLoading(false);
            setProfileError('Unable to load profile.');
          }
          return;
        }

        let payload = null;
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }

        if (!response.ok || !payload?.success || !payload?.data) {
          if (!cancelled) {
            setProfileLoading(false);
            setProfileError('Unable to load profile.');
          }
          return;
        }

        if (!cancelled) {
          setClientProfile((prev) => mapBackendClientProfile(payload.data, hubUser, prev));
          setProfileError('');
          setProfileLoading(false);
        }
      } catch {
        if (!cancelled) {
          setProfileLoading(false);
          setProfileError('Unable to load profile.');
        }
      }
    };

    loadClientProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadClientProjects = async () => {
      const token = localStorage.getItem('hub_token');
      const hubUser = readHubUser();
      const profileId = hubUser?.profile?.id;

      if (!token || profileId == null || profileId === '') {
        if (!cancelled) {
          setProjects([]);
          setProjectsLoading(false);
          setProjectsError('Unable to load projects.');
        }
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE}/clients/${profileId}/projects`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.status === 401 || response.status === 403) {
          if (!cancelled) {
            setProjects([]);
            setProjectsLoading(false);
            setProjectsError('Unable to load projects.');
          }
          return;
        }

        let payload = null;
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }

        if (!response.ok || !payload?.success || !Array.isArray(payload?.data)) {
          if (!cancelled) {
            setProjects([]);
            setProjectsLoading(false);
            setProjectsError('Unable to load projects.');
          }
          return;
        }

        if (!cancelled) {
          setProjects(payload.data.map((row: Record<string, unknown>) => mapBackendProject(row)));
          setProjectsError('');
          setProjectsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setProjects([]);
          setProjectsLoading(false);
          setProjectsError('Unable to load projects.');
        }
      }
    };

    loadClientProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  const projectIdsKey = projects.map((project) => project.id).join(',');

  useEffect(() => {
    if (activeTab !== 'proposals') {
      return undefined;
    }

    const selectedId = isBackendProjectId(selectedProjectId)
      ? String(selectedProjectId)
      : projects.find((project) => isBackendProjectId(project.id))?.id;
    const projectId = selectedId ? String(selectedId) : '';

    if (!projectId) {
      setProposals([]);
      setProposalsLoading(false);
      setProposalsError('');
      return undefined;
    }

    const token = localStorage.getItem('hub_token');
    if (!token) {
      setProposals([]);
      setProposalsLoading(false);
      setProposalsError('Unable to load proposals.');
      return undefined;
    }

    let cancelled = false;
    setProposalsLoading(true);

    const loadProjectProposals = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/projects/${projectId}/proposals`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.status === 401 || response.status === 403) {
          if (!cancelled) {
            setProposals([]);
            setProposalsLoading(false);
            setProposalsError('Unable to load proposals.');
          }
          return;
        }

        let payload = null;
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }

        if (!response.ok || !payload?.success || !Array.isArray(payload?.data)) {
          if (!cancelled) {
            setProposals([]);
            setProposalsLoading(false);
            setProposalsError('Unable to load proposals.');
          }
          return;
        }

        if (!cancelled) {
          const mapped = payload.data.map((row: Record<string, unknown>) =>
            mapBackendProposal(row)
          );
          setProposals(mapped);
          setProposalsError('');
          setProposalsLoading(false);
          setProjects((prev) => {
            const next = prev.map((project) =>
              project.id === projectId
                ? { ...project, proposalsCount: mapped.length }
                : project
            );
            const unchanged = next.every(
              (project, index) =>
                project.id === prev[index]?.id &&
                project.proposalsCount === prev[index]?.proposalsCount
            );
            return unchanged ? prev : next;
          });
        }
      } catch {
        if (!cancelled) {
          setProposals([]);
          setProposalsLoading(false);
          setProposalsError('Unable to load proposals.');
        }
      }
    };

    loadProjectProposals();

    const loadMatchingUsage = async () => {
      try {
        const response = await fetch(`${API_BASE}/ai/usage`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const payload = await response.json().catch(() => null);
        const matching = payload?.data?.freelancer_matching;
        if (response.ok && payload?.success && matching) {
          setMatchingUsage({
            limit: matching.limit ?? null,
            used: typeof matching.used === 'number' ? matching.used : 0,
            remaining: matching.remaining ?? null,
            configured: Boolean(matching.configured)
          });
        }
      } catch {
        // Non-blocking: matching usage badge is optional until configured.
      }
    };

    loadMatchingUsage();

    return () => {
      cancelled = true;
    };
  }, [activeTab, selectedProjectId, projectIdsKey]);

  useEffect(() => {
    if (activeTab !== 'freelancers') {
      return undefined;
    }

    const token = localStorage.getItem('hub_token');
    if (!token) {
      setFreelancers([]);
      setFreelancersLoading(false);
      setFreelancersError('Unable to load freelancers.');
      return undefined;
    }

    let cancelled = false;
    setFreelancersLoading(true);

    const loadFreelancers = async () => {
      try {
        const response = await fetch(`${API_BASE}/freelancers`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 401 || response.status === 403) {
          if (!cancelled) {
            setFreelancers([]);
            setFreelancersLoading(false);
            setFreelancersError('Unable to load freelancers.');
          }
          return;
        }

        let payload = null;
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }

        if (!response.ok || !payload?.success || !Array.isArray(payload?.data)) {
          if (!cancelled) {
            setFreelancers([]);
            setFreelancersLoading(false);
            setFreelancersError(
              payload && typeof payload.message === 'string' && payload.message.trim()
                ? payload.message.trim()
                : 'Unable to load freelancers.'
            );
          }
          return;
        }

        const specialtyNameById = new Map<string, string>();
        const specialtiesData = await readSuccessData(
          `${API_BASE}/specialties`,
          token
        );
        if (Array.isArray(specialtiesData)) {
          specialtiesData
            .map((item) => asRecord(item))
            .filter((item): item is Record<string, unknown> => Boolean(item))
            .forEach((item) => {
              if (item.id != null && item.name != null && String(item.name).trim()) {
                specialtyNameById.set(String(item.id), String(item.name));
              }
            });
        }

        const enriched: FreelancerItem[] = [];
        for (const row of payload.data) {
          const record = asRecord(row);
          if (!record) {
            continue;
          }
          const mapped = mapBackendFreelancer(record);
          try {
            enriched.push(
              await enrichMappedFreelancer({
                freelancer: mapped,
                token,
                userId: record.user_id,
                specialtyId: record.specialty_id,
                specialtyNameById
              })
            );
          } catch {
            enriched.push(mapped);
          }
        }

        if (!cancelled) {
          setFreelancers(enriched);
          setFreelancersError('');
          setFreelancersLoading(false);
        }
      } catch {
        if (!cancelled) {
          setFreelancers([]);
          setFreelancersLoading(false);
          setFreelancersError('Unable to load freelancers.');
        }
      }
    };

    loadFreelancers();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  // Adjust HTML dir and lang on change
  useEffect(() => {
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = isArabic ? 'ar' : 'en';
  }, [isArabic]);

  const refreshWalletData = async () => {
    const token = localStorage.getItem('hub_token');
    if (!token) {
      setWalletError('Unable to load wallet.');
      return [] as WalletTransaction[];
    }

    try {
      const walletData = asRecord(
        await readSuccessData(`${API_BASE}/wallet`, token)
      );
      if (walletData) {
        setWalletBalance(toProjectNumber(walletData.balance));
        setWalletEscrowBalance(toProjectNumber(walletData.escrow_balance));
        setWalletError('');
      } else {
        setWalletError('Unable to load wallet.');
      }
    } catch {
      setWalletError('Unable to load wallet.');
    }

    try {
      const txData = await readSuccessData(
        `${API_BASE}/wallet/transactions`,
        token
      );
      if (Array.isArray(txData)) {
        const nextTransactions = txData
          .map((row) => asRecord(row))
          .filter((row): row is Record<string, unknown> => Boolean(row))
          .map((row) => mapBackendTransaction(row));
        setTransactions(nextTransactions);
        setContracts((prev) => applyEscrowHeldFromTransactions(prev, nextTransactions));
        return nextTransactions;
      }
    } catch {
      return [] as WalletTransaction[];
    }

    return [] as WalletTransaction[];
  };

  useEffect(() => {
    refreshWalletData();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      const token = localStorage.getItem('hub_token');
      if (!token) {
        if (!cancelled) {
          setRealReviews([]);
        }
        return;
      }

      const hubUser = readHubUser();
      const reviewerUserId = hubUser?.id != null ? String(hubUser.id) : '';
      const realContracts = contracts.filter((contract) => isBackendProjectId(contract.id));
      if (realContracts.length === 0) {
        if (!cancelled) {
          setRealReviews([]);
        }
        return;
      }

      try {
        const loaded = await loadBackendReviewsForContracts({
          contractList: realContracts,
          token,
          reviewerUserId
        });
        if (!cancelled) {
          setRealReviews(loaded);
        }
      } catch {
        if (!cancelled) {
          setRealReviews([]);
        }
      }
    };

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [
    contracts
      .filter((contract) => isBackendProjectId(contract.id))
      .map((contract) => `${contract.id}:${contract.freelancerId}`)
      .join(',')
  ]);

  useEffect(() => {
    let cancelled = false;

    const loadNotifications = async () => {
      const token = localStorage.getItem('hub_token');
      if (!token) {
        if (!cancelled) {
          setNotifications([]);
        }
        return;
      }

      try {
        const data = await readSuccessData(
          `${API_BASE}/notifications`,
          token
        );

        if (cancelled) {
          return;
        }

        if (!Array.isArray(data)) {
          setNotifications([]);
          return;
        }

        setNotifications(
          data
            .map((row) => asRecord(row))
            .filter((row): row is Record<string, unknown> => Boolean(row))
            .map((row) => mapBackendNotification(row))
        );
      } catch {
        if (!cancelled) {
          setNotifications([]);
        }
      }
    };

    loadNotifications();
    const refreshTimer = window.setInterval(loadNotifications, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(refreshTimer);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadClientContracts = async () => {
      const token = localStorage.getItem('hub_token');
      if (!token) {
        return;
      }

      try {
        const data = await readSuccessData(`${API_BASE}/contracts`, token);
        if (!Array.isArray(data) || cancelled) {
          return;
        }

        const mapped = data
          .map((row) => asRecord(row))
          .filter((row): row is Record<string, unknown> => Boolean(row))
          .map((row) => mapBackendContract(row));

        const enriched: Contract[] = [];
        for (const contract of mapped) {
          try {
            enriched.push(
              await enrichMappedContract({
                contract,
                token,
                projects: [],
                clientProfile: buildInitialClientProfile()
              })
            );
          } catch {
            enriched.push(contract);
          }
        }

        if (cancelled) {
          return;
        }

        setContracts((prev) => {
          const existingReal = prev.filter((contract) => isBackendProjectId(contract.id));
          const existingById = new Map(existingReal.map((contract) => [contract.id, contract]));
          const mergedReal = enriched.map((contract) => {
            const existing = existingById.get(contract.id);
            if (existing) {
              existingById.delete(contract.id);
              return existing;
            }
            return contract;
          });
          const leftoverReal = [...existingById.values()];
          return [...leftoverReal, ...mergedReal];
        });

        setActiveContractId((current) => {
          const realIds = new Set(enriched.map((contract) => contract.id));
          if (realIds.size === 0) {
            return '';
          }
          if (realIds.has(current)) {
            return current;
          }
          return enriched[0].id;
        });

        await refreshWalletData();
      } catch {
        return;
      }
    };

    loadClientContracts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'wallet') {
      refreshWalletData();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'workspace') {
      return;
    }

    const token = localStorage.getItem('hub_token');
    if (!token) {
      return;
    }

    const hubUser = readHubUser();
    const hubUserId = hubUser?.id != null ? String(hubUser.id) : '';

    contracts.forEach((contract) => {
      if (!isBackendProjectId(contract.id) || contract.conversationId) {
        return;
      }
      if (attachingChatContractIds.current.has(contract.id)) {
        return;
      }

      attachingChatContractIds.current.add(contract.id);

      void (async () => {
        try {
          const conversationId = await resolveConversationId({
            projectId: contract.projectId,
            token,
            preferredId: acceptedConversationId || undefined
          });

          if (!conversationId) {
            return;
          }

          let loadedMessages: ChatMessage[] = [];
          try {
            const messagesData = await readSuccessData(
              `${API_BASE}/conversations/${conversationId}/messages`,
              token
            );
            if (Array.isArray(messagesData)) {
              loadedMessages = messagesData
                .map((row) => asRecord(row))
                .filter((row): row is Record<string, unknown> => Boolean(row))
                .map((row) =>
                  mapBackendMessage(row, {
                    hubUserId,
                    clientName: contract.clientName,
                    freelancerName: contract.freelancerName,
                    freelancerAvatar: contract.freelancerAvatar
                  })
                );
            }
          } catch {
            loadedMessages = [];
          }

          setContracts((prev) =>
            prev.map((item) =>
              item.id === contract.id
                ? { ...item, conversationId, messages: loadedMessages }
                : item
            )
          );
        } finally {
          attachingChatContractIds.current.delete(contract.id);
        }
      })();
    });
  }, [activeTab, contracts, acceptedConversationId]);

  useEffect(() => {
    const token = localStorage.getItem('hub_token');
    if (!token) {
      return;
    }

    const socket = io(API_ORIGIN, {
      path: '/socket.io',
      auth: { token },
      autoConnect: true,
      reconnection: true
    });

    socketRef.current = socket;

    const handleConnect = () => {
      setSocketConnected(true);
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
      sendingConversationIds.current.clear();
    };

    const handleConnectError = () => {
      if (!localStorage.getItem('hub_token')) {
        socket.io.reconnection(false);
        socket.disconnect();
      }
    };

    const handleMessageCreated = (payload: unknown) => {
      const data = asRecord(payload);
      if (!data) {
        return;
      }

      const incomingConversationId =
        data.conversation_id != null ? String(data.conversation_id) : '';
      const currentId = activeConversationIdRef.current;
      if (
        !incomingConversationId ||
        !currentId ||
        incomingConversationId !== String(currentId)
      ) {
        return;
      }

      const incomingId = data.id != null ? String(data.id) : '';
      if (!incomingId) {
        return;
      }

      setContracts((prev) => {
        const owner = prev.find((contract) => contract.conversationId === incomingConversationId);
        if (!owner) {
          return prev;
        }

        if (owner.messages.some((message) => message.id === incomingId)) {
          return prev;
        }

        const hubUser = readHubUser();
        const mappedMessage = mapBackendMessage(data, {
          hubUserId: hubUser?.id != null ? String(hubUser.id) : '',
          clientName: owner.clientName,
          freelancerName: owner.freelancerName,
          freelancerAvatar: owner.freelancerAvatar
        });

        return prev.map((contract) =>
          contract.conversationId === incomingConversationId
            ? { ...contract, messages: [...contract.messages, mappedMessage] }
            : contract
        );
      });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('message_created', handleMessageCreated);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('message_created', handleMessageCreated);
      socket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    const numericId = toConversationNumericId(activeConversationId);
    if (!socketConnected || !socket || numericId === null) {
      return;
    }

    socket.emit('join_conversation', { conversationId: numericId }, (ack?: ChatAck) => {
      if (!ack?.success) {
        const backendMessage =
          ack && typeof ack.message === 'string' && ack.message.trim()
            ? ack.message.trim()
            : '';
        if (backendMessage) {
          setChatError(backendMessage);
        }
      }
    });
  }, [socketConnected, activeConversationId]);

  useEffect(() => {
    if (activeTab !== 'workspace') {
      return;
    }

    const token = localStorage.getItem('hub_token');
    if (!token) {
      return;
    }

    contracts.forEach((contract) => {
      if (!isBackendProjectId(contract.id)) {
        return;
      }
      if (loadedScopeContractIds.current.has(contract.id)) {
        return;
      }
      if (attachingScopeContractIds.current.has(contract.id)) {
        return;
      }

      attachingScopeContractIds.current.add(contract.id);

      void (async () => {
        try {
          const scopeData = await readSuccessData(
            `${API_BASE}/contracts/${contract.id}/scope-changes`,
            token
          );

          let loadedScopeChanges: ScopeChangeRequest[] = [];
          if (Array.isArray(scopeData)) {
            loadedScopeChanges = scopeData
              .map((row) => asRecord(row))
              .filter((row): row is Record<string, unknown> => Boolean(row))
              .map((row) => mapBackendScopeChange(row));
            setScopeChangesError('');
          } else {
            loadedScopeChanges = [];
            setScopeChangesError('Unable to load scope changes.');
          }

          setContracts((prev) =>
            prev.map((item) =>
              item.id === contract.id ? { ...item, scopeChanges: loadedScopeChanges } : item
            )
          );
        } catch {
          setContracts((prev) =>
            prev.map((item) => (item.id === contract.id ? { ...item, scopeChanges: [] } : item))
          );
          setScopeChangesError('Unable to load scope changes.');
        } finally {
          loadedScopeContractIds.current.add(contract.id);
          attachingScopeContractIds.current.delete(contract.id);
        }
      })();
    });
  }, [activeTab, contracts]);

  useEffect(() => {
    if (activeTab !== 'workspace') {
      return;
    }

    const token = localStorage.getItem('hub_token');
    if (!token) {
      return;
    }

    contracts.forEach((contract) => {
      if (!isBackendProjectId(contract.id)) {
        return;
      }
      if (loadedTaskContractIds.current.has(contract.id)) {
        return;
      }
      if (attachingTaskContractIds.current.has(contract.id)) {
        return;
      }

      attachingTaskContractIds.current.add(contract.id);

      void (async () => {
        try {
          const tasksData = await readSuccessData(
            `${API_BASE}/contracts/${contract.id}/tasks`,
            token
          );

          if (!Array.isArray(tasksData)) {
            setTasksError('Unable to load tasks.');
            return;
          }

          const loadedTasks = tasksData
            .map((row) => asRecord(row))
            .filter((row): row is Record<string, unknown> => Boolean(row))
            .map((row) => mapBackendTask(row));

          setContracts((prev) =>
            prev.map((item) => (item.id === contract.id ? { ...item, tasks: loadedTasks } : item))
          );
          setTasksError('');
        } catch {
          setTasksError('Unable to load tasks.');
        } finally {
          loadedTaskContractIds.current.add(contract.id);
          attachingTaskContractIds.current.delete(contract.id);
        }
      })();
    });
  }, [activeTab, contracts]);

  // Handle language toggle
  const toggleLanguage = () => {
    setIsArabic((prev) => !prev);
  };

  // Notification handlers
  const markAllNotificationsRead = async () => {
    if (!notifications.some((item) => !item.isRead)) {
      return;
    }
    try {
      await clientRequest('/notifications/read-all', { method: 'PATCH', body: {} });
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch {
      // Keep the current state; the user can retry.
    }
  };

  const markNotificationRead = async (id: string) => {
    if (!isBackendProjectId(id) || markingNotificationIds.current.has(id)) {
      return;
    }

    const current = notifications.find((item) => item.id === id);
    if (!current || current.isRead) {
      return;
    }

    const token = localStorage.getItem('hub_token');
    if (!token) {
      return;
    }

    markingNotificationIds.current.add(id);

    try {
      const response = await fetch(
        `${API_BASE}/notifications/${id}/read`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        }
      );

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success || !asRecord(payload.data)) {
        return;
      }

      const mapped = mapBackendNotification(
        asRecord(payload.data) as Record<string, unknown>
      );
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? mapped : item))
      );
    } catch {
      return;
    } finally {
      markingNotificationIds.current.delete(id);
    }
  };

  // Handle New Project Creation
  const handleSaveProject = async (
    projectData: Omit<Project, 'id' | 'clientId' | 'proposalsCount' | 'publishedAt'>
  ) => {
    const token = localStorage.getItem('hub_token');
    const createStatus = projectData.status === 'draft' ? 'draft' : 'open';

    if (!token) {
      setProjectsError('Unable to create project.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: projectData.title,
          description: projectData.description,
          category: projectData.category,
          budget_min: projectData.budgetMin,
          budget_max: projectData.budgetMax,
          duration: projectData.durationDays,
          required_skills: projectData.requiredSkills,
          attachments: projectData.attachments || [],
          status: createStatus
        })
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success || !payload?.data) {
        const backendMessage =
          payload && typeof payload.message === 'string' && payload.message.trim()
            ? payload.message.trim()
            : '';
        setProjectsError(backendMessage || 'Unable to create project.');
        return;
      }

      const createdProject = mapBackendProject(payload.data);
      setProjects((prev) => [createdProject, ...prev]);
      setProjectsError('');

      setActiveTab('projects');
    } catch {
      setProjectsError('Unable to create project.');
    }
  };

  const handleAcceptProposal = async (proposalId: string) => {
    if (!proposalId || acceptingProposalIds.current.has(proposalId)) {
      return;
    }

    const token = localStorage.getItem('hub_token');
    if (!token) {
      setProposalsError('Unable to accept proposal.');
      return;
    }

    acceptingProposalIds.current.add(proposalId);

    try {
      const response = await fetch(
        `${API_BASE}/proposals/${proposalId}/accept`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success) {
        const backendMessage =
          payload && typeof payload.message === 'string' && payload.message.trim()
            ? payload.message.trim()
            : '';
        setProposalsError(backendMessage || 'Unable to accept proposal.');
        return;
      }

      const returnedProposal =
        payload?.data?.proposal && typeof payload.data.proposal === 'object'
          ? mapBackendProposal(payload.data.proposal)
          : null;
      const acceptedId = returnedProposal?.id || String(proposalId);
      const projectId = returnedProposal?.projectId;
      const returnedStatus = returnedProposal?.status;
      const chosenFreelancerId = returnedProposal?.freelancerId;

      setProposals((prev) =>
        prev.map((proposal) => {
          if (proposal.id === acceptedId) {
            if (
              returnedStatus === 'accepted' ||
              returnedStatus === 'rejected' ||
              returnedStatus === 'pending'
            ) {
              return { ...proposal, status: returnedStatus };
            }
            return proposal;
          }

          if (
            projectId &&
            proposal.projectId === projectId &&
            proposal.status === 'pending'
          ) {
            return { ...proposal, status: 'rejected' };
          }

          return proposal;
        })
      );

      if (projectId) {
        setProjects((prev) =>
          prev.map((proj) =>
            proj.id === projectId
              ? {
                  ...proj,
                  status: 'pending_approval',
                  ...(chosenFreelancerId ? { chosenFreelancerId } : {})
                }
              : proj
          )
        );
      }

      const returnedContractId =
        payload?.data?.contract && payload.data.contract.id != null
          ? String(payload.data.contract.id)
          : '';
      const returnedConversationId =
        payload?.data?.conversation && payload.data.conversation.id != null
          ? String(payload.data.conversation.id)
          : '';

      if (returnedContractId) {
        setAcceptedContractId(returnedContractId);
      }
      if (returnedConversationId) {
        setAcceptedConversationId(returnedConversationId);
      }

      setProposalsError('');

      if (!returnedContractId) {
        return;
      }

      try {
        const contractResponse = await fetch(
          `${API_BASE}/contracts/${returnedContractId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        let contractPayload = null;
        try {
          contractPayload = await contractResponse.json();
        } catch {
          contractPayload = null;
        }

        if (
          !contractResponse.ok ||
          !contractPayload?.success ||
          !contractPayload?.data ||
          typeof contractPayload.data !== 'object'
        ) {
          const backendMessage =
            contractPayload &&
            typeof contractPayload.message === 'string' &&
            contractPayload.message.trim()
              ? contractPayload.message.trim()
              : '';
          setProposalsError(backendMessage || 'Unable to load contract.');
          return;
        }

        const mappedContract = mapBackendContract(contractPayload.data);
        let enrichedContract = mappedContract;
        try {
          enrichedContract = await enrichMappedContract({
            contract: mappedContract,
            token,
            projects,
            clientProfile
          });
        } catch {
          enrichedContract = mappedContract;
        }

        let loadedTasks: TaskItem[] = [];
        try {
          const tasksData = await readSuccessData(
            `${API_BASE}/contracts/${enrichedContract.id}/tasks`,
            token
          );
          if (Array.isArray(tasksData)) {
            loadedTasks = tasksData
              .map((row) => asRecord(row))
              .filter((row): row is Record<string, unknown> => Boolean(row))
              .map((row) => mapBackendTask(row));
          }
        } catch {
          loadedTasks = [];
        }

        const contractWithTasks = { ...enrichedContract, tasks: loadedTasks };

        let loadedScopeChanges: ScopeChangeRequest[] = [];
        try {
          const scopeData = await readSuccessData(
            `${API_BASE}/contracts/${enrichedContract.id}/scope-changes`,
            token
          );
          if (Array.isArray(scopeData)) {
            loadedScopeChanges = scopeData
              .map((row) => asRecord(row))
              .filter((row): row is Record<string, unknown> => Boolean(row))
              .map((row) => mapBackendScopeChange(row));
          } else {
            loadedScopeChanges = [];
          }
        } catch {
          loadedScopeChanges = [];
        }

        const contractWithScope = { ...contractWithTasks, scopeChanges: loadedScopeChanges };

        const hubUser = readHubUser();
        const hubUserId = hubUser?.id != null ? String(hubUser.id) : '';
        let conversationId: string | null = null;
        try {
          conversationId = await resolveConversationId({
            projectId: contractWithTasks.projectId,
            token,
            preferredId: returnedConversationId
          });
        } catch {
          conversationId =
            returnedConversationId && isBackendProjectId(returnedConversationId)
              ? returnedConversationId
              : null;
        }

        let loadedMessages: ChatMessage[] = [];
        if (conversationId) {
          try {
            const messagesData = await readSuccessData(
              `${API_BASE}/conversations/${conversationId}/messages`,
              token
            );
            if (Array.isArray(messagesData)) {
              loadedMessages = messagesData
                .map((row) => asRecord(row))
                .filter((row): row is Record<string, unknown> => Boolean(row))
                .map((row) =>
                  mapBackendMessage(row, {
                    hubUserId,
                    clientName: contractWithTasks.clientName,
                    freelancerName: contractWithTasks.freelancerName,
                    freelancerAvatar: contractWithTasks.freelancerAvatar
                  })
                );
            }
          } catch {
            loadedMessages = [];
          }
        }

        const contractWithChat = {
          ...contractWithScope,
          ...(conversationId ? { conversationId } : {}),
          messages: loadedMessages
        };

        loadedScopeContractIds.current.add(contractWithChat.id);
        loadedTaskContractIds.current.add(contractWithChat.id);

        setContracts((prev) => {
          const others = prev.filter((contract) => contract.id !== contractWithChat.id);
          return [contractWithChat, ...others];
        });
      } catch {
        setProposalsError('Unable to load contract.');
      }
    } catch {
      setProposalsError('Unable to accept proposal.');
    } finally {
      acceptingProposalIds.current.delete(proposalId);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    if (!proposalId || rejectingProposalIds.current.has(proposalId)) {
      return;
    }

    const token = localStorage.getItem('hub_token');
    if (!token) {
      setProposalsError('Unable to reject proposal.');
      return;
    }

    rejectingProposalIds.current.add(proposalId);

    try {
      const response = await fetch(
        `${API_BASE}/proposals/${proposalId}/reject`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success) {
        const backendMessage =
          payload && typeof payload.message === 'string' && payload.message.trim()
            ? payload.message.trim()
            : '';
        setProposalsError(backendMessage || 'Unable to reject proposal.');
        return;
      }

      setProposals((prev) =>
        prev.map((proposal) =>
          proposal.id === proposalId ? { ...proposal, status: 'rejected' } : proposal
        )
      );
      setProposalsError('');
    } catch {
      setProposalsError('Unable to reject proposal.');
    } finally {
      rejectingProposalIds.current.delete(proposalId);
    }
  };

  const handleRunAiMatching = async (projectId: string) => {
    if (!isBackendProjectId(projectId) || matchingInFlight.current) {
      return;
    }

    const token = localStorage.getItem('hub_token');
    if (!token) {
      setMatchingError(
        isArabic ? 'يجب تسجيل الدخول أولاً' : 'Authentication required'
      );
      return;
    }

    matchingInFlight.current = true;
    setMatchingLoading(true);
    setMatchingError(null);

    try {
      const response = await fetch(`${API_BASE}/ai/freelancer-matching`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ project_id: Number(projectId) })
      });

      let payload: {
        success?: boolean;
        message?: string;
        data?: {
          matches?: Array<Record<string, unknown>>;
          usage?: {
            limit?: number | null;
            used?: number;
            remaining?: number | null;
            configured?: boolean;
          };
        };
      } | null = null;

      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success || !payload.data) {
        const backendMessage =
          payload && typeof payload.message === 'string' && payload.message.trim()
            ? payload.message.trim()
            : response.status === 429
              ? isArabic
                ? 'تم بلوغ الحد الشهري للمطابقة'
                : 'Monthly AI matching usage limit reached'
              : response.status === 403
                ? isArabic
                  ? 'غير مسموح بتحليل هذا المشروع'
                  : 'Not allowed to analyze this project'
                : response.status === 404
                  ? isArabic
                    ? 'المشروع غير موجود'
                    : 'Project not found'
                  : isArabic
                    ? 'تعذر تشغيل المطابقة الذكية'
                    : 'Unable to run AI matching';
        setMatchingError(backendMessage);
        return;
      }

      const usage = payload.data.usage;
      if (usage) {
        setMatchingUsage({
          limit: usage.limit ?? null,
          used: typeof usage.used === 'number' ? usage.used : 0,
          remaining: usage.remaining ?? null,
          configured: Boolean(usage.configured)
        });
      }

      const matches = Array.isArray(payload.data.matches) ? payload.data.matches : [];
      const byFreelancer = new Map<string, AiMatchingBreakdown>();

      for (const row of matches) {
        const freelancerId = String(row.freelancerId ?? row.freelancer_id ?? '');
        if (!freelancerId) {
          continue;
        }

        const skillsMatch = Number(row.skillsMatch);
        const experienceMatch = Number(row.experienceMatch);
        const specialtyMatch = Number(row.specialtyMatch);
        const portfolioRelevance = Number(row.portfolioRelevance);
        const ratingsMatch = Number(row.ratingsMatch);
        const overallScore = Number(row.overallScore);
        const recommendation =
          typeof row.recommendation === 'string'
            ? row.recommendation
            : typeof row.aiRecommendation === 'string'
              ? row.aiRecommendation
              : '';
        const explanation =
          typeof row.explanation === 'string' ? row.explanation : '';
        const aiPros = Array.isArray(row.aiPros)
          ? row.aiPros.filter((item): item is string => typeof item === 'string')
          : explanation
            ? [explanation]
            : [];

        byFreelancer.set(freelancerId, {
          skillsMatch,
          experienceMatch,
          specialtyMatch,
          portfolioRelevance,
          ratingsMatch,
          overallScore,
          aiRecommendation: recommendation,
          explanation,
          aiPros
        });
      }

      setProposals((prev) =>
        prev.map((proposal) => {
          if (proposal.projectId !== String(projectId)) {
            return proposal;
          }
          const match = byFreelancer.get(proposal.freelancerId);
          return match ? { ...proposal, aiMatching: match } : { ...proposal, aiMatching: null };
        })
      );
    } catch {
      setMatchingError(isArabic ? 'تعذر الاتصال بالخادم' : 'Unable to reach the server');
    } finally {
      matchingInFlight.current = false;
      setMatchingLoading(false);
    }
  };

  // Scope Change Decision (Approve / Reject)
  const handleApproveScopeChange = async (contractId: string, scopeChangeId: string) => {
    if (!isBackendProjectId(contractId) || !isBackendProjectId(scopeChangeId)) {
      return;
    }

    if (approvingScopeChangeIds.current.has(scopeChangeId)) {
      return;
    }

    const token = localStorage.getItem('hub_token');
    if (!token) {
      setScopeChangesError('Unable to approve scope change.');
      return;
    }

    approvingScopeChangeIds.current.add(scopeChangeId);

    try {
      const response = await fetch(
        `${API_BASE}/scope-changes/${scopeChangeId}/approve`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        }
      );

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success || !asRecord(payload.data)) {
        const backendMessage =
          payload && typeof payload.message === 'string' && payload.message.trim()
            ? payload.message.trim()
            : '';
        setScopeChangesError(backendMessage || 'Unable to approve scope change.');
        return;
      }

      const mappedChange = mapBackendScopeChange(
        asRecord(payload.data) as Record<string, unknown>
      );

      setContracts((prev) =>
        prev.map((contract) => {
          if (contract.id !== contractId) return contract;
          return {
            ...contract,
            scopeChanges: contract.scopeChanges.map((change) =>
              change.id === mappedChange.id ? mappedChange : change
            )
          };
        })
      );
      setScopeChangesError('');
    } catch {
      setScopeChangesError('Unable to approve scope change.');
    } finally {
      approvingScopeChangeIds.current.delete(scopeChangeId);
    }
  };

  const handleRejectScopeChange = async (contractId: string, scopeChangeId: string) => {
    if (!isBackendProjectId(contractId) || !isBackendProjectId(scopeChangeId)) {
      return;
    }

    if (rejectingScopeChangeIds.current.has(scopeChangeId)) {
      return;
    }

    const token = localStorage.getItem('hub_token');
    if (!token) {
      setScopeChangesError('Unable to reject scope change.');
      return;
    }

    rejectingScopeChangeIds.current.add(scopeChangeId);

    try {
      const response = await fetch(
        `${API_BASE}/scope-changes/${scopeChangeId}/reject`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        }
      );

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success || !asRecord(payload.data)) {
        const backendMessage =
          payload && typeof payload.message === 'string' && payload.message.trim()
            ? payload.message.trim()
            : '';
        setScopeChangesError(backendMessage || 'Unable to reject scope change.');
        return;
      }

      const mappedChange = mapBackendScopeChange(
        asRecord(payload.data) as Record<string, unknown>
      );

      setContracts((prev) =>
        prev.map((contract) => {
          if (contract.id !== contractId) return contract;
          return {
            ...contract,
            scopeChanges: contract.scopeChanges.map((change) =>
              change.id === mappedChange.id ? mappedChange : change
            )
          };
        })
      );
      setScopeChangesError('');
    } catch {
      setScopeChangesError('Unable to reject scope change.');
    } finally {
      rejectingScopeChangeIds.current.delete(scopeChangeId);
    }
  };

  // Task status toggle
  const handleToggleTaskStatus = async (contractId: string, taskId: string) => {
    if (!isBackendProjectId(contractId) || !isBackendProjectId(taskId)) {
      return;
    }

    if (togglingTaskIds.current.has(taskId)) {
      return;
    }

    const token = localStorage.getItem('hub_token');
    if (!token) {
      setTasksError('Unable to update task.');
      return;
    }

    const currentTask = contracts
      .find((contract) => contract.id === contractId)
      ?.tasks.find((task) => task.id === taskId);
    if (!currentTask) {
      return;
    }

    const nextStatus = currentTask.status === 'completed' ? 'in_progress' : 'completed';
    togglingTaskIds.current.add(taskId);

    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success || !asRecord(payload.data)) {
        const backendMessage =
          payload && typeof payload.message === 'string' && payload.message.trim()
            ? payload.message.trim()
            : '';
        setTasksError(backendMessage || 'Unable to update task.');
        return;
      }

      const mappedTask = mapBackendTask(asRecord(payload.data) as Record<string, unknown>);
      setContracts((prev) =>
        prev.map((contract) => {
          if (contract.id !== contractId) return contract;
          return {
            ...contract,
            tasks: contract.tasks.map((task) => (task.id === taskId ? mappedTask : task))
          };
        })
      );
      setTasksError('');
    } catch {
      setTasksError('Unable to update task.');
    } finally {
      togglingTaskIds.current.delete(taskId);
    }
  };

  const handleAddTask = async (
    contractId: string,
    taskData: Omit<TaskItem, 'id' | 'contractId'>
  ) => {
    if (!isBackendProjectId(contractId) || addingTaskContractIds.current.has(contractId)) {
      return;
    }

    const token = localStorage.getItem('hub_token');
    if (!token) {
      setTasksError('Unable to create task.');
      return;
    }

    addingTaskContractIds.current.add(contractId);

    const body: Record<string, string> = {
      title: taskData.title
    };
    if (taskData.description && taskData.description.trim()) {
      body.description = taskData.description.trim();
    }
    if (taskData.dueDate && taskData.dueDate.trim()) {
      body.due_date = taskData.dueDate.trim();
    }

    try {
      const response = await fetch(`${API_BASE}/contracts/${contractId}/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success || !asRecord(payload.data)) {
        const backendMessage =
          payload && typeof payload.message === 'string' && payload.message.trim()
            ? payload.message.trim()
            : '';
        setTasksError(backendMessage || 'Unable to create task.');
        return;
      }

      const mappedTask = mapBackendTask(asRecord(payload.data) as Record<string, unknown>);
      setContracts((prev) =>
        prev.map((contract) => {
          if (contract.id !== contractId) return contract;
          return {
            ...contract,
            tasks: [...contract.tasks, mappedTask]
          };
        })
      );
      setTasksError('');
    } catch {
      setTasksError('Unable to create task.');
    } finally {
      addingTaskContractIds.current.delete(contractId);
    }
  };

  // Live Chat send message
  const handleSendMessage = async (
    targetId: string,
    messageText: string,
    attachments?: string[]
  ) => {
    if (!targetId || !messageText.trim()) {
      return;
    }

    if (!isBackendProjectId(targetId)) {
      setContracts((prev) =>
        prev.map((contract) => {
          if (contract.id !== targetId) return contract;
          return {
            ...contract,
            messages: [
              ...contract.messages,
              {
                id: `msg-${Date.now()}`,
                senderId: String(readHubUser()?.id ?? ''),
                senderName: clientProfile.name,
                senderRole: 'client',
                text: messageText.trim(),
                timestamp: ''
              }
            ]
          };
        })
      );
      return;
    }

    if (!contracts.some((contract) => contract.conversationId === targetId)) {
      return;
    }

    if (sendingConversationIds.current.has(targetId)) {
      return;
    }

    const token = localStorage.getItem('hub_token');
    if (!token) {
      setChatError('Unable to send message.');
      return;
    }

    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setChatError('Unable to send message.');
      return;
    }

    const conversationId = toConversationNumericId(targetId);
    if (conversationId === null) {
      return;
    }

    sendingConversationIds.current.add(targetId);

    socket.emit(
      'send_message',
      {
        conversationId,
        message: messageText.trim(),
        ...(attachments && attachments.length > 0 ? { attachments } : {})
      },
      (ack?: ChatAck) => {
        sendingConversationIds.current.delete(targetId);

        if (!ack?.success) {
          const backendMessage =
            ack && typeof ack.message === 'string' && ack.message.trim()
              ? ack.message.trim()
              : '';
          setChatError(backendMessage || 'Unable to send message.');
          return;
        }

        setChatError('');
      }
    );
  };

  const mergeFetchedContractFields = (contractId: string, mapped: Contract) => {
    setContracts((prev) =>
      prev.map((item) =>
        item.id === contractId
          ? {
              ...item,
              contractValue: mapped.contractValue,
              commission: mapped.commission,
              status: mapped.status,
              paymentStatus: mapped.paymentStatus,
              startDate: mapped.startDate,
              deliveryDate: mapped.deliveryDate
            }
          : item
      )
    );
  };

  const refreshContractFromBackend = async (contractId: string, token: string) => {
    const contractRow = asRecord(
      await readSuccessData(`${API_BASE}/contracts/${contractId}`, token)
    );
    if (!contractRow) {
      return;
    }
    mergeFetchedContractFields(contractId, mapBackendContract(contractRow));
  };

  const handleReleaseEscrow = async (contractId: string) => {
    if (!isBackendProjectId(contractId)) {
      return;
    }

    if (
      fundingContractIds.current.has(contractId) ||
      releasingContractIds.current.has(contractId)
    ) {
      return;
    }

    const contract = contracts.find((item) => item.id === contractId);
    if (!contract) {
      return;
    }

    if (contract.paymentStatus === 'released') {
      return;
    }

    if (transactions.some((tx) => tx.contractId === contractId && tx.type === 'release')) {
      return;
    }

    const token = localStorage.getItem('hub_token');
    if (!token) {
      setEscrowError(
        contract.escrowHeld > 0 ? 'Unable to release payment.' : 'Unable to fund escrow.'
      );
      return;
    }

    if (contract.escrowHeld <= 0) {
      fundingContractIds.current.add(contractId);

      try {
        const response = await fetch(
          `${API_BASE}/wallet/escrow/${contractId}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
          }
        );

        let payload = null;
        try {
          payload = await response.json();
        } catch {
          payload = null;
        }

        if (!response.ok || !payload?.success) {
          const backendMessage =
            payload && typeof payload.message === 'string' && payload.message.trim()
              ? payload.message.trim()
              : '';
          setEscrowError(backendMessage || 'Unable to fund escrow.');
          return;
        }

        await refreshContractFromBackend(contractId, token);

        if (contract.projectId) {
          const projectRow = asRecord(
            await readSuccessData(
              `${API_BASE}/projects/${contract.projectId}`,
              token
            )
          );
          if (projectRow?.status != null) {
            const nextStatus = String(projectRow.status) as Project['status'];
            setProjects((prev) =>
              prev.map((project) =>
                project.id === contract.projectId
                  ? { ...project, status: nextStatus }
                  : project
              )
            );
          }
        }

        await refreshWalletData();
        setEscrowError('');
      } catch {
        setEscrowError('Unable to fund escrow.');
      } finally {
        fundingContractIds.current.delete(contractId);
      }
      return;
    }

    if (contract.status !== 'delivered' && contract.status !== 'completed') {
      releasingContractIds.current.add(contractId);

      try {
        const statusResponse = await fetch(
          `${API_BASE}/contracts/${contractId}/status`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'delivered' })
          }
        );

        let statusPayload = null;
        try {
          statusPayload = await statusResponse.json();
        } catch {
          statusPayload = null;
        }

        if (!statusResponse.ok || !statusPayload?.success || !asRecord(statusPayload.data)) {
          const backendMessage =
            statusPayload &&
            typeof statusPayload.message === 'string' &&
            statusPayload.message.trim()
              ? statusPayload.message.trim()
              : '';
          setEscrowError(backendMessage || 'Unable to confirm delivery.');
          return;
        }

        mergeFetchedContractFields(
          contractId,
          mapBackendContract(asRecord(statusPayload.data) as Record<string, unknown>)
        );
        setEscrowError('');
      } catch {
        setEscrowError('Unable to confirm delivery.');
      } finally {
        releasingContractIds.current.delete(contractId);
      }
      return;
    }

    releasingContractIds.current.add(contractId);

    try {
      const response = await fetch(
        `${API_BASE}/wallet/release/${contractId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        }
      );

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success) {
        const backendMessage =
          payload && typeof payload.message === 'string' && payload.message.trim()
            ? payload.message.trim()
            : '';
        setEscrowError(backendMessage || 'Unable to release payment.');
        return;
      }

      await refreshContractFromBackend(contractId, token);
      await refreshWalletData();
      setEscrowError('');
    } catch {
      setEscrowError('Unable to release payment.');
    } finally {
      releasingContractIds.current.delete(contractId);
    }
  };

  const handleTopUp = async (amount: number): Promise<boolean> => {
    const token = localStorage.getItem('hub_token');
    if (!token) {
      setWalletError('Unable to top up.');
      return false;
    }

    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
      setWalletError('Unable to top up.');
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}/wallet/topup`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success) {
        const backendMessage =
          payload && typeof payload.message === 'string' && payload.message.trim()
            ? payload.message.trim()
            : '';
        setWalletError(backendMessage || 'Unable to top up.');
        return false;
      }

      await refreshWalletData();
      setWalletError('');
      return true;
    } catch {
      setWalletError('Unable to top up.');
      return false;
    }
  };

  // Submit Review
  const handleSubmitReview = async (
    contractId: string,
    rating: number,
    feedback: string,
    tags: string[]
  ): Promise<boolean> => {
    const contract = contracts.find((c) => c.id === contractId);
    if (!contract) {
      return false;
    }

    if (!isBackendProjectId(contractId)) {
      setReviewsError('Unable to submit review.');
      return false;
    }

    if (submittingReviewIds.current.has(contractId)) {
      return false;
    }

    const token = localStorage.getItem('hub_token');
    if (!token) {
      setReviewsError('Unable to submit review.');
      return false;
    }

    const body: { rating: number; comment?: string } = { rating };
    if (feedback.trim()) {
      body.comment = feedback.trim();
    }

    submittingReviewIds.current.add(contractId);

    try {
      const response = await fetch(`${API_BASE}/contracts/${contractId}/review`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success || !asRecord(payload.data)) {
        const backendMessage =
          payload && typeof payload.message === 'string' && payload.message.trim()
            ? payload.message.trim()
            : '';
        setReviewsError(backendMessage || 'Unable to submit review.');
        return false;
      }

      const hubUser = readHubUser();
      const reviewerUserId = hubUser?.id != null ? String(hubUser.id) : '';
      const loaded = await loadBackendReviewsForContracts({
        contractList: contracts,
        token,
        reviewerUserId
      });
      setRealReviews(loaded);
      setReviewsError('');
      setActiveTab('reviews');
      return true;
    } catch {
      setReviewsError('Unable to submit review.');
      return false;
    } finally {
      submittingReviewIds.current.delete(contractId);
    }
  };

  // Open Dispute — real POST /api/disputes only (no local fake success)
  const loadDisputes = useCallback(async () => {
    try {
      const rows = await clientRequest<Record<string, unknown>[]>('/disputes');
      const me = readHubUser();
      const issueTypes: DisputeRecord['issueType'][] = ['delay', 'quality', 'scope_breach', 'communication', 'payment', 'other'];
      const mapped: DisputeRecord[] = (Array.isArray(rows) ? rows : []).map((row) => {
        const rawStatus = row.status == null ? '' : String(row.status);
        const status: DisputeRecord['status'] =
          rawStatus === 'resolved'
            ? 'resolved'
            : rawStatus === 'closed' || rawStatus === 'rejected'
              ? 'closed'
              : rawStatus === 'freelancer_response'
                ? 'freelancer_response'
                : 'under_review';
        const iAmReporter = me?.id != null && String(row.reported_by) === String(me.id);
        const counterpart = iAmReporter ? row.reported_against_name : row.reported_by_name;
        const issueType = issueTypes.includes(row.issue_type as DisputeRecord['issueType'])
          ? (row.issue_type as DisputeRecord['issueType'])
          : 'other';
        return {
          id: String(row.id),
          disputeNumber: `DSP-${String(row.id)}`,
          contractId: row.contract_id == null ? '' : String(row.contract_id),
          projectTitle: row.project_title == null ? '' : String(row.project_title),
          freelancerName: counterpart == null ? '' : String(counterpart),
          freelancerAvatar: initialsAvatar(counterpart == null ? '' : String(counterpart)),
          issueType,
          description: row.description == null ? '' : String(row.description),
          evidenceAttachments: Array.isArray(row.evidence_attachments)
            ? row.evidence_attachments.map((item) => String(item))
            : [],
          status,
          filedAt: row.created_at ? String(row.created_at).slice(0, 10) : '',
          ...(row.action_taken == null || !String(row.action_taken).trim()
            ? {}
            : { resolution: String(row.action_taken) })
        };
      });
      setDisputes(mapped);
    } catch (err) {
      setDisputesError(errorText(err, 'Unable to load disputes.'));
    }
  }, []);

  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  const handleOpenNewDispute = async (
    disputeData: Omit<DisputeRecord, 'id' | 'disputeNumber' | 'filedAt' | 'status'>
  ): Promise<boolean> => {
    if (submittingDispute.current) {
      return false;
    }

    const contract = contracts.find((c) => c.id === disputeData.contractId);
    if (
      !contract ||
      !isBackendProjectId(contract.id) ||
      !isBackendProjectId(contract.projectId)
    ) {
      setDisputesError('Unable to submit dispute.');
      return false;
    }

    const token = localStorage.getItem('hub_token');
    if (!token) {
      setDisputesError('Unable to submit dispute.');
      return false;
    }

    submittingDispute.current = true;
    setDisputesError('');

    try {
      const body: {
        project_id: number;
        issue_type: string;
        description: string;
        reported_against?: number;
        evidence_attachments?: string[];
      } = {
        project_id: Number(contract.projectId),
        issue_type: disputeData.issueType,
        description: disputeData.description
      };

      if (isBackendProjectId(contract.freelancerId)) {
        try {
          const freelancerData = asRecord(
            await readSuccessData(
              `${API_BASE}/freelancers/${contract.freelancerId}`,
              token
            )
          );
          if (freelancerData?.user_id != null && isBackendProjectId(String(freelancerData.user_id))) {
            body.reported_against = Number(freelancerData.user_id);
          }
        } catch {
          // reported_against is optional
        }
      }

      if (Array.isArray(disputeData.evidenceAttachments) && disputeData.evidenceAttachments.length > 0) {
        body.evidence_attachments = disputeData.evidenceAttachments;
      }

      const response = await fetch(`${API_BASE}/disputes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success || !asRecord(payload.data)) {
        const backendMessage =
          payload && typeof payload.message === 'string' && payload.message.trim()
            ? payload.message.trim()
            : '';
        setDisputesError(backendMessage || 'Unable to submit dispute.');
        return false;
      }

      const data = asRecord(payload.data) as Record<string, unknown>;
      const issueTypeRaw = data.issue_type == null ? disputeData.issueType : String(data.issue_type);
      const issueType: DisputeRecord['issueType'] =
        issueTypeRaw === 'delay' ||
        issueTypeRaw === 'quality' ||
        issueTypeRaw === 'scope_breach' ||
        issueTypeRaw === 'communication' ||
        issueTypeRaw === 'other'
          ? issueTypeRaw
          : disputeData.issueType;

      const mapped: DisputeRecord = {
        id: String(data.id),
        disputeNumber: `DSP-${String(data.id)}`,
        contractId: contract.id,
        projectTitle: disputeData.projectTitle || contract.projectTitle,
        freelancerName: disputeData.freelancerName || contract.freelancerName,
        freelancerAvatar: disputeData.freelancerAvatar || contract.freelancerAvatar,
        issueType,
        description: data.description == null ? disputeData.description : String(data.description),
        evidenceAttachments: Array.isArray(data.evidence_attachments)
          ? data.evidence_attachments.map((item) => String(item))
          : [],
        status: 'under_review',
        filedAt: new Date().toISOString().split('T')[0],
        ...(data.action_taken == null || !String(data.action_taken).trim()
          ? {}
          : { resolution: String(data.action_taken) })
      };

      setDisputes((prev) => [mapped, ...prev.filter((d) => d.id !== mapped.id)]);
      loadDisputes();
      setActiveTab('disputes');
      return true;
    } catch {
      setDisputesError('Unable to submit dispute.');
      return false;
    } finally {
      submittingDispute.current = false;
    }
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

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm(isArabic ? 'هل أنت متأكد من حذف هذا المشروع؟' : 'Delete this project?')) {
      return;
    }

    if (!isBackendProjectId(projectId) || deletingProjectIds.current.has(projectId)) {
      if (!isBackendProjectId(projectId)) {
        setProjectsError('Unable to delete project.');
      }
      return;
    }

    const token = localStorage.getItem('hub_token');
    if (!token) {
      setProjectsError('Unable to delete project.');
      return;
    }

    deletingProjectIds.current.add(projectId);

    try {
      const response = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success) {
        const backendMessage =
          payload && typeof payload.message === 'string' && payload.message.trim()
            ? payload.message.trim()
            : '';
        setProjectsError(backendMessage || 'Unable to delete project.');
        return;
      }

      setProjects((prev) => prev.filter((project) => project.id !== projectId));
      setProjectsError('');
    } catch {
      setProjectsError('Unable to delete project.');
    } finally {
      deletingProjectIds.current.delete(projectId);
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
    setInviteTarget(freelancer);
  };

  const handleUpdateProfile = async (updated: Partial<ClientProfile>): Promise<boolean> => {
    const token = localStorage.getItem('hub_token');
    const hubUser = readHubUser();
    const profileId = clientProfile.id || (hubUser?.profile?.id != null ? String(hubUser.profile.id) : '');

    if (!token || !isBackendProjectId(profileId)) {
      setProfileError('Unable to update profile.');
      return false;
    }

    const userBody: { name?: string; phone?: string | null } = {};
    if (updated.name != null) {
      userBody.name = String(updated.name).trim();
    }
    if (Object.prototype.hasOwnProperty.call(updated, 'phone')) {
      const phone = updated.phone == null ? '' : String(updated.phone).trim();
      userBody.phone = phone || null;
    }

    const clientBody: {
      company_name?: string | null;
      bio?: string | null;
      location?: string | null;
      website?: string | null;
      logo?: string | null;
    } = {};
    if (Object.prototype.hasOwnProperty.call(updated, 'companyName')) {
      const companyName = updated.companyName == null ? '' : String(updated.companyName).trim();
      clientBody.company_name = companyName || null;
    }
    for (const key of ['bio', 'location', 'website', 'logo'] as const) {
      if (Object.prototype.hasOwnProperty.call(updated, key)) {
        const value = updated[key] == null ? '' : String(updated[key]).trim();
        clientBody[key] = value || null;
      }
    }

    try {
      let userData: Record<string, unknown> | null = null;
      if (userBody.name != null || Object.prototype.hasOwnProperty.call(userBody, 'phone')) {
        const userResponse = await fetch(`${API_BASE}/users/me`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userBody)
        });

        let userPayload = null;
        try {
          userPayload = await userResponse.json();
        } catch {
          userPayload = null;
        }

        if (!userResponse.ok || !userPayload?.success || !asRecord(userPayload.data)) {
          const backendMessage =
            userPayload && typeof userPayload.message === 'string' && userPayload.message.trim()
              ? userPayload.message.trim()
              : '';
          setProfileError(backendMessage || 'Unable to update profile.');
          return false;
        }

        userData = asRecord(userPayload.data);
      }

      let clientData: Record<string, unknown> | null = null;
      if (Object.keys(clientBody).length > 0) {
        const clientResponse = await fetch(`${API_BASE}/clients/${profileId}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(clientBody)
        });

        let clientPayload = null;
        try {
          clientPayload = await clientResponse.json();
        } catch {
          clientPayload = null;
        }

        if (!clientResponse.ok || !clientPayload?.success || !asRecord(clientPayload.data)) {
          const backendMessage =
            clientPayload &&
            typeof clientPayload.message === 'string' &&
            clientPayload.message.trim()
              ? clientPayload.message.trim()
              : '';
          setProfileError(backendMessage || 'Unable to update profile.');
          return false;
        }

        clientData = asRecord(clientPayload.data);
      }

      setClientProfile((prev) => ({
        ...prev,
        ...(userData?.name != null ? { name: String(userData.name) } : {}),
        ...(userData && Object.prototype.hasOwnProperty.call(userData, 'phone')
          ? { phone: userData.phone == null ? '' : String(userData.phone) }
          : {}),
        ...(clientData && Object.prototype.hasOwnProperty.call(clientData, 'company_name')
          ? {
              companyName:
                clientData.company_name == null ? '' : String(clientData.company_name)
            }
          : {}),
        ...(clientData
          ? {
              bio: clientData.bio == null ? '' : String(clientData.bio),
              location: clientData.location == null ? '' : String(clientData.location),
              website: clientData.website == null ? '' : String(clientData.website),
              ...(clientData.logo ? { logo: String(clientData.logo) } : {})
            }
          : {})
      }));

      if (userData) {
        localStorage.setItem(
          'hub_user',
          JSON.stringify({
            ...hubUser,
            ...(userData.name != null ? { name: userData.name } : {}),
            ...(Object.prototype.hasOwnProperty.call(userData, 'phone')
              ? { phone: userData.phone }
              : {})
          })
        );
      }

      setProfileError('');
      return true;
    } catch {
      setProfileError('Unable to update profile.');
      return false;
    }
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
          clientProfile={clientProfile}
          walletBalance={walletBalance}
          pendingProposalsCount={proposals.filter((p) => p.status === 'pending').length}
          unreadScopeChangesCount={contracts.reduce(
            (sum, c) => sum + c.scopeChanges.filter((sc) => sc.status === 'pending').length,
            0
          )}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <Header
          notifications={notifications}
          markNotificationRead={markNotificationRead}
          markAllNotificationsRead={markAllNotificationsRead}
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
            <>
              {projectsLoading && (
                <p className="text-xs text-slate-500 mb-3">
                  {isArabic ? 'جاري تحميل المشاريع...' : 'Loading projects...'}
                </p>
              )}
              {projectsError && (
                <p className="text-xs font-bold text-red-600 mb-3">
                  {isArabic ? 'تعذر تحميل أو إنشاء المشروع.' : projectsError}
                </p>
              )}
              <ProjectsView
                projects={projects}
                openNewProjectModal={() => setIsNewProjectModalOpen(true)}
                onSelectProjectProposals={handleSelectProjectProposals}
                onOpenWorkspaceForProject={handleOpenWorkspaceForProject}
                onDeleteProject={handleDeleteProject}
                isArabic={isArabic}
              />
            </>
          )}

          {activeTab === 'proposals' && (
            <>
              {proposalsLoading && (
                <p className="text-xs text-slate-500 mb-3">
                  {isArabic ? 'جاري تحميل العروض...' : 'Loading proposals...'}
                </p>
              )}
              {proposalsError && (
                <p className="text-xs font-bold text-red-600 mb-3">
                  {isArabic
                    ? proposalsError === 'Unable to load proposals.'
                      ? 'تعذر تحميل العروض.'
                      : proposalsError === 'Unable to accept proposal.'
                        ? 'تعذر قبول العرض.'
                        : proposalsError === 'Unable to load contract.'
                          ? 'تعذر تحميل العقد.'
                          : 'تعذر رفض العرض.'
                    : proposalsError}
                </p>
              )}
              <ProposalsView
                projects={projects}
                proposals={proposals}
                selectedProjectId={selectedProjectId}
                setSelectedProjectId={setSelectedProjectId}
                onAcceptProposal={handleAcceptProposal}
                onRejectProposal={handleRejectProposal}
                onOpenChatWithFreelancer={handleOpenChatWithFreelancer}
                onRunAiMatching={handleRunAiMatching}
                matchingLoading={matchingLoading}
                matchingError={matchingError}
                matchingUsage={matchingUsage}
                isArabic={isArabic}
              />
            </>
          )}

          {activeTab === 'workspace' && (
            <>
              {escrowError && (
                <p className="text-xs font-bold text-red-600 mb-3">
                  {isArabic
                    ? escrowError === 'Unable to fund escrow.'
                      ? 'تعذر تمويل الضمان.'
                      : escrowError === 'Unable to release payment.'
                        ? 'تعذر تحرير الدفعة.'
                        : escrowError === 'Contract must be delivered before funds can be released.'
                          ? 'يجب تسليم العقد قبل تحرير الدفعة.'
                          : escrowError === 'Unable to confirm delivery.'
                            ? 'تعذر تأكيد التسليم.'
                            : escrowError
                    : escrowError}
                </p>
              )}
              {tasksError && (
                <p className="text-xs font-bold text-red-600 mb-3">
                  {isArabic
                    ? tasksError === 'Unable to create task.'
                      ? 'تعذر إنشاء المهمة.'
                      : tasksError === 'Unable to update task.'
                        ? 'تعذر تحديث المهمة.'
                        : tasksError === 'Unable to load tasks.'
                          ? 'تعذر تحميل المهام.'
                          : tasksError
                    : tasksError}
                </p>
              )}
              {scopeChangesError && (
                <p className="text-xs font-bold text-red-600 mb-3">
                  {isArabic
                    ? scopeChangesError === 'Unable to load scope changes.'
                      ? 'تعذر تحميل طلبات تعديل النطاق.'
                      : scopeChangesError === 'Unable to approve scope change.'
                        ? 'تعذر الموافقة على طلب تعديل النطاق.'
                        : scopeChangesError === 'Unable to reject scope change.'
                          ? 'تعذر رفض طلب تعديل النطاق.'
                          : scopeChangesError
                    : scopeChangesError}
                </p>
              )}
              {chatError && (
                <p className="text-xs font-bold text-red-600 mb-3">
                  {isArabic
                    ? chatError === 'Unable to send message.'
                      ? 'تعذر إرسال الرسالة.'
                      : chatError
                    : chatError}
                </p>
              )}
              {reviewsError && (
                <p className="text-xs font-bold text-red-600 mb-3">
                  {isArabic
                    ? reviewsError === 'Unable to submit review.'
                      ? 'تعذر إرسال التقييم.'
                      : reviewsError
                    : reviewsError}
                </p>
              )}
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
                setReviewsError('');
                setContractForReview(c);
                setIsReviewModalOpen(true);
              }}
              isArabic={isArabic}
            />
            </>
          )}

          {activeTab === 'freelancers' && (
            <>
              {freelancersLoading && (
                <p className="text-xs text-slate-500 mb-3">
                  {isArabic ? 'جاري تحميل المستقلين...' : 'Loading freelancers...'}
                </p>
              )}
              {freelancersError && (
                <p className="text-xs font-bold text-red-600 mb-3">
                  {isArabic
                    ? freelancersError === 'Unable to load freelancers.'
                      ? 'تعذر تحميل المستقلين.'
                      : freelancersError
                    : freelancersError}
                </p>
              )}
              <FreelancersDirectoryView
                freelancers={freelancers}
                onInviteFreelancer={handleInviteFreelancer}
                isArabic={isArabic}
              />
            </>
          )}

          {activeTab === 'wallet' && (
            <>
              {walletError && (
                <p className="text-xs font-bold text-red-600 mb-3">
                  {isArabic
                    ? walletError === 'Unable to load wallet.'
                      ? 'تعذر تحميل المحفظة.'
                      : walletError === 'Unable to top up.'
                        ? 'تعذر شحن الرصيد.'
                        : walletError
                    : walletError}
                </p>
              )}
              <WalletView
              transactions={transactions}
              availableBalance={walletBalance}
              escrowLocked={walletEscrowBalance}
              totalPaid={transactions
                .filter((tx) => tx.type === 'release')
                .reduce((sum, tx) => sum + tx.amount, 0)}
              openTopUpModal={() => setIsTopUpModalOpen(true)}
              isArabic={isArabic}
            />
            </>
          )}

          {activeTab === 'disputes' && (
            <>
              {disputesError && (
                <p className="text-xs font-bold text-red-600 mb-3">
                  {isArabic
                    ? disputesError === 'Unable to submit dispute.'
                      ? 'تعذر تقديم النزاع.'
                      : disputesError
                    : disputesError}
                </p>
              )}
              <DisputesView
                disputes={disputes}
                contracts={contracts}
                onOpenNewDispute={handleOpenNewDispute}
                isArabic={isArabic}
              />
            </>
          )}

          {activeTab === 'reviews' && (
            <>
              {reviewsError && (
                <p className="text-xs font-bold text-red-600 mb-3">
                  {isArabic
                    ? reviewsError === 'Unable to submit review.'
                      ? 'تعذر إرسال التقييم.'
                      : reviewsError
                    : reviewsError}
                </p>
              )}
              <ReviewsView
                reviews={realReviews}
                contracts={contracts}
                onOpenReviewModal={(c) => {
                  setReviewsError('');
                  setContractForReview(c);
                  setIsReviewModalOpen(true);
                }}
                isArabic={isArabic}
              />
            </>
          )}

          {activeTab === 'subscriptions' && (
            <ClientSubscriptionsView isArabic={isArabic} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              clientProfile={clientProfile}
              onUpdateProfile={handleUpdateProfile}
              isArabic={isArabic}
              toggleLanguage={toggleLanguage}
              profileLoading={profileLoading}
              profileError={profileError}
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
        onTopUp={handleTopUp}
        submitError={walletError}
        isArabic={isArabic}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        contract={contractForReview}
        onSubmitReview={handleSubmitReview}
        submitError={reviewsError}
        isArabic={isArabic}
      />

      <InviteFreelancerModal
        freelancer={inviteTarget}
        projects={projects}
        onClose={() => setInviteTarget(null)}
        openNewProjectModal={() => setIsNewProjectModalOpen(true)}
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
