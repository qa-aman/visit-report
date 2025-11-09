'use client';

import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="mb-6">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto" />
        </div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-4">
          Visit Report Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The visit report you're looking for doesn't exist or has been deleted.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </Layout>
  );
}

