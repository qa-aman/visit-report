import { User, Vertical } from '@/types';

export const personas: User[] = [
  {
    id: 'se-001',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@company.com',
    role: 'sales_engineer',
    teamLeaderId: 'tl-001',
  },
  {
    id: 'se-002',
    name: 'Priya Sharma',
    email: 'priya.sharma@company.com',
    role: 'sales_engineer',
    teamLeaderId: 'tl-001',
  },
  {
    id: 'tl-001',
    name: 'Akhilesh Pathak',
    email: 'akhilesh.pathak@company.com',
    role: 'team_leader',
    verticalId: 'v-001',
  },
  {
    id: 'admin-001',
    name: 'System Administrator',
    email: 'admin@company.com',
    role: 'admin',
  },
];

export const verticals: Vertical[] = [
  {
    id: 'v-001',
    name: 'Fluid Sealing Div.',
    description: 'Fluid Sealing Division',
    active: true,
  },
  {
    id: 'v-002',
    name: 'Industrial Solutions',
    description: 'Industrial Solutions Division',
    active: true,
  },
];

export const predefinedOptions = {
  purpose: [
    'DEVELOPMENT',
    'TECHNICAL QUERY',
    'FOLLOW UP',
    'PRODUCT DEMONSTRATION',
    'NEGOTIATION',
    'SERVICE VISIT',
  ],
  outcome: ['Satisfied', 'Dissatisfied', 'Need for Improvement'],
  convert: ['PreLead', 'Enquiry', 'Proposal', 'Negotiation', 'Closed'],
  status: ['Open', 'In Progress', 'Pending', 'On Hold', 'Closed'],
  result: ['Won', 'Lost', 'Cancelled', 'Deferred'],
};

export function getPersonaById(id: string): User | undefined {
  return personas.find((p) => p.id === id);
}

export function getPersonasByRole(role: string): User[] {
  return personas.filter((p) => p.role === role);
}

export function getTeamLeaderForEngineer(engineerId: string): User | undefined {
  const engineer = personas.find((p) => p.id === engineerId);
  if (!engineer || !engineer.teamLeaderId) return undefined;
  return personas.find((p) => p.id === engineer.teamLeaderId);
}

export function getVerticalForLeader(leaderId: string): Vertical | undefined {
  const leader = personas.find((p) => p.id === leaderId);
  if (!leader || !leader.verticalId) return undefined;
  return verticals.find((v) => v.id === leader.verticalId);
}

