"use client";
import React, { ChangeEvent, FormEvent, useState } from "react";
import Form from "./Form";
import { calculateArtistRating } from "@omenai/shared-lib/algorithms/artistCategorization";
import {
  ArtistCategorizationAnswerTypes,
  ArtistCategorizationAlgorithmResult,
} from "@omenai/shared-types";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";

const form_questions = [
  {
    type: "select",
    label: "Are you a Graduate",
    options: ["Yes", "No"],
    name: "graduate",
  },
  {
    type: "select",
    label: "Do you have a Masters in Fine Arts (MFA)",
    options: ["Yes", "No"],
    name: "mfa",
  },
  {
    type: "number",
    label: "How many solo exhibitions have you had?",
    name: "solo",
  },
  {
    type: "number",
    label: "How many group exhibitions have you had?",
    name: "group",
  },
  {
    type: "select",
    label: "Which Biennale have you been a part of?",
    options: ["Venice", "Other", "None"],
    name: "biennale",
  },
  {
    type: "select",
    label: "Has your piece been featured in a museum exhibition?",
    options: ["Yes", "No"],
    name: "museum_exhibition",
  },
  {
    type: "select",
    label: "Have you been featured in an art fair by a gallery?",
    options: ["Yes", "No"],
    name: "art_fair",
  },
  {
    type: "select",
    label: "Is your work in any museum collections?",
    options: ["Yes", "No"],
    name: "museum_collection",
  },
];

export default function AlgorithmTest() {
  const [form_data, set_form_data] =
    useState<ArtistCategorizationAnswerTypes>();

  const [result, setResult] = useState<ArtistCategorizationAlgorithmResult>();
  const handleChange = (
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    let value: number | string = e.target.value;
    const name = e.target.name;

    if (name === "solo" || name === "group") {
      value = Number(value);
    } else {
      value = value.toLowerCase();
    }

    set_form_data(
      (prev) => ({ ...prev, [name]: value }) as ArtistCategorizationAnswerTypes
    );
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(form_data);

    const result: ArtistCategorizationAlgorithmResult = calculateArtistRating(
      form_data as ArtistCategorizationAnswerTypes
    );

    setResult(result);
  };

  return (
    <>
      <DesktopNavbar />
      <div className="w-full h-[90vh] grid place-items-center">
        <form
          className="container w-full grid grid-cols-4 gap-4 ring-1 ring-dark/10 p-4 rounded-lg"
          onSubmit={handleSubmit}
        >
          {form_questions.map((form: any) => {
            return (
              <Form
                key={form.name}
                type_input={form.type}
                label={form.label}
                options={form.options}
                name={form.name}
                onchange={handleChange}
              />
            );
          })}

          <div className="flex flex-col gap-y-5">
            <div className="w-full flex justify-center">
              <button
                type="submit"
                className="bg-dark hover:bg-dark/80 disabled:cursor-not-allowed text-white focus:ring ring-1 border-0 ring-dark/20 focus:ring-white duration-300 outline-none focus:outline-none disabled:bg-dark/10 disabled:text-white rounded-xl h-[35px] p-5 w-full text-center text-fluid-xs flex items-center justify-center hover:ring-white cursor-pointer"
              >
                Run Algorithm
              </button>
            </div>

            <div className="w-full">
              {result && result.status !== "error" && (
                <div className="bg-dark/10 p-8 rounded-lg">
                  <h1 className="text-fluid-xxs font-bold mb-4">
                    Algorithm Result
                  </h1>
                  <p className="text-fluid-xxs">
                    Points earned:{" "}
                    <span className="font-bold">{result.totalPoints}/200</span>
                  </p>
                  <p className="text-fluid-xxs">
                    Artist category:{" "}
                    <span className="font-bold">{result.rating}</span>{" "}
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
