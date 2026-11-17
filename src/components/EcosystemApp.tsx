import React, { useEffect } from 'react';
import { useStore } from '../lib/store';
import { PortalType } from '../types/ecosystem';
import { ShaderBackground } from './common/ShaderBackground';
import { Toast } from './common/Toast';
import { ReceiptModal } from './common/ReceiptModal';
import { DemoGuideModal } from './common/DemoGuideModal';
import { PortalHeader } from './common/PortalHeader';
import { StudentPortal } from './student/StudentPortal';
import { ParentPortal } from './parent/ParentPortal';
import { OpsPortal } from './ops/OpsPortal';
import { CollegePortal } from './college/CollegePortal';

interface EcosystemAppProps {
  initialPortal?: PortalType;
}

export function EcosystemApp({ initialPortal }: EcosystemAppProps) {
  const activePortal = useStore((s) => s.activePortal);
  const setActivePortal = useStore((s) => s.setActivePortal);
  const currentStudent = useStore((s) => s.getCurrentStudent());
  const students = useStore((s) => s.ecosystem.students);
  const orders = useStore((s) => s.ecosystem.orders);
  const toast = useStore((s) => s.toast);
  const clearToast = useStore((s) => s.clearToast);
  const showDemoModal = useStore((s) => s.showDemoModal);
  const setShowDemoModal = useStore((s) => s.setShowDemoModal);
  const receiptModalOrder = useStore((s) => s.receiptModalOrder);
  const setReceiptModalOrder = useStore((s) => s.setReceiptModalOrder);
  const resetDemo = useStore((s) => s.resetDemo);
  const showToast = useStore((s) => s.showToast);

  useEffect(() => {
    if (initialPortal && initialPortal !== activePortal) {
      setActivePortal(initialPortal);
    }
  }, [initialPortal, activePortal, setActivePortal]);

  const activeOpsOrdersCount = orders.filter(
    (o) => o.status !== 'Completed' && o.status !== 'Cancelled'
  ).length;

  return (
    <div className="min-h-screen text-slate-100 font-sans relative selection:bg-indigo-500 selection:text-white">
      {/* Dynamic WebGL/Canvas Shader Mesh */}
      <ShaderBackground theme={activePortal} />

      {/* Global Toast Alert System */}
      <Toast toast={toast} onClose={clearToast} />

      {/* Receipt Inspection Modal */}
      <ReceiptModal
        order={receiptModalOrder}
        onClose={() => setReceiptModalOrder(null)}
        onDownload={() =>
          showToast(
            'Receipt Downloaded',
            `Official receipt for ${receiptModalOrder?.id} saved as PDF.`,
            'success'
          )
        }
      />

      {/* Evaluator Support & Demo Guide Modal */}
      <DemoGuideModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        onResetDemo={resetDemo}
      />

      {/* Top Navigation & 4-Portal Switcher Bar */}
      <PortalHeader
        activePortal={activePortal}
        setActivePortal={setActivePortal}
        currentStudent={currentStudent}
        students={students}
        ordersCount={orders.length}
        activeOpsOrdersCount={activeOpsOrdersCount}
        onOpenDemoModal={() => setShowDemoModal(true)}
      />

      {/* Active Portal Views */}
      {activePortal === 'student' && <StudentPortal />}
      {activePortal === 'parent' && <ParentPortal />}
      {activePortal === 'ops' && <OpsPortal />}
      {activePortal === 'college' && <CollegePortal />}
    </div>
  );
}

export default EcosystemApp;
