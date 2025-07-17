"use client";
import { Button } from "@mantine/core";
import React from "react";
import Editorials from "./components/Editorials";
import Link from "next/link";
export default function EditorialWrapper() {
  return (
    <div className="flex flex-col space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-fluid-lg font-semibold">Your Editorials</h1>
        <Link href={"/admin/editorials/add"}>
          <Button
            variant="filled"
            color="#1a1a1a"
            className="ring-1 ring-dark border-0"
          >
            Add an editorial piece
          </Button>
        </Link>
      </div>
      <Editorials />
    </div>
  );
}
