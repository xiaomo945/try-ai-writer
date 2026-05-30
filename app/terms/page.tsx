import Link from "next/link";
import Logo from "@/app/components/Logo";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-gray-950 dark:to-gray-900">
      <header className="border-b border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-lg font-display font-extrabold text-white">Use AI<span className="text-blue-400">Writer</span></span>
          </Link>
          <Link href="/" className="btn-outline text-sm px-4 py-2">
            Back to Home
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="glass-card p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white mb-8">
            Terms of Service
          </h1>
          
          <p className="text-slate-400 text-sm mb-8">
            Last updated: May 30, 2026
          </p>

          <div className="prose prose-invert prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <div className="text-slate-300 space-y-4">
                <p>
                  By accessing or using Try AI Writer (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use the Service.
                </p>
                <p>
                  These Terms constitute a legally binding agreement between you and Try AI Writer. By using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">2. Description of Service</h2>
              <div className="text-slate-300 space-y-4">
                <p>
                  Try AI Writer provides AI-powered writing assistance, including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>AI-generated content creation and editing</li>
                  <li>Brand voice learning and personalization</li>
                  <li>Document processing and analysis</li>
                  <li>Writing templates and tools</li>
                  <li>Subscription-based premium features</li>
                </ul>
                <p className="mt-4">
                  We reserve the right to modify, suspend, or discontinue any part of the Service at any time without prior notice.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">3. User Accounts</h2>
              <div className="text-slate-300 space-y-4">
                <p>
                  To access certain features, you must create an account. You are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Maintaining the confidentiality of your login credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                  <li>Providing accurate and complete information</li>
                </ul>
                <p className="mt-4">
                  We reserve the right to terminate accounts that violate these Terms or are used for illegal purposes.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">4. User Responsibilities</h2>
              <div className="text-slate-300 space-y-4">
                <p>When using our Service, you agree not to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Generate harmful, offensive, or illegal content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Reverse engineer or decompile the Service</li>
                  <li>Use automated tools to access the Service without permission</li>
                  <li>Share your account credentials with others</li>
                  <li>Interfere with the proper functioning of the Service</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">5. Subscription and Payments</h2>
              <div className="text-slate-300 space-y-4">
                <p>
                  <strong className="text-white">Billing:</strong> Subscription fees are billed in advance on a monthly or annual basis. By subscribing, you authorize us to charge your designated payment method.
                </p>
                <p>
                  <strong className="text-white">Pricing:</strong> Prices are subject to change with 30 days&apos; notice. Price changes will apply to the next billing cycle.
                </p>
                <p>
                  <strong className="text-white">Refunds:</strong> Refunds are provided within 7 days of purchase if you are unsatisfied with the Service. After 7 days, no refunds will be issued.
                </p>
                <p>
                  <strong className="text-white">Free Usage:</strong> The Free tier includes limited daily generations and is provided as-is without guarantees.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">6. Intellectual Property</h2>
              <div className="text-slate-300 space-y-4">
                <p>
                  <strong className="text-white">Your Content:</strong> You retain ownership of content you create using the Service. By using our Service, you grant us a limited license to process your content to provide the Service.
                </p>
                <p>
                  <strong className="text-white">AI-Generated Content:</strong> Content generated by our AI is your intellectual property. However, we cannot guarantee that AI-generated content does not infringe third-party rights.
                </p>
                <p>
                  <strong className="text-white">Service Content:</strong> All software, designs, logos, and other materials provided through the Service are owned by Try AI Writer and protected by intellectual property laws.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">7. Disclaimer of Warranties</h2>
              <div className="text-slate-300 space-y-4">
                <p>
                  THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                </p>
                <p>
                  We do not warrant that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>The Service will be uninterrupted, secure, or error-free</li>
                  <li>The results obtained from the Service will be accurate or reliable</li>
                  <li>The quality of any content will meet your expectations</li>
                  <li>Any errors in the Service will be corrected</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">8. Limitation of Liability</h2>
              <div className="text-slate-300 space-y-4">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, USE AI WRITER SHALL NOT BE LIABLE FOR:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                  <li>Loss of profits, revenue, data, or business opportunities</li>
                  <li>Any damages resulting from your use of AI-generated content</li>
                  <li>Any damages resulting from third-party actions or unauthorized access</li>
                </ul>
                <p className="mt-4">
                  OUR TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM THIS AGREEMENT SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">9. Indemnification</h2>
              <div className="text-slate-300">
                <p>
                  You agree to indemnify, defend, and hold harmless Try AI Writer and its affiliates from any claims, damages, losses, or expenses (including legal fees) arising from:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>Your violation of these Terms</li>
                  <li>Your misuse of the Service</li>
                  <li>Your infringement of third-party rights</li>
                  <li>Your illegal or harmful activities</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">10. Termination</h2>
              <div className="text-slate-300 space-y-4">
                <p>
                  <strong className="text-white">By You:</strong> You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of your current billing period.
                </p>
                <p>
                  <strong className="text-white">By Us:</strong> We may terminate or suspend your account immediately if you violate these Terms or engage in illegal activities.
                </p>
                <p>
                  <strong className="text-white">Effect of Termination:</strong> Upon termination, your right to use the Service ceases immediately. We may retain your data as required by law.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">11. Governing Law</h2>
              <div className="text-slate-300">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the United States. Any disputes arising from these Terms shall be resolved in the courts of the United States.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">12. Changes to Terms</h2>
              <div className="text-slate-300">
                <p>
                  We reserve the right to modify these Terms at any time. We will provide notice of significant changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the new Terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-4">13. Contact Information</h2>
              <div className="text-slate-300">
                <p>
                  For questions about these Terms, please contact us:
                </p>
                <ul className="list-none space-y-2 mt-4">
                  <li><strong className="text-white">Email:</strong> hello@tryaiwriter.com</li>
                  <li><strong className="text-white">Website:</strong> https://tryaiwriter.com/contact</li>
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
