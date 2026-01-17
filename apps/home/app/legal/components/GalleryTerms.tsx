import { FileText, Download } from "lucide-react";

export default function GalleriesTerms() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-dark/20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Galleries Terms and Conditions
          </h1>
          <p className="text-gray-600">
            Terms governing gallery participation on Omenai
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded shadow-sm border border-dark/20 p-8">
          {/* Download Button */}
          <div className="flex flex-col sm:flex-row space-y-4 justify-start items-center sm:justify-between mb-6 pb-6 border-b border-dark/20">
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2" />
              <span>Effective Date: October 7, 2025</span>
            </div>
            <a
              href="/legal/galleries-terms.pdf"
              download="Omenai-Gallery-Terms.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 bg-dark text-white rounded hover:bg-dark/80 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              Download as PDF
            </a>
          </div>

          {/* Terms Content */}
          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Omenai Galleries Terms and Conditions
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              About Omenai
            </h3>
            <p className="text-gray-700 mb-4">
              Omenai is a digital platform built to connect African creativity
              with the global art world. We empower galleries to showcase and
              sell artworks from emerging and established artists to a global
              collector base — through technology, transparency, and trust.
            </p>
            <p className="text-gray-700 mb-4">
              These Terms and Conditions (the "Agreement") govern your
              participation as a Gallery on the Omenai platform ("Omenai," "we,"
              "us," or "our").
            </p>
            <p className="text-gray-700 mb-4">
              By registering, listing artworks, or conducting sales through
              Omenai, you agree to be bound by these Terms.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              1. Definitions
            </h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li className="text-gray-700">
                <strong>"Gallery"</strong> means any business entity or
                institution listing artworks for sale or exhibition.
              </li>
              <li className="text-gray-700">
                <strong>"Artist"</strong> means any individual or collective
                represented by the Gallery or listing artworks for sale.
              </li>
              <li className="text-gray-700">
                <strong>"Collector"</strong> means any individual or entity
                purchasing artworks.
              </li>
              <li className="text-gray-700">
                <strong>"Artwork"</strong> means any physical or digital art
                piece uploaded or sold via the Platform.
              </li>
              <li className="text-gray-700">
                <strong>"Order"</strong> means a confirmed transaction initiated
                by a Collector and accepted by a Gallery.
              </li>
              <li className="text-gray-700">
                <strong>"User"</strong> collectively refers to Collectors,
                Artists, and Galleries.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              2. Eligibility and Verification
            </h3>
            <p className="text-gray-700 mb-2">
              2.1 Galleries must be legally registered business entities or
              institutions authorized to represent artists.
            </p>
            <p className="text-gray-700 mb-2">
              2.2 Omenai reserves the right to verify the Gallery's legitimacy
              prior to activation or at any time thereafter.
            </p>
            <p className="text-gray-700 mb-2">2.3 Verification may include:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li className="text-gray-700">
                Business registration or incorporation documents;
              </li>
              <li className="text-gray-700">
                Proof of authorization to represent artists;
              </li>
              <li className="text-gray-700">
                Identity verification of authorized representatives.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              3. Artwork Listings and Representation
            </h3>
            <p className="text-gray-700 mb-2">
              3.1 Galleries warrant that all Artworks uploaded are authentic and
              that they have the legal right to list, market, and sell them.
            </p>
            <p className="text-gray-700 mb-2">
              3.2 Galleries must ensure accurate information, pricing, and
              condition details for all listed Artworks.
            </p>
            <p className="text-gray-700 mb-2">
              3.3 Misrepresentation or fraudulent listings may result in
              suspension or termination.
            </p>
            <p className="text-gray-700 mb-4">
              3.4 Omenai reserves the right to remove any Artwork that violates
              platform policy or applicable law.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              4. Orders and Payments
            </h3>
            <p className="text-gray-700 mb-2">
              4.1 Accepted Orders must be paid for by the Collector within
              twenty-four (24) hours.
            </p>
            <p className="text-gray-700 mb-2">
              4.2 If unpaid, the Order will be automatically cancelled.
            </p>
            <p className="text-gray-700 mb-2">
              4.3 Once payment is received, the Gallery must reserve the Artwork
              exclusively for the paying Collector, regardless of exhibition
              status.
            </p>
            <p className="text-gray-700 mb-2">
              4.4 Payments are processed in USD through approved third-party
              processors.
            </p>
            <p className="text-gray-700 mb-4">
              4.5 Omenai may introduce a reasonable processing or service fee in
              the future with thirty (30) days' prior notice.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              5. Commissions and Payouts
            </h3>
            <p className="text-gray-700 mb-2">
              5.1 Omenai's commission structure for Galleries is tiered based on
              subscription package:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li className="text-gray-700">
                <strong>Basic Tier:</strong> 25% commission per sale
              </li>
              <li className="text-gray-700">
                <strong>Pro Tier:</strong> 20% commission per sale
              </li>
              <li className="text-gray-700">
                <strong>Premium Tier:</strong> 15% commission per sale
              </li>
            </ul>
            <p className="text-gray-700 mb-2">
              5.2 Commission rates are subject to revision with thirty (30)
              days' written notice.
            </p>
            <p className="text-gray-700 mb-4">
              5.3 Payouts will be made in USD through approved payment channels.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              6. Shipping and Logistics
            </h3>
            <p className="text-gray-700 mb-2">
              6.1 Omenai arranges and manages logistics for all deliveries.
            </p>
            <p className="text-gray-700 mb-2">
              6.2 Collectors are responsible for shipping costs at checkout.
            </p>
            <p className="text-gray-700 mb-2">
              6.3 Standard insurance covering loss or damage in transit (up to
              the declared value of the Artwork) is included in the shipping
              cost.
            </p>
            <p className="text-gray-700 mb-2">
              6.4 Galleries must package Artworks securely and prepare them for
              pickup within the timeline provided by Omenai.
            </p>
            <p className="text-gray-700 mb-4">
              6.5 Claims for loss or damage must be filed within seven (7) days
              of Collector delivery.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              7. Refunds and Returns
            </h3>
            <p className="text-gray-700 mb-2">
              7.1 Refunds may be granted only if:
            </p>
            <p className="text-gray-700 mb-2 pl-6">
              (i) Damage occurred prior to or during shipment; or
            </p>
            <p className="text-gray-700 mb-4 pl-6">
              (ii) The Artwork was materially misrepresented.
            </p>
            <p className="text-gray-700 mb-2">
              7.2 Refunds are subject to Omenai's review and final decision.
            </p>
            <p className="text-gray-700 mb-4">
              7.3 Return shipping costs are borne by the Collector unless
              otherwise directed by Omenai.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              8. Inactive Accounts
            </h3>
            <p className="text-gray-700 mb-2">
              8.1 Accounts inactive for six (6) months or more may be suspended
              or removed at Omenai's discretion.
            </p>
            <p className="text-gray-700 mb-4">
              8.2 Galleries may request reactivation by contacting
              support@omenai.app.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              9. Intellectual Property Rights
            </h3>
            <p className="text-gray-700 mb-2">
              9.1 Galleries retain copyright in all content they upload but
              grant Omenai a non-exclusive, royalty-free, worldwide license to
              display, reproduce, and promote listed Artworks for marketing and
              operational purposes.
            </p>
            <p className="text-gray-700 mb-4">
              9.2 Galleries warrant that uploaded images and descriptions do not
              infringe any third-party intellectual property rights.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              10. Taxes and Compliance
            </h3>
            <p className="text-gray-700 mb-2">
              10.1 Galleries are solely responsible for any taxes or duties
              related to sales conducted on Omenai.
            </p>
            <p className="text-gray-700 mb-4">
              10.2 Omenai may issue statements or summaries for accounting
              purposes but is not liable for tax filings or remittances.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              11. Limitation of Liability
            </h3>
            <p className="text-gray-700 mb-2">
              11.1 Omenai shall not be liable for indirect, incidental, or
              consequential damages arising from use of the Platform, except in
              cases of gross negligence or willful misconduct.
            </p>
            <p className="text-gray-700 mb-4">
              11.2 In no event shall Omenai's total liability exceed the
              commission earned from the sale in dispute.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              12. Indemnity
            </h3>
            <p className="text-gray-700 mb-4">
              Galleries agree to indemnify and hold harmless Omenai, its
              affiliates, and personnel from all claims, damages, or losses
              arising from breach of these Terms or violation of any applicable
              law.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              13. Governing Law and Dispute Resolution
            </h3>
            <p className="text-gray-700 mb-2">
              13.1 This Agreement is governed by the laws of the State of
              Delaware, USA.
            </p>
            <p className="text-gray-700 mb-2">
              13.2 Mandatory consumer, privacy, and e-commerce regulations in
              the Gallery's jurisdiction (including GDPR, UK GDPR, and NDPR)
              also apply where relevant.
            </p>
            <p className="text-gray-700 mb-4">
              13.3 All disputes shall be resolved through binding arbitration in
              New York, United States, administered by the American Arbitration
              Association.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              14. Amendments
            </h3>
            <p className="text-gray-700 mb-4">
              Omenai may modify these Terms from time to time. Material changes
              will be communicated with at least thirty (30) days' notice.
              Continued use constitutes acceptance.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              15. Contact Information
            </h3>
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
