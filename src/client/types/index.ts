export type UserRole = 'client' | 'freelancer' | 'admin';

export interface ClientProfile {
  id: string;
  userId: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  logo: string;
  bio: string;
  location: string;
  website: string;
  joinedDate: string;
  accountStatus: 'active' | 'disabled';
}

export type ProjectStatus = 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  durationDays: number;
  requiredSkills: string[];
  attachments: string[];
  status: ProjectStatus;
  proposalsCount: number;
  chosenFreelancerId?: string;
  publishedAt: string;
  deadline: string;
}

export interface AiMatchingBreakdown {
  overallScore: number; // e.g. 96
  skillsMatch: number; // e.g. 98
  experienceMatch: number; // e.g. 92
  specialtyMatch: number; // e.g. 95
  portfolioRelevance: number; // e.g. 94
  aiRecommendation: string;
  aiPros: string[];
}

export interface Proposal {
  id: string;
  projectId: string;
  projectTitle?: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  freelancerTitle: string;
  freelancerRating: number;
  freelancerCompletedCount: number;
  proposedPrice: number;
  proposedDurationDays: number;
  coverLetter: string;
  status: 'pending' | 'accepted' | 'rejected';
  submittedAt: string;
  aiMatching: AiMatchingBreakdown;
}

export interface TaskItem {
  id: string;
  contractId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  dueDate: string;
  assignedTo: string;
}

export interface ScopeChangeRequest {
  id: string;
  contractId: string;
  requestedBy: string; // freelancer name
  description: string;
  priceAdjustment: number; // e.g. +150
  durationAdjustment: number; // e.g. +4 days
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  responseNote?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'freelancer' | 'system';
  avatar?: string;
  text: string;
  timestamp: string;
  attachment?: {
    name: string;
    size: string;
    type: string;
  };
}

export interface Contract {
  id: string;
  orderNumber: string; // e.g. ORD-101
  projectId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  freelancerSpecialty: string;
  contractValue: number;
  escrowHeld: number;
  commission: number;
  status: 'in_progress' | 'delivered' | 'completed' | 'cancelled';
  paymentStatus: 'escrow_held' | 'released' | 'refunded';
  startDate: string;
  deliveryDate: string;
  deliverableNotes?: string;
  deliverableFiles?: string[];
  tasks: TaskItem[];
  scopeChanges: ScopeChangeRequest[];
  messages: ChatMessage[];
}

export interface FreelancerItem {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  category: string;
  bio: string;
  experienceYears: number;
  hourlyRate: number;
  ratingAvg: number;
  completedProjectsCount: number;
  skills: string[];
  badge?: string;
  portfolio: {
    title: string;
    image: string;
    link?: string;
  }[];
}

export type TransactionType = 'deposit' | 'escrow_lock' | 'release' | 'refund';

export interface WalletTransaction {
  id: string;
  transactionNumber: string; // e.g. TX-901
  contractId?: string;
  projectTitle?: string;
  counterpartyName?: string;
  type: TransactionType;
  amount: number;
  platformFee: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
}

export interface DisputeRecord {
  id: string;
  disputeNumber: string; // e.g. DSP-001
  contractId: string;
  projectTitle: string;
  freelancerName: string;
  freelancerAvatar: string;
  issueType: 'delay' | 'quality' | 'scope_breach' | 'communication' | 'other';
  description: string;
  evidenceAttachments: string[];
  status: 'under_review' | 'freelancer_response' | 'resolved' | 'closed';
  filedAt: string;
  resolution?: string;
}

export interface ReviewRecord {
  id: string;
  contractId: string;
  projectTitle: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  freelancerSpecialty: string;
  rating: number; // 1 to 5
  feedback: string;
  createdAt: string;
  tags: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'proposal' | 'scope_change' | 'milestone' | 'payment' | 'system';
  isRead: boolean;
  createdAt: string;
  linkTab?: string;
}
