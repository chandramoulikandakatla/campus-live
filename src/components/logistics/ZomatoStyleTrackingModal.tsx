import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Order } from '@/lib/store';
import { CampusDeliveryTrackingView } from './CampusDeliveryTrackingView';

interface Props {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ZomatoStyleTrackingModal({ order, isOpen, onClose }: Props) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-6 border-zinc-200 dark:border-zinc-800 bg-background">
        <DialogHeader className="sr-only">
          <DialogTitle>Live Campus Delivery Tracking - {order.id}</DialogTitle>
        </DialogHeader>

        <CampusDeliveryTrackingView order={order} isModal />
      </DialogContent>
    </Dialog>
  );
}

// Re-export as LiveTrackingModal for clean terminology
export { ZomatoStyleTrackingModal as LiveTrackingModal };
export default ZomatoStyleTrackingModal;
