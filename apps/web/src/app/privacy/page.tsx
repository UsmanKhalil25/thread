import type { Metadata } from 'next';
import { Spool } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Privacy Policy — Thread',
  description:
    'Thread does not collect, transmit, or store any personal data. All processing happens on-device.',
  openGraph: {
    title: 'Privacy Policy — Thread',
    description: 'Thread does not collect, transmit, or store any personal data.',
  },
  alternates: {
    canonical: 'https://thread-ai.app/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <main className="bg-background flex flex-1 items-start justify-center px-6 py-24">
      <div className="w-full max-w-2xl space-y-4">
        <div className="mb-8 flex items-center gap-3">
          <Spool className="text-foreground size-6" strokeWidth={1.5} />
          <h1 className="text-foreground text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
        </div>

        <p className="text-muted-foreground mb-8 font-mono text-sm">
          <strong className="text-foreground">Last updated:</strong> July 8, 2026
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="font-mono text-sm leading-relaxed">
              Thread does not collect, transmit, or store any personal data. All processing happens
              on-device. No data is sent to external servers.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-muted-foreground list-disc space-y-2 pl-5 font-mono text-sm leading-relaxed">
              <li>
                <strong className="text-foreground">Microphone</strong> — Used for speech-to-text
                (optional). Audio is processed on-device and never transmitted.
              </li>
              <li>
                <strong className="text-foreground">Storage</strong> — Used to store model files and
                conversation history. All data remains on-device.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Third Parties</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="font-mono text-sm leading-relaxed">
              Thread contains no third-party analytics, tracking, or SDKs that transmit data. The
              app is fully self-contained.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="font-mono text-sm leading-relaxed">
              If you have any questions, reach out at{' '}
              <a
                href="mailto:usmankhalil8011@gmail.com"
                className="text-foreground hover:text-muted-foreground underline underline-offset-4 transition-colors">
                usmankhalil8011@gmail.com
              </a>
              .
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
