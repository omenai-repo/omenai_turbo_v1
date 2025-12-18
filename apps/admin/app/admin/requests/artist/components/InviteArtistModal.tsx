import { Modal } from "@mantine/core";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { Mail } from "lucide-react";

interface SelectedArtist {
  waitlistId: string;
  name: string;
  email: string;
}

export function InviteArtistModal({
  opened,
  close,
  SelectedArtists,
  onConfirmInvite,
  isInviting,
}: Readonly<{
  opened: boolean;
  close: () => void;
  SelectedArtists: SelectedArtist[];
  onConfirmInvite: () => void;
  isInviting: boolean;
}>) {
  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      size="md"
      radius="lg"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        content: {
          backgroundColor: "transparent",
          padding: 0,
          overflow: "visible",
          height: "90vh",
        },
        header: {
          display: "none",
        },
        body: {
          padding: 0,
          height: "100%",
        },
      }}
    >
      <div className="relative h-full">
        {/* Main modal content */}
        <div className="relative bg-white rounded shadow-2xl overflow-hidden border border-gray-100 h-full flex flex-col">
          {/* Header section with logo - Fixed */}
          <div className="relative bg-gray-50 border-b border-gray-100 flex-shrink-0">
            {/* Content */}
            <div className="px-6 py-4 text-center">
              {/* Title */}
              <h2 className="text-fluid-sm font-semibold text-gray-900 mb-2">
                Please Review Your Selection Carefully
              </h2>

              {/* Subtitle */}
              <p className="text-gray-600 text-fluid-xxs">
                Once you send invitations, this action cannot be undone.
                Selected users will receive their invitation emails and their
                accounts will be marked as invited in the system.
              </p>
            </div>
          </div>

          {/* Content section - Scrollable */}
          <div className="flex-1 overflow-y-auto px-8 py-2 space-y-3">
            {SelectedArtists.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 text-fluid-xs">
                  No artist selected
                </p>
              </div>
            ) : (
              SelectedArtists.map((artist) => (
                <div
                  key={artist.waitlistId}
                  className="flex items-center space-x-4 p-3 rounded bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex-1 text-left">
                    <p className="text-fluid-xxs text-gray-900 font-medium">
                      {artist.name}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Mail size={14} className="text-slate-600" />
                      <p className="text-fluid-xxs text-slate-700 font-medium">
                        {artist.email}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Action button - Fixed */}
          <div className="px-6 py-3 flex justify-center border-t border-gray-100 gap-4">
            <button
              onClick={close}
              disabled={isInviting}
              className="w-full py-2 px-4 justify-center rounded-full flex items-center gap-2 text-dark hover:bg-dark/10 hover:text-dark border border-dark/10 duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Review selection
            </button>
            <button
              onClick={onConfirmInvite}
              disabled={SelectedArtists.length === 0 || isInviting}
              className="w-full bg-dark py-2 px-4 rounded-full text-white hover:bg-dark/80 disabled:bg-dark/10 disabled:cursor-not-allowed disabled:text-dark/50 hover:text-white hover:duration-200 grid place-items-center group"
            >
              {isInviting ? (
                <LoadSmall />
              ) : (
                `Invite Selected (${SelectedArtists.length})`
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
