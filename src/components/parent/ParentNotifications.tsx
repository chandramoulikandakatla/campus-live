import React from 'react';
import { useStore } from '../../lib/store';

export function ParentNotifications() {
  const { ecosystem, linkedStudentId, markNotificationRead } = useStore();

  const parentLinkedStudent =
    ecosystem.students.find((s) => s.id === linkedStudentId) || ecosystem.students[0];
  const notifications = ecosystem.notifications.filter(
    (n) => n.studentId === parentLinkedStudent.id
  );

  return (
    <div className="max-w-3xl mx-auto bg-slate-900/90 border border-white/15 rounded-3xl p-6 space-y-4">
      <h2 className="text-xl font-extrabold text-white">Parent Real-Time Notifications</h2>
      <div className="space-y-2.5">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl">
            No notifications for {parentLinkedStudent.name}.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`p-4 rounded-2xl bg-slate-950/80 border text-xs flex items-start justify-between gap-3 cursor-pointer transition-colors ${
                n.read ? 'border-white/10 opacity-70' : 'border-emerald-500/30'
              }`}
            >
              <div>
                <p className="font-bold text-emerald-300 text-sm">{n.title}</p>
                <p className="text-slate-300 mt-1">{n.message}</p>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
