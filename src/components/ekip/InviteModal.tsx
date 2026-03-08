'use client';

import { useState } from 'react';
import { inviteUser } from '@/app/actions/inviteUser';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvited: () => void;
}

export function InviteModal({ open, onOpenChange, onInvited }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setLoading(true);

    const result = await inviteUser(email.trim());

    setLoading(false);

    if (result.error) {
      toast.error('Davet gönderilemedi', {
        description: result.error,
        duration: 3000,
      });
      return;
    }

    toast.success('Davet e-postası gönderildi', {
      description: `${email} adresine davet gönderildi.`,
      duration: 3000,
    });
    setEmail('');
    onOpenChange(false);
    onInvited();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Üye Davet Et</DialogTitle>
          <DialogDescription>
            Yeni ekip üyesine davet e-postası gönderin. Davet linki ile kayıt
            olabilir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="invite-email" className="text-sm">
              E-posta Adresi
            </Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="yeni.uye@hys.com.tr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-sm"
          >
            İptal
          </Button>
          <Button
            onClick={handleInvite}
            disabled={loading || !email.trim()}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm"
          >
            {loading ? 'Gönderiliyor...' : 'Davet Gönder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
