/**
 * Layout pour pages de contenu (FAQ, CGV, etc.) - EcamSap
 */

import React from 'react';
import Head from 'next/head';
import { EcommerceLayout } from '@/components/ecommerce';
import { ECAMSAP } from '@/lib/ecamsap';

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function StaticPageLayout({ title, description, children }: Props) {
  return (
    <>
      <Head>
        <title>{title} | {ECAMSAP.name}</title>
        <meta name="description" content={description || `${title} - ${ECAMSAP.tagline}`} />
      </Head>
      <EcommerceLayout>
        <article className="max-w-3xl mx-auto px-6 lg:px-20 py-16">
          <h1 className="font-heading text-3xl md:text-4xl text-charcoal mb-8">{title}</h1>
          <div className="prose prose-charcoal max-w-none text-charcoal/90">
            {children}
          </div>
        </article>
      </EcommerceLayout>
    </>
  );
}
