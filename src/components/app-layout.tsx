'use client'

import { AppHeader } from '@/components/app-header'
import React from 'react'
import { AppFooter } from '@/components/app-footer'


export function AppLayout({
  children,
  links,
}: {
  children: React.ReactNode
  links: { label: string; path: string }[]
}) {
  return (
    <>
      <div className="">
        
        <main className="">
          {children}
        </main>
        
      </div>
    </>
  )
}
