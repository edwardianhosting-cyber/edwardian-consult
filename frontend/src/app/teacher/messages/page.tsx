'use client';

import { MessageSquare, Info } from 'lucide-react';

export default function TeacherMessages() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Communicate with students and parents</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">Messaging Backend Coming Soon</p>
          <p className="text-sm text-blue-600 mt-1">
            The messaging feature is currently under development. You will be able to send and receive messages
            from students and parents directly from this portal once the backend is ready.
          </p>
        </div>
      </div>

      <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages Coming Soon</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Direct messaging between teachers, students, and parents will be available here once the messaging
          backend is fully integrated.
        </p>
      </div>
    </div>
  );
}
