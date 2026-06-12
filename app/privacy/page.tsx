import Link from "next/link";
import Logo from "@/app/components/Logo";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-gray-950 dark:to-gray-900">
      <header className="border-b border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-lg font-display font-extrabold text-slate-900 dark:text-white">Try AI<span className="text-emerald-400">Writer</span></span>
          </Link>
          <Link href="/" className="btn-outline text-sm px-4 py-2">
            Back to Home
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="glass-card p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-slate-900 dark:text-white mb-8">
            Privacy Policy
          </h1>
          
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
            Last updated: May 30, 2026
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">1. Information We Collect</h2>
              <div className="text-slate-600 dark:text-slate-300 space-y-4">
                <p>
                  At Try AI Writer, we collect information you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-slate-900 dark:text-white">Account Information:</strong> Name, email address, and authentication data when you create an account</li>
                  <li><strong className="text-slate-900 dark:text-white">Usage Data:</strong> Content you generate, preferences, and interaction patterns with our service</li>
                  <li><strong className="text-slate-900 dark:text-white">Communication Data:</strong> Messages and correspondence you send to us</li>
                  <li><strong className="text-slate-900 dark:text-white">Payment Information:</strong> Processed securely through our payment provider (Creem)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">2. How We Use Your Information</h2>
              <div className="text-slate-600 dark:text-slate-300 space-y-4">
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide, maintain, and improve our AI writing services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send you technical notices, updates, and support messages</li>
                  <li>Respond to your comments, questions, and customer service requests</li>
                  <li>Train and improve our AI models (never using your data without consent)</li>
                  <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">3. Data Protection</h2>
              <div className="text-slate-600 dark:text-slate-300 space-y-4">
                <p>
                  We implement industry-standard security measures to protect your personal information, including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Encryption of data in transit using TLS/SSL</li>
                  <li>Secure storage with access controls</li>
                  <li>Regular security audits and assessments</li>
                  <li>Compliance with SOC 2 and GDPR requirements</li>
                </ul>
                <p className="mt-4">
                  <strong className="text-slate-900 dark:text-white">Important:</strong> Your content and brand voice data are never used to train AI models shared with other users. Each user&apos;s data is isolated and protected.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">4. Cookie Policy</h2>
              <div className="text-slate-600 dark:text-slate-300 space-y-4">
                <p>
                  We use cookies and similar tracking technologies to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-slate-900 dark:text-white">Essential Cookies:</strong> Required for authentication and core functionality</li>
                  <li><strong className="text-slate-900 dark:text-white">Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
                  <li><strong className="text-slate-900 dark:text-white">Preference Cookies:</strong> Remember your settings and preferences</li>
                </ul>
                <p className="mt-4">
                  You can control cookies through your browser settings. Disabling cookies may affect some functionality.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">5. Your Rights</h2>
              <div className="text-slate-600 dark:text-slate-300 space-y-4">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate or incomplete data</li>
                  <li>Request deletion of your data (&quot;Right to be Forgotten&quot;)</li>
                  <li>Export your data in a portable format</li>
                  <li>Object to certain processing of your data</li>
                  <li>Withdraw consent at any time</li>
                </ul>
                <p className="mt-4">
                  To exercise any of these rights, please contact us at hello@tryaiwriter.com.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">6. Third-Party Services</h2>
              <div className="text-slate-600 dark:text-slate-300 space-y-4">
                <p>
                  We may use third-party services that collect and process your data:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-slate-900 dark:text-white">Payment Processing:</strong> Creem (payments are processed securely)</li>
                  <li><strong className="text-slate-900 dark:text-white">Authentication:</strong> Google OAuth (you authenticate with Google)</li>
                  <li><strong className="text-slate-900 dark:text-white">Analytics:</strong> Vercel Analytics (usage statistics)</li>
                  <li><strong className="text-slate-900 dark:text-white">AI Services:</strong> Claude API and DeepSeek API (for content generation)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">7. Children&apos;s Privacy</h2>
              <div className="text-slate-600 dark:text-slate-300">
                <p>
                  Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">8. Changes to This Policy</h2>
              <div className="text-slate-600 dark:text-slate-300">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this policy periodically.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">9. Contact Us</h2>
              <div className="text-slate-600 dark:text-slate-300">
                <p>
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <ul className="list-none space-y-2 mt-4">
                  <li><strong className="text-slate-900 dark:text-white">Email:</strong> hello@tryaiwriter.com</li>
                  <li><strong className="text-slate-900 dark:text-white">Website:</strong> https://tryaiwriter.com/contact</li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>

      <footer className="py-8 border-t border-slate-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-500">
            &copy; 2026 Try AI Writer. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
