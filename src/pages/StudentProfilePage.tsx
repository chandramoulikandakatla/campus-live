import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { StudentProfileModal } from '@/components/profile/StudentProfileModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore, inr } from '@/lib/store';
import { useAuth, useProfile } from '@/lib/auth';
import { User, Wallet, Shield, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentProfilePage() {
  const [modalOpen, setModalOpen] = useState(true);
  const student = useStore((s) => s.student);
  const walletBalance = useStore((s) => s.walletBalance);
  const { data: profile } = useProfile();

  const fullName = profile?.full_name || student.fullName || 'Aarav Mehta';
  const studentId = profile?.student_id || student.studentId || 'CK2026001';

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-2xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
              Verified Student Account
            </Badge>
            <h1 className="mt-2 font-display text-2xl font-bold">Student Profile & Settings</h1>
          </div>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            Open Profile Card
          </Button>
        </div>

        <StudentProfileModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />

        {!modalOpen && (
          <Card className="p-6 border-border space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-xl flex items-center justify-center">
                {fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">{fullName}</h3>
                <p className="text-xs text-muted-foreground">Student ID: {studentId} · {student.city}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                  Wallet Balance: {inr(walletBalance)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex gap-2">
              <Button onClick={() => setModalOpen(true)} className="flex-1">
                View Full Digital ID
              </Button>
              <Link to="/wallet" className="flex-1">
                <Button variant="outline" className="w-full">
                  Manage Wallet
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
