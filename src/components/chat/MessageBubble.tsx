import React from 'react';
import { Message } from '@/types/chat';
import { Check, CheckCheck, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSender?: boolean;
}

interface PaymentData {
  type: string;
  amount: string;
  clientTxnId: string;
  bankTxnId: string;
  paymentMode: string;
  status: string;
}

function PaymentCard({ data, timestamp }: { data: PaymentData; timestamp: any }) {
  const formatDateTime = (ts: any) => {
    if (!ts) return { date: '', time: '' };
    const d = ts.toDate();
    const date = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { date, time };
  };

  const { date, time } = formatDateTime(timestamp);

  return (
    <div className="max-w-[80%] rounded-2xl overflow-hidden shadow-lg border border-emerald-500/30">
      {/* Header */}
      <div className="bg-emerald-600 px-4 py-2.5 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
          <IndianRupee className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-sm text-white">Deposit Successful</span>
      </div>

      {/* Body */}
      <div className="bg-emerald-500/90 px-4 py-3 space-y-3">
        <p className="text-white font-bold text-2xl text-center">₹{data.amount}</p>

        <div className="bg-white/10 rounded-lg px-3 py-2 space-y-1.5">
          {data.bankTxnId && (
            <div className="flex justify-between text-sm">
              <span className="text-white/70">UTR</span>
              <span className="text-white font-medium">{data.bankTxnId}</span>
            </div>
          )}
          {data.clientTxnId && (
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Txn ID</span>
              <span className="text-white font-medium text-xs">{data.clientTxnId}</span>
            </div>
          )}
          {data.paymentMode && (
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Mode</span>
              <span className="text-white font-medium">{data.paymentMode}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Date</span>
            <span className="text-white font-medium">{date}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Time</span>
            <span className="text-white font-medium">{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MessageBubble({ message, isOwn, showSender = false }: MessageBubbleProps) {
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check if this is a payment message
  if ((message as any).type === 'payment') {
    try {
      const paymentData: PaymentData = JSON.parse(message.text);
      return (
        <div className={cn('flex message-animate', isOwn ? 'justify-end' : 'justify-start')}>
          <PaymentCard data={paymentData} timestamp={message.createdAt} />
        </div>
      );
    } catch {
      // fall through to normal rendering
    }
  }

  const isSeen = message.seenBy.length > 1;

  return (
    <div
      className={cn(
        'flex message-animate',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2 shadow-sm',
          isOwn
            ? 'bg-chat-sent text-chat-sent-foreground rounded-br-md'
            : 'bg-chat-received text-chat-received-foreground rounded-bl-md'
        )}
      >
        {showSender && !isOwn && (
          <p className="text-xs font-semibold text-accent mb-1">{message.user}</p>
        )}
        
        <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
          {message.text}
        </p>
        
        <div className={cn(
          'flex items-center gap-1 mt-1',
          isOwn ? 'justify-end' : 'justify-start'
        )}>
          <span className={cn(
            'text-[11px]',
            isOwn ? 'text-chat-sent-foreground/70' : 'text-timestamp'
          )}>
            {formatTime(message.createdAt)}
          </span>
          
          {isOwn && (
            <span className="text-chat-sent-foreground/70">
              {isSeen ? (
                <CheckCheck className="w-4 h-4" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
