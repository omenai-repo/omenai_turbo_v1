import { FileText, Download } from "lucide-react";
export const dynamic = "force-dynamic";
export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-dark/20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-600">
            Learn how Omenai protects your privacy
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto  py-8">
        <div className="bg-white rounded-lg shadow-sm border border-dark/20 p-8">
          {/* Download Button */}
          <div className="flex flex-col sm:flex-row space-y-4 justify-start items-center sm:justify-between mb-6 pb-6 border-b border-dark/20">
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2" />
              <span>Effective Date: October 7, 2025</span>
            </div>
            <a
              href="/legal/privacy-policy.pdf"
              download="Omenai-Privacy-Policy.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 bg-dark text-white rounded hover:bg-dark/80 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              Download as PDF
            </a>
          </div>

          {/* Privacy Policy Content */}
          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Omenai Privacy Policy
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              About This Policy
            </h3>
            <p className="text-gray-700 mb-4">
              Omenai ("we," "us," or "our") values your trust and is committed
              to protecting your privacy. This Privacy Policy explains how we
              collect, use, store, and protect personal data when you use the
              Omenai platform, mobile app, or related services (collectively,
              the "Platform").
            </p>
            <p className="text-gray-700 mb-4">
              By accessing or using Omenai, you consent to the collection and
              use of your information as described in this Policy.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              1. Who We Are
            </h3>
            <p className="text-gray-700 mb-4">
              Omenai is a digital platform connecting artists, galleries, and
              collectors across Africa and the global art market.
            </p>
            <p className="text-gray-700 mb-4">
              We operate as Omenai, Inc., registered in Delaware, USA.
            </p>
            <p className="text-gray-700 mb-2">
              For privacy-related questions or requests, you may contact us at:
            </p>
            <ul className="list-none pl-0 mb-4 space-y-2">
              <li className="text-gray-700">
                <strong>legal@omenai.app</strong> (for data protection and
                compliance matters)
              </li>
              <li className="text-gray-700">or</li>
              <li className="text-gray-700">
                <strong>info@omenai.app</strong> (for general inquiries)
              </li>
            </ul>
            <p className="text-gray-700 mb-2">
              <strong>Registered Address:</strong>
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Omenai, Inc.</strong>
              <br />
              16192 Coastal Hwy, Lewes, DE 19958, USA
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              2. Information We Collect
            </h3>
            <p className="text-gray-700 mb-4">
              We collect the following categories of information depending on
              your role (Artist, Gallery, or Collector) and how you interact
              with the Platform:
            </p>

            <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              2.1 Information You Provide Directly
            </h4>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li className="text-gray-700">
                Account registration details (name, email, phone number,
                password)
              </li>
              <li className="text-gray-700">
                Profile details (bio, country, professional role, portfolio
                links)
              </li>
              <li className="text-gray-700">
                Payment and payout information (bank or payment processor
                details)
              </li>
              <li className="text-gray-700">
                Artwork uploads and descriptions
              </li>
              <li className="text-gray-700">
                Shipping addresses and contact preferences
              </li>
              <li className="text-gray-700">
                Communications with Omenai or other users
              </li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              2.2 Information Collected Automatically
            </h4>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li className="text-gray-700">
                Device information (browser type, IP address, operating system)
              </li>
              <li className="text-gray-700">
                Usage data (pages viewed, features used, time spent on platform)
              </li>
              <li className="text-gray-700">
                Cookies and tracking data for analytics and personalization
              </li>
            </ul>

            <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
              2.3 Information from Third Parties
            </h4>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li className="text-gray-700">
                Payment processors (e.g., verification, transaction IDs)
              </li>
              <li className="text-gray-700">
                Shipping partners (delivery updates, tracking)
              </li>
              <li className="text-gray-700">
                Social media or marketing integrations (if you connect accounts)
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              3. How We Use Your Information
            </h3>
            <p className="text-gray-700 mb-4">
              We use collected information for the following purposes:
            </p>
            <ol className="list-decimal pl-6 mb-4 space-y-2">
              <li className="text-gray-700">
                To create and manage user accounts.
              </li>
              <li className="text-gray-700">
                To process transactions, payments, and shipments.
              </li>
              <li className="text-gray-700">
                To verify user identity (for Artists and Galleries).
              </li>
              <li className="text-gray-700">
                To facilitate communication between Collectors, Artists, and
                Galleries.
              </li>
              <li className="text-gray-700">
                To improve platform functionality and customer experience.
              </li>
              <li className="text-gray-700">
                To send updates, promotional messages, or service-related
                notices.
              </li>
              <li className="text-gray-700">
                To comply with legal obligations and prevent fraud or misuse.
              </li>
            </ol>
            <p className="text-gray-700 mb-4">
              <strong>We will never sell your personal data.</strong>
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              4. Legal Basis for Processing (GDPR/UK GDPR)
            </h3>
            <p className="text-gray-700 mb-4">
              If you are located in the EU or UK, we process your data under one
              or more of the following legal bases:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li className="text-gray-700">
                Performance of a contract (to provide platform services)
              </li>
              <li className="text-gray-700">
                Legitimate interest (platform security, fraud prevention,
                analytics)
              </li>
              <li className="text-gray-700">
                Legal obligation (to comply with applicable laws)
              </li>
              <li className="text-gray-700">
                Consent (for marketing communications or cookies)
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              5. Data Sharing and Disclosure
            </h3>
            <p className="text-gray-700 mb-4">
              Omenai may share your information only when necessary and with
              trusted third parties, including:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li className="text-gray-700">
                Payment processors (for transactions and withdrawals)
              </li>
              <li className="text-gray-700">Logistics and shipping partners</li>
              <li className="text-gray-700">
                IT service providers (hosting, analytics, storage)
              </li>
              <li className="text-gray-700">
                Regulatory or legal authorities (where required by law)
              </li>
            </ul>
            <p className="text-gray-700 mb-4">
              All partners are bound by confidentiality and data protection
              obligations.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              6. Data Retention
            </h3>
            <p className="text-gray-700 mb-4">
              We retain user information only as long as necessary to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li className="text-gray-700">
                Fulfill the purposes outlined in this Policy;
              </li>
              <li className="text-gray-700">
                Comply with legal and accounting obligations;
              </li>
              <li className="text-gray-700">
                Resolve disputes and enforce agreements.
              </li>
            </ul>
            <p className="text-gray-700 mb-4">
              When data is no longer needed, it is securely deleted or
              anonymized.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              7. Data Security
            </h3>
            <p className="text-gray-700 mb-4">
              We use administrative, technical, and physical safeguards to
              protect personal data against unauthorized access, alteration,
              disclosure, or destruction.
            </p>
            <p className="text-gray-700 mb-4">
              While no online system is completely secure, Omenai continuously
              implements industry-standard security measures.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              8. International Data Transfers
            </h3>
            <p className="text-gray-700 mb-4">
              Your information may be transferred to and processed in countries
              other than your own.
            </p>
            <p className="text-gray-700 mb-4">
              Where required by law (e.g., under GDPR), Omenai uses approved
              mechanisms such as Standard Contractual Clauses to ensure adequate
              protection for international data transfers.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              9. Your Rights
            </h3>
            <p className="text-gray-700 mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li className="text-gray-700">
                <strong>Access:</strong> Request a copy of your personal data.
              </li>
              <li className="text-gray-700">
                <strong>Rectification:</strong> Request corrections to
                inaccurate or incomplete information.
              </li>
              <li className="text-gray-700">
                <strong>Erasure ("Right to be Forgotten"):</strong> Request
                deletion of your data.
              </li>
              <li className="text-gray-700">
                <strong>Restriction:</strong> Request limits on data processing.
              </li>
              <li className="text-gray-700">
                <strong>Portability:</strong> Request data transfer to another
                provider.
              </li>
              <li className="text-gray-700">
                <strong>Objection:</strong> Object to processing for marketing
                or legitimate interest.
              </li>
            </ul>
            <p className="text-gray-700 mb-4">
              To exercise any of these rights, contact legal@omenai.app.
            </p>
            <p className="text-gray-700 mb-4">
              We may require verification of your identity before processing
              requests.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              10. Cookies and Tracking Technologies
            </h3>
            <p className="text-gray-700 mb-4">
              Omenai uses cookies and similar technologies to improve your
              browsing experience and analyze usage patterns.
            </p>
            <p className="text-gray-700 mb-4">
              You can manage or disable cookies through your browser settings,
              but some platform functions may not work properly without them.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              11. Children's Privacy
            </h3>
            <p className="text-gray-700 mb-4">
              Omenai is not directed toward children under 18 years of age.
            </p>
            <p className="text-gray-700 mb-4">
              We do not knowingly collect personal information from minors.
            </p>
            <p className="text-gray-700 mb-4">
              If you believe a child has provided personal data, please contact
              us immediately at legal@omenai.app.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              12. Updates to This Policy
            </h3>
            <p className="text-gray-700 mb-4">
              Omenai may update this Privacy Policy periodically.
            </p>
            <p className="text-gray-700 mb-4">
              We will post any changes on our website or app and notify users of
              material updates via email or in-app notice.
            </p>
            <p className="text-gray-700 mb-4">
              The revised Policy becomes effective on the date indicated above.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              13. Contact Information
            </h3>
            <p className="text-gray-700 mb-4">
              If you have questions or concerns about this Privacy Policy,
              please contact:
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Omenai, Inc.</strong>
              <br />
              16192 Coastal Hwy, Lewes, DE 19958, USA
              <br />
              info@omenai.app | support@omenai.app | legal@omenai.app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
