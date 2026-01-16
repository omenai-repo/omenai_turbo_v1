import { Modal } from "@mantine/core";
import { LoadSmall } from "@omenai/shared-ui-components/components/loader/Load";
import { Mail } from "lucide-react";

interface SelectedEntity {
  waitlistId: string;
  name: string;
  email: string;
  discount: boolean;
}

export function InviteEntityModal({
  opened,
  close,
  selectedEntity,
  onConfirmInvite,
  isInviting,
}: Readonly<{
  opened: boolean;
  close: () => void;
  selectedEntity: SelectedEntity[];
  onConfirmInvite: () => void;
  isInviting: boolean;
}>) {
  return (
    <Modal
      opened={opened}
      onClose={close}
      centered
      size="lg"
      radius="lg"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 4,
      }}
      styles={{
        header: { display: "none" },
        body: { padding: 0 },
      }}
    >
      <div className="flex max-h-[80vh] flex-col overflow-hidden rounded-lg bg-white">
        {/* Header */}
        <div className="border-b border-neutral-100 px-6 py-5">
          <h2 className="text-base font-semibold text-neutral-900">
            Confirm invitations
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Invitations will be sent immediately and cannot be undone.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {selectedEntity.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-neutral-500">No users selected.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {selectedEntity.map((entity) => (
                <li
                  key={entity.waitlistId}
                  className="rounded-md border border-neutral-100 bg-neutral-50 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-900">
                        {entity.name}
                        {entity.discount && (
                          <span className="ml-2 text-xs font-medium text-emerald-600">
                            · Discount applied
                          </span>
                        )}
                      </p>

                      <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-600">
                        <Mail size={14} />
                        <span className="truncate">{entity.email}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-neutral-100 px-6 py-4">
          <button
            onClick={close}
            disabled={isInviting}
            className="
              rounded-md px-4 py-2 text-sm
              text-neutral-700
              hover:bg-neutral-100
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            onClick={onConfirmInvite}
            disabled={selectedEntity.length === 0 || isInviting}
            className="
              inline-flex min-w-[160px] items-center justify-center
              rounded-md bg-neutral-900 px-4 py-2
              text-sm font-medium text-white
              hover:bg-neutral-800
              disabled:bg-neutral-200 disabled:text-neutral-500
            "
          >
            {isInviting ? <LoadSmall /> : `Invite ${selectedEntity.length}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
