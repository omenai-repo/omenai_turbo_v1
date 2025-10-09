import { FileText, Download } from "lucide-react";

export default function ArtistsTerms() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-dark/20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Artists Terms and Conditions
          </h1>
          <p className="text-gray-600">
            Terms governing artist participation on Omenai
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow-sm border border-dark/20 p-8">
          {/* Download Button */}
          <div className="flex flex-col sm:flex-row space-y-4 justify-start items-center sm:justify-between mb-6 pb-6 border-b border-dark/20">
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2" />
              <span>Effective Date: October 7, 2025</span>
            </div>
            <a
              href="/legal/artists-terms.pdf"
              download="Omenai-Artist-terms.pdf"
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
              Omenai Artists Terms and Conditions
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              About Omenai
            </h3>
            <p className="text-gray-700 mb-4">
              At Omenai, we believe in amplifying African creativity and
              connecting it with the global art world through technology,
              transparency, and opportunity.
            </p>
            <p className="text-gray-700 mb-4">
              As an Artist on Omenai, you join a growing network of contemporary
              creators redefining how art is shared, discovered, and collected.
            </p>
            <p className="text-gray-700 mb-4">
              These Terms and Conditions (the "Agreement") outline the rights,
              responsibilities, and obligations governing your participation as
              an Artist on the Omenai platform ("Omenai," "we," "us," or "our").
            </p>
            <p className="text-gray-700 mb-4">
              By registering, uploading, or selling Artworks through Omenai, you
              acknowledge and agree to be bound by this Agreement.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              1. Definitions
            </h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li className="text-gray-700">
                <strong>"Artist"</strong> means any individual or collective
                listing artworks for sale on the Platform.
              </li>
              <li className="text-gray-700">
                <strong>"Collector"</strong> means any individual or entity
                purchasing artworks.
              </li>
              <li className="text-gray-700">
                <strong>"Gallery"</strong> means any business entity or
                institution listing artworks for sale or exhibition.
              </li>
              <li className="text-gray-700">
                <strong>"Artwork"</strong> means any physical or digital art
                piece uploaded or sold via the Platform.
              </li>
              <li className="text-gray-700">
                <strong>"Order"</strong> means a confirmed transaction initiated
                by a Collector and accepted by an Artist.
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
              2.1 Artists must be at least 18 years of age and legally able to
              enter into binding agreements.
            </p>
            <p className="text-gray-700 mb-2">
              2.2 Omenai reserves the right to verify an Artist's identity and
              professional status prior to approval or payout. Verification may
              include:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li className="text-gray-700">
                Government-issued identification;
              </li>
              <li className="text-gray-700">Proof of address;</li>
              <li className="text-gray-700">
                Portfolio or professional practice documentation.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              3. Artwork Listings and Accuracy
            </h3>
            <p className="text-gray-700 mb-2">
              3.1 Artists are responsible for ensuring that all details,
              descriptions, and images of Artworks are accurate and up to date.
            </p>
            <p className="text-gray-700 mb-2">
              3.2 Artworks must be original and created by the Artist or
              represented entity.
            </p>
            <p className="text-gray-700 mb-4">
              3.3 Misrepresentation, counterfeit submissions, or violation of
              intellectual property rights will result in immediate suspension
              or termination.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              4. Exclusivity
            </h3>
            <p className="text-gray-700 mb-2">
              4.1 All Artworks uploaded to Omenai are subject to a ninety (90)
              day exclusivity period beginning from the date of listing.
            </p>
            <p className="text-gray-700 mb-2">
              4.2 During this period, the Artwork may not be listed or sold
              elsewhere.
            </p>
            <p className="text-gray-700 mb-2">
              4.3 After ninety (90) days, the Artist may freely market the
              Artwork externally.
            </p>
            <p className="text-gray-700 mb-2">
              4.4 Breach of exclusivity will result in a penalty of ten percent
              (10%) deducted from the Artist's next successful sale proceeds.
            </p>
            <p className="text-gray-700 mb-4">
              4.5 Repeated violations may lead to account termination.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              5. Commissions and Earnings
            </h3>
            <p className="text-gray-700 mb-2">
              5.1 Omenai shall deduct a thirty-five percent (35%) commission
              from all successful sales.
            </p>
            <p className="text-gray-700 mb-2">
              5.2 Commission rates are subject to change with thirty (30) days'
              prior notice.
            </p>
            <p className="text-gray-700 mb-2">
              5.3 Artist earnings become withdrawable only after:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li className="text-gray-700">
                Confirmation of delivery to the Collector, and
              </li>
              <li className="text-gray-700">
                Expiration of the 7-day claim window for damage or
                misrepresentation.
              </li>
            </ul>
            <p className="text-gray-700 mb-4">
              5.4 Payments are made in USD via approved payment processors.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              6. Order Management
            </h3>
            <p className="text-gray-700 mb-2">
              6.1 Artists must confirm or respond to Orders within three (3)
              days of notification.
            </p>
            <p className="text-gray-700 mb-2">
              6.2 Unacknowledged Orders will be automatically declined.
            </p>
            <p className="text-gray-700 mb-4">
              6.3 If the Collector fails to remit payment within twenty-four
              (24) hours of acceptance, the Order may be voided.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              7. Shipping and Logistics
            </h3>
            <p className="text-gray-700 mb-2">
              7.1 Omenai arranges all shipping and logistics for sold Artworks.
            </p>
            <p className="text-gray-700 mb-2">
              7.2 Shipping costs are paid by the Collector.
            </p>
            <p className="text-gray-700 mb-2">
              7.3 All shipments include standard insurance covering loss or
              damage in transit up to the declared value of the Artwork.
            </p>
            <p className="text-gray-700 mb-2">
              7.4 Artists are responsible for proper packaging and readiness for
              pickup or dispatch.
            </p>
            <p className="text-gray-700 mb-4">
              7.5 Claims for transit damage must be filed within seven (7) days
              of delivery to the Collector.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              8. Intellectual Property Rights
            </h3>
            <p className="text-gray-700 mb-2">
              8.1 The Artist retains full ownership and copyright of their
              Artworks unless expressly transferred in writing.
            </p>
            <p className="text-gray-700 mb-2">
              8.2 By uploading Artworks to Omenai, Artists grant Omenai a
              non-exclusive, royalty-free, worldwide license to display,
              reproduce, and promote the Artworks for operational, marketing,
              and editorial purposes.
            </p>
            <p className="text-gray-700 mb-4">
              8.3 Omenai will never sell or reproduce an Artwork without the
              Artist's express consent.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              9. Taxes and Compliance
            </h3>
            <p className="text-gray-700 mb-2">
              9.1 Artists are solely responsible for reporting and paying any
              applicable taxes on their earnings.
            </p>
            <p className="text-gray-700 mb-4">
              9.2 Omenai may issue payment summaries or receipts for tax
              purposes but is not responsible for local tax filings.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              10. Account Management and Termination
            </h3>
            <p className="text-gray-700 mb-2">
              10.1 Omenai may suspend or terminate an Artist's account for
              violation of these Terms or applicable law.
            </p>
            <p className="text-gray-700 mb-2">
              10.2 Artists may close their accounts at any time by contacting
              support@omenai.app.
            </p>
            <p className="text-gray-700 mb-4">
              10.3 Omenai may retain transaction records as required by law.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              11. Limitation of Liability
            </h3>
            <p className="text-gray-700 mb-2">
              11.1 Omenai shall not be liable for indirect, incidental, or
              consequential damages arising from platform use, except in cases
              of gross negligence or willful misconduct.
            </p>
            <p className="text-gray-700 mb-4">
              11.2 In no event shall Omenai's total liability exceed the
              commission amount earned from the sale in dispute.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              12. Indemnity
            </h3>
            <p className="text-gray-700 mb-4">
              Artists agree to indemnify and hold harmless Omenai, its
              affiliates, and personnel from all losses, claims, or damages
              arising from breaches of these Terms, intellectual property
              violations, or unlawful use of the Platform.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              13. Governing Law and Dispute Resolution
            </h3>
            <p className="text-gray-700 mb-2">
              13.1 This Agreement is governed by the laws of the State of
              Delaware, USA.
            </p>
            <p className="text-gray-700 mb-2">
              13.2 Local consumer, data, and e-commerce laws (including GDPR, UK
              GDPR, and NDPR) shall apply where relevant.
            </p>
            <p className="text-gray-700 mb-4">
              13.3 Disputes shall be resolved by binding arbitration
              administered in New York, United States, under the American
              Arbitration Association rules.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              14. Amendments
            </h3>
            <p className="text-gray-700 mb-4">
              Omenai may modify these Terms from time to time with at least
              thirty (30) days' prior notice. Continued use constitutes
              acceptance of any changes.
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
