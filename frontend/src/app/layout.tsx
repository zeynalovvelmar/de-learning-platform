import type { Metadata } from 'next';
import { Geist, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/context/language-context';
import { ProgressProvider } from '@/context/progress-context';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'latin-ext'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jb-mono',
  subsets: ['latin', 'latin-ext', 'cyrillic'],
});

export const metadata: Metadata = {
  title: 'Data Engineering Mastery | DataEng.AZ',
  description:
    'Production-grade Data Engineering learning platform: 8 modules, interactive SQL & Python sandboxes, animated infographics and flashcards.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="az"
      suppressHydrationWarning
      className={`${geistSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <LanguageProvider>
            <ProgressProvider>{children}</ProgressProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
