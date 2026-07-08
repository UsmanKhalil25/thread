import Link from 'next/link';
import { Spool, Shield, WifiOff, Code2, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-start justify-center">
        <div className="mt-[-120px] h-[600px] w-[900px] rounded-full bg-white/[0.03] blur-[120px]" />
      </div>

      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff0a 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 100%)',
        }}
      />

      <main className="relative flex flex-1 flex-col items-center px-6">
        {/* Hero */}
        <section className="flex max-w-2xl flex-col items-center gap-8 pt-28 pb-24 text-center">
          <div className="border-border bg-card inline-flex items-center gap-2 rounded-full border px-3 py-1">
            <span className="size-1.5 rounded-full bg-yellow-400" />
            <span className="text-muted-foreground font-mono text-xs">Now in closed testing</span>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Spool className="text-foreground/80 size-10" strokeWidth={1.25} />
            <h1 className="text-foreground text-7xl leading-none font-black tracking-tighter">
              Thread
            </h1>
            <p className="text-muted-foreground max-w-sm text-lg leading-relaxed">
              A private AI assistant that runs entirely on your phone.{' '}
              <span className="text-foreground/70">No cloud. No data sent. Ever.</span>
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <a
              href="#"
              className="group bg-foreground text-background hover:bg-foreground/90 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all active:scale-95">
              Get it on Google Play
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="https://github.com/UsmanKhalil25/thread"
              target="_blank"
              rel="noopener noreferrer"
              className="border-border text-foreground hover:bg-card inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-all active:scale-95">
              View on GitHub
            </a>
          </div>
        </section>

        {/* Feature cards */}
        <section className="grid w-full max-w-3xl gap-3 pb-28 sm:grid-cols-3">
          {[
            {
              icon: Shield,
              title: 'Runs Locally',
              description:
                'All inference happens on-device using open models. No internet required.',
            },
            {
              icon: WifiOff,
              title: 'No Data Sent',
              description: 'Your conversations never leave your device. Zero telemetry.',
            },
            {
              icon: Code2,
              title: 'Open Source',
              description: 'Fully transparent and auditable. See exactly what runs on your phone.',
            },
          ].map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group border-border bg-card hover:bg-card/80 relative rounded-xl border p-6 transition-all hover:border-white/10">
              <div
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(400px circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.03), transparent 60%)',
                }}
              />
              <div className="flex flex-col gap-3">
                <div className="bg-muted inline-flex size-9 items-center justify-center rounded-lg">
                  <Icon className="text-foreground/70 size-4" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-foreground text-sm font-semibold">{title}</h3>
                  <p className="text-muted-foreground font-mono text-xs leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-border relative w-full border-t">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <Spool className="text-muted-foreground size-3.5" strokeWidth={1.5} />
            <span className="text-muted-foreground font-mono text-xs">Thread</span>
          </div>
          <Link
            href="/privacy"
            className="text-muted-foreground hover:text-foreground font-mono text-xs underline underline-offset-4 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}
