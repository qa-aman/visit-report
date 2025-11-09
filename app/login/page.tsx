'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { personas } from '@/lib/personas';
import { setCurrentUser } from '@/lib/storage';
import { User } from '@/types';
import { User as UserIcon, Briefcase, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<User | null>(null);

  const handleLogin = (persona: User) => {
    setCurrentUser(persona);
    router.push('/dashboard');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'sales_engineer':
        return <UserIcon className="w-6 h-6" />;
      case 'team_leader':
        return <Briefcase className="w-6 h-6" />;
      case 'admin':
        return <Shield className="w-6 h-6" />;
      default:
        return <UserIcon className="w-6 h-6" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'sales_engineer':
        return 'Sales Engineer';
      case 'team_leader':
        return 'Team Leader';
      case 'admin':
        return 'Administrator';
      default:
        return role;
    }
  };

  const groupedPersonas = personas.reduce((acc, persona) => {
    if (!acc[persona.role]) {
      acc[persona.role] = [];
    }
    acc[persona.role].push(persona);
    return acc;
  }, {} as Record<string, User[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-semibold text-gray-900 mb-3">
            Visit Report System
          </h1>
          <p className="text-lg text-gray-600">
            Select a persona to experience the application
          </p>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedPersonas).map(([role, rolePersonas]) => (
            <div key={role} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
                  {getRoleIcon(role)}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {getRoleLabel(role)}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rolePersonas.map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => handleLogin(persona)}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <div className="text-left">
                      <div className="font-medium text-gray-900 group-hover:text-blue-700">
                        {persona.name}
                      </div>
                      <div className="text-sm text-gray-500">{persona.email}</div>
                    </div>
                    <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          Click on any persona card to login and explore the system
        </div>
      </div>
    </div>
  );
}

