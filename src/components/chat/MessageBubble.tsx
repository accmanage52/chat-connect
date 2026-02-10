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
  const formatTime = (ts: any) => {
    if (!ts) return '';
    const date = ts.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-emerald-500/90 text-white rounded-2xl px-4 py-3 shadow-md max-w-[75%]">
      <div className="flex items-center gap-2 mb-2">
        <IndianRupee className="w-5 h-5" />
        <span className="font-semibold text-sm">Deposit Successful</span>
      </div>
      <div className="space-y-1 text-sm">
        <p className="font-bold text-lg">₹{data.amount}</p>
        {data.clientTxnId && (
          <p className="text-white/80 text-xs">TxnId: {data.clientTxnId}</p>
        )}
        {data.bankTxnId && (
          <p className="text-white/80 text-xs">UTR: {data.bankTxnId}</p>
        )}
        {data.paymentMode && (
          <p className="text-white/80 text-xs">Mode: {data.paymentMode}</p>
        )}
      </div>
      <p className="text-white/60 text-[11px] mt-2 text-right">
        {formatTime(timestamp)}
      </p>
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
