import { Button } from "@mantine/core";
import Link from "next/link";
import React from "react";
import Editorials from "../../components/Editorials";
import EditorialForm from "./EditorialForm";
import { EditorialSchemaTypes } from "@omenai/shared-types";

export default function AddEditorialWrapper() {
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-fluid-lg font-semibold">Upload an Editorial</h1>
      </div>
      <div className="">
        <EditorialForm />
      </div>
    </div>
  );
}
