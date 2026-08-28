'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';

export function PaymentWidget({ result }: { result: any }) {
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');

  // Normalize result if received as a JSON string
  let data = result;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      data = {};
    }
  }
  data = data || {};

  const challanId = data.challanId || data.challan_id || data.id || '';
  const offense = data.offense || data.violation || 'Traffic Violation';
  const amount = Number(data.amount || data.totalAmount || data.fine || 0);

  const handlePayment = async () => {
    if (!challanId) return;
    setStatus('PROCESSING');

    try {
      const res = await fetch('/api/proxy/pay-challan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challanId }),
      });

      const resData = await res.json();
      if (res.ok && (resData.success || resData.status === 'PAID' || resData.challan?.status === 'PAID')) {
        setStatus('SUCCESS');
      } else {
        setStatus('ERROR');
      }
    } catch (err) {
      setStatus('ERROR');
    }
  };

  if (status === 'SUCCESS') {
    return (
      <Card className="p-5 mt-2 bg-emerald-50 dark:bg-[#1a2721] border border-emerald-200 dark:border-emerald-900/60 rounded-2xl shadow-sm text-center space-y-2">
        <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 animate-in zoom-in" />
        <h3 className="font-bold text-emerald-900 dark:text-emerald-100">Payment Successful</h3>
        <p className="text-xs text-emerald-700 dark:text-emerald-400">
          Challan <strong className="font-mono">{challanId}</strong> has been officially marked as <strong>PAID</strong> in the Parivahan database.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 mt-2 bg-white dark:bg-[#1e2430] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <ShieldCheck className="w-5 h-5 text-blue-500" />
        <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">Secure GovPay Gateway</span>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-slate-500">Challan ID:</span>
          <span className="font-mono font-medium">{challanId || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Offense:</span>
          <span className="font-medium text-right max-w-[60%] truncate">{offense}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
          <span className="font-bold text-slate-700 dark:text-slate-300">Total Amount:</span>
          <span className="font-bold text-rose-600 dark:text-rose-400">₹{amount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {status === 'ERROR' && (
        <p className="text-xs text-rose-500 text-center font-medium">Transaction failed. Please try again.</p>
      )}

      <Button 
        onClick={handlePayment} 
        disabled={status === 'PROCESSING' || !challanId}
        className="w-full bg-[#9bb3f7] hover:bg-[#8ea8f7] text-slate-950 font-bold cursor-pointer"
      >
        {status === 'PROCESSING' ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing Payment...</>
        ) : (
          <><CreditCard className="w-4 h-4 mr-2" /> Pay ₹{amount.toLocaleString('en-IN')} Now</>
        )}
      </Button>
    </Card>
  );
}