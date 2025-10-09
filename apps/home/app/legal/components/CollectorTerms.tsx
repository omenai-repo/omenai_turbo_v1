import { FileText, Download } from "lucide-react";

export default function CollectorsTerms() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-dark/20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Collectors Terms and Conditions
          </h1>
          <p className="text-gray-600">
            Terms governing collector participation on Omenai
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
              href="/legal/collectors-terms.pdf"
              download="Omenai-Collectors-terms.pdf"
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
              Omenai Collectors Terms and Conditions
            </h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              About Omenai
            </h3>
            <p className="text-gray-700 mb-4">
              At Omenai, we believe that art is more than expression - it's the
              heartbeat of a cultural and creative renaissance across Africa.
            </p>
            <p className="text-gray-700 mb-4">
              Our platform exists to bridge African creativity and the global
              art world, empowering collectors, artists, and galleries to
              connect through technology, transparency, and trust.
            </p>
            <p className="text-gray-700 mb-4">
              These Terms and Conditions (the "Agreement") outline the legal
              framework governing your use of the Omenai app and marketplace as
              a Collector.
            </p>
            <p className="text-gray-700 mb-4">
              By registering, accessing, or transacting on the Omenai platform
              ("Omenai," "we," "us," or "our"), you agree to be bound by this
              Agreement.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              1. Definitions
            </h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li className="text-gray-700">
                <strong>"Collector"</strong> means any individual or entity
                purchasing artworks through the Platform.
              </li>
              <li className="text-gray-700">
                <strong>"Artist"</strong> means any individual or collective
                listing artworks for sale.
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
                by a Collector and accepted by an Artist or Gallery.
              </li>
              <li className="text-gray-700">
                <strong>"User"</strong> collectively refers to Collectors,
                Artists, and Galleries.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              2. Eligibility and Compliance
            </h3>
            <p className="text-gray-700 mb-2">
              2.1 Users must be at least 18 years old and legally able to enter
              binding agreements.
            </p>
            <p className="text-gray-700 mb-2">
              2.2 Collectors agree to comply with all applicable laws,
              regulations, and Omenai policies.
            </p>
            <p className="text-gray-700 mb-4">
              2.3 Omenai reserves the right to verify a Collector's identity
              before granting or maintaining access.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              3. Orders and Payments
            </h3>
            <p className="text-gray-700 mb-2">
              3.1 All accepted Orders must be paid for within twenty-four (24)
              hours of acceptance.
            </p>
            <p className="text-gray-700 mb-2">
              3.2 Orders not paid within this period are automatically
              cancelled.
            </p>
            <p className="text-gray-700 mb-2">
              3.3 All transactions are denominated in United States Dollars
              (USD) and processed through approved third-party payment
              providers.
            </p>
            <p className="text-gray-700 mb-4">
              3.4 Omenai may introduce a reasonable service or
              payment-processing fee in the future with at least thirty (30)
              days' notice.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              4. Refunds and Returns
            </h3>
            <p className="text-gray-700 mb-2">
              4.1 All sales are final except where expressly provided herein.
            </p>
            <p className="text-gray-700 mb-2">
              4.2 Refunds may only be granted in cases of:
            </p>
            <p className="text-gray-700 mb-2 pl-6">
              (i) Damage sustained prior to delivery; or
            </p>
            <p className="text-gray-700 mb-4 pl-6">
              (ii) Material misrepresentation of the Artwork.
            </p>
            <p className="text-gray-700 mb-2">
              4.3 Collectors must notify Omenai within seven (7) days of
              delivery to initiate a claim.
            </p>
            <p className="text-gray-700 mb-2">
              4.4 Omenai will review each claim and make a final determination
              at its sole discretion.
            </p>
            <p className="text-gray-700 mb-4">
              4.5 Return shipping costs are borne by the Collector unless
              otherwise specified by Omenai.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              5. Shipping and Delivery
            </h3>
            <p className="text-gray-700 mb-2">
              5.1 Collectors are responsible for shipping costs as quoted at
              checkout.
            </p>
            <p className="text-gray-700 mb-2">
              5.2 Omenai arranges and manages logistics for all deliveries.
            </p>
            <p className="text-gray-700 mb-2">
              5.3 Standard insurance covering loss or damage in transit (up to
              the declared value of the Artwork) is included within the shipping
              charge.
            </p>
            <p className="text-gray-700 mb-2">
              5.4 Collectors must inspect deliveries upon receipt and report
              damage within seven (7) days.
            </p>
            <p className="text-gray-700 mb-4">
              5.5 Ownership transfers to the Collector upon successful delivery.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              6. Platform Use and Prohibited Conduct
            </h3>
            <p className="text-gray-700 mb-2">6.1 Collectors may not:</p>
            <ul className="list-none pl-6 mb-4 space-y-2">
              <li className="text-gray-700">
                a. Engage in fraudulent or deceptive transactions;
              </li>
              <li className="text-gray-700">
                b. Upload false information or content violating intellectual
                property rights;
              </li>
              <li className="text-gray-700">
                c. Use Omenai for money laundering, illegal sales, or
                unauthorized resale.
              </li>
            </ul>
            <p className="text-gray-700 mb-4">
              6.2 Omenai may suspend or terminate accounts for violations.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              7. Intellectual Property
            </h3>
            <p className="text-gray-700 mb-2">
              7.1 Collectors acknowledge that copyright in Artworks remains with
              the Artist or Gallery unless otherwise transferred in writing.
            </p>
            <p className="text-gray-700 mb-4">
              7.2 Omenai grants Collectors a limited, non-exclusive right to
              view and purchase Artworks via the Platform.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              8. Limitation of Liability
            </h3>
            <p className="text-gray-700 mb-2">
              8.1 Omenai shall not be liable for indirect, incidental, or
              consequential damages arising from use of the Platform, except in
              cases of gross negligence or willful misconduct.
            </p>
            <p className="text-gray-700 mb-4">
              8.2 In no event shall Omenai's aggregate liability exceed the
              amount paid by the Collector for the Artwork in dispute.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              9. Indemnity
            </h3>
            <p className="text-gray-700 mb-4">
              Collectors agree to indemnify and hold harmless Omenai, its
              affiliates, and personnel against any losses, claims, or damages
              arising from breach of these Terms or violation of law.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              10. Termination and Account Management
            </h3>
            <p className="text-gray-700 mb-2">
              10.1 Omenai may suspend or terminate accounts for breach of these
              Terms or applicable law.
            </p>
            <p className="text-gray-700 mb-2">
              10.2 Collectors may request account closure by contacting
              support@omenai.app.
            </p>
            <p className="text-gray-700 mb-4">
              10.3 Upon termination, Omenai may retain transaction records as
              required by law.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              11. Governing Law and Dispute Resolution
            </h3>
            <p className="text-gray-700 mb-2">
              11.1 This Agreement is governed by the laws of the State of
              Delaware, United States.
            </p>
            <p className="text-gray-700 mb-2">
              11.2 Mandatory consumer protection and data privacy laws in the
              Collector's jurisdiction (including GDPR, UK GDPR, and NDPR) shall
              also apply where relevant.
            </p>
            <p className="text-gray-700 mb-4">
              11.3 Disputes shall be resolved through binding arbitration in New
              York, United States, under the rules of the American Arbitration
              Association.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              12. Amendments
            </h3>
            <p className="text-gray-700 mb-4">
              Omenai may update these Terms from time to time. Material changes
              will be communicated via the Platform with at least thirty (30)
              days' notice. Continued use constitutes acceptance.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              13. Contact Information
            </h3>
            <p className="text-gray-700 mb-4">
              For questions or concerns regarding these Terms, please contact:
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
