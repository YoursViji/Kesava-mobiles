import type { ReactNode } from 'react'
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { seoConfig, seoHead } from '@/lib/monstarx/seo'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CompareBar } from '@/components/CompareBar'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { LanguageProvider } from '@/lib/i18n'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  // Titles, descriptions, social cards and structured data for every page come from the SEO/GEO tab
  // (src/seo.config.ts). A page that wants its own title sets head() in its own route file.
  head: (ctx) => {
    const seo = seoHead(ctx)
    return { ...seo, links: [...seo.links, { rel: 'stylesheet', href: appCss }] }
  },
  shellComponent: RootDocument,
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang={seoConfig.locale || 'en'}>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1 pb-16">
          <Outlet />
        </div>
        <CompareBar />
        <Footer />
        <WhatsAppButton floating message="Hi Kesava Mobiles, I have an enquiry." />
      </div>
    </LanguageProvider>
  )
}

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="mt-2 text-neutral-500">The page you are looking for does not exist.</p>
      </div>
    </main>
  )
}
