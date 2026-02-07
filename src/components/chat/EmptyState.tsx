import React from 'react';
import { MessageSquare, Shield, Zap } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-muted/30 p-8">
      <div className="max-w-md text-center animate-fade-in">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
          <MessageSquare className="w-12 h-12 text-primary" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Business Chat
        </h2>

        {/* Description */}
        <p className="text-muted-foreground mb-8">
          Select a conversation from the sidebar to start messaging, or wait for new client inquiries.
        </p>

        {/* Features */}
        <div className="grid gap-4 text-left">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Real-time messaging</h3>
              <p className="text-sm text-muted-foreground">
                Messages sync instantly across all devices
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Read receipts</h3>
              <p className="text-sm text-muted-foreground">
                Know when your messages have been seen
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
