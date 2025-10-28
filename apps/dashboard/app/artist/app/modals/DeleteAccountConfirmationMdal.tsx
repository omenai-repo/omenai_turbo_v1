"use client";
import DeleteAccountConfirmationModalForm from "./DeleteAccountConfirmationModalForm";
import { artistActionStore } from "@omenai/shared-state-store/src/artist/actions/ActionStore";

export const DeleteAccountConfirmationModal = () => {
  const { updateDeleteArtistAccountModalPopup, deleteArtistAccountModalPopup } =
    artistActionStore();

  return (
    <>
      {deleteArtistAccountModalPopup && (
        <div
          onClick={() => {
            updateDeleteArtistAccountModalPopup(false);
          }}
          className="bg-slate-900/20 backdrop-blur py-8 px-2 fixed inset-0 z-50 grid place-items-center cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white text-dark p-6 rounded w-full max-w-3xl shadow-xl cursor-default relative h-auto"
          >
            {/* Add modal form here */}
            <div className="h-auto w-full">
              <DeleteAccountConfirmationModalForm />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
