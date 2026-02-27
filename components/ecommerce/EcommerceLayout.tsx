/**
 * Layout principal e-commerce - Refined Versatility
 * Header fixe + contenu + Footer + Chatbot
 */

import React from 'react';
import EcommerceHeader from './EcommerceHeader';
import EcommerceFooter from './EcommerceFooter';
import dynamic from 'next/dynamic';

const ChatbotWidget = dynamic(() => import('@/components/ChatbotWidget'), { ssr: false });

interface Props {
  children: React.ReactNode;
  noPadding?: boolean;
}

export default function EcommerceLayout({ children, noPadding }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-offwhite">
      <EcommerceHeader />
      <main className={`flex-1 ${noPadding ? '' : 'pt-16 lg:pt-20'}`}>
        {children}
      </main>
      <EcommerceFooter />
      <ChatbotWidget />
    </div>
  );
}
