import { FileText, Download } from "lucide-react";

export default function OmenaiGuarantee() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-dark/20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            OMENAI Guarantee
          </h1>
          <p className="text-gray-600">
            Protection for eligible purchases made on Omenai
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
              <span>Effective Date: March 1, 2026</span>
            </div>
            <a
              href="/legal/omenai-guarantee.pdf"
              download="OMENAI-Guarantee.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 bg-dark text-white rounded hover:bg-dark/80 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4 mr-2" />
              Download as PDF
            </a>
          </div>

          {/* Guarantee Content */}
          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              OMENAI Guarantee
            </h2>

            <p className="text-gray-700 mb-4">
              OMENAI is built to make collecting contemporary African art feel
              clear, secure, and trustworthy. The OMENAI Guarantee explains what
              we cover if an eligible purchase has a serious issue.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              1. Eligibility
            </h3>
            <p className="text-gray-700 mb-4">
              The OMENAI Guarantee applies to purchases that are confirmed and
              paid through the OMENAI platform.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              2. What the Guarantee Covers
            </h3>
            <p className="text-gray-700 mb-2">
              Subject to the requirements below, OMENAI may provide a resolution
              if:
            </p>

            <p className="text-gray-700 font-medium mt-4 mb-1">
              A. The artwork does not arrive
            </p>
            <p className="text-gray-700 mb-4">
              If an artwork is lost in transit or fails to arrive by the latest
              estimated delivery date provided by the carrier or logistics
              partner.
            </p>

            <p className="text-gray-700 font-medium mt-4 mb-1">
              B. The artwork arrives damaged prior to delivery
            </p>
            <p className="text-gray-700 mb-4">
              Including damage in transit or damage sustained before delivery is
              completed.
            </p>

            <p className="text-gray-700 font-medium mt-4 mb-1">
              C. The artwork is materially misrepresented
            </p>
            <p className="text-gray-700 mb-4">
              Meaning the artwork materially differs from its listing in a way
              that reasonably affects identity, value, or collectability.
              Examples may include an incorrect work, incorrect medium,
              incorrect dimensions beyond minor variance, incorrect edition
              details, or other material listing inaccuracies.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              3. What Is Not Covered
            </h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Change of mind, taste, or buyer remorse</li>
              <li>
                Minor variations inherent to handmade works and editions that do
                not amount to material misrepresentation
              </li>
              <li>
                Differences in color appearance due to screens, lighting, or
                display settings
              </li>
              <li>
                Damage after delivery due to handling, installation, framing,
                storage, or environmental conditions
              </li>
              <li>
                Issues caused by third-party services not arranged by OMENAI
              </li>
              <li>Claims submitted outside the reporting deadlines</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              4. Reporting Deadlines
            </h3>
            <p className="text-gray-700 mb-2">
              To be eligible for review, you must contact OMENAI:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                Within seven (7) days of delivery for damage or material
                misrepresentation claims
              </li>
              <li>
                Within seven (7) days after the latest estimated delivery date
                if an artwork does not arrive
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              5. Documentation Requirements
            </h3>
            <p className="text-gray-700 mb-2">To submit a claim, provide:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Order number</li>
              <li>A written description of the issue</li>
              <li>Clear photos of the artwork and packaging</li>
              <li>
                For damage claims, photos of the exterior packaging, interior
                packaging, and the damaged area. A short video is strongly
                recommended.
              </li>
            </ul>

            <p className="text-gray-700 mb-4">
              <strong>Important:</strong> Keep all original packaging materials.
              Do not discard crates, boxes, or packing materials until the claim
              is resolved.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              6. Resolutions
            </h3>
            <p className="text-gray-700 mb-2">
              If a claim is approved, OMENAI may offer one or more of the
              following, at its discretion:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Repair or conservation support</li>
              <li>Replacement (when applicable, typically for editions)</li>
              <li>Partial refund</li>
              <li>Full refund</li>
            </ul>
            <p className="text-gray-700 mb-4">
              OMENAI may coordinate with the seller, shipper, and insurer as
              part of the claims process.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              7. Returns
            </h3>
            <p className="text-gray-700 mb-4">
              OMENAI does not accept returns as a standard policy. A return may
              be permitted only if OMENAI explicitly authorizes it in writing as
              part of an approved claim resolution. If a return is authorized,
              OMENAI will provide return instructions. Unless otherwise
              specified, return shipping costs are borne by the Collector.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              8. How to Submit a Claim
            </h3>
            <p className="text-gray-700 mb-4">
              Email <strong>support@omenai.app</strong> with the subject line:
              <br />
              <em>OMENAI Guarantee Claim, Order [Order Number]</em>
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              9. Relationship to the Collectors Terms
            </h3>
            <p className="text-gray-700 mb-4">
              This Guarantee is part of and incorporated into the OMENAI
              Collectors Terms and Conditions. If there is a conflict, the
              Collectors Terms control to the extent permitted by law.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
