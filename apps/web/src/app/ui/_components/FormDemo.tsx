"use client";

import { useState } from "react";
import { Button, ChipToggle, IndexCard, Notice, SelectField, TextAreaField, TextField } from "@/components/ui";
import { exampleInterests } from "../_data";

/** Reference for form fields, using the profile form as the example. */
export function FormDemo() {
  const [email, setEmail] = useState("jordan@gmail.com");
  const [saved, setSaved] = useState(false);
  const emailError = email.trim().toLowerCase().endsWith("@northeastern.edu")
    ? undefined
    : "Use your @northeastern.edu address. Other emails can't join.";

  return (
    <div className="flex flex-wrap items-start gap-8">
      <IndexCard as="form" className="flex max-w-xl flex-[1_1_22rem] flex-col gap-5" aria-label="Example profile form">
        <TextField
          label="Northeastern email"
          type="email"
          autoComplete="email"
          placeholder="you@northeastern.edu"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={emailError}
        />
        <SelectField label="Major" defaultValue="cs-design">
          <option value="cs">Computer Science</option>
          <option value="cs-design">Computer Science and Design</option>
          <option value="ds">Data Science</option>
          <option value="ce">Computer Engineering</option>
        </SelectField>
        <SelectField label="Year" defaultValue="3" hint="Used to suggest people at a similar point in school.">
          <option value="1">1st year</option>
          <option value="2">2nd year</option>
          <option value="3">3rd year</option>
          <option value="4">4th year</option>
          <option value="5">5th year</option>
        </SelectField>
        <fieldset>
          <legend className="font-bold">Interests</legend>
          <p className="mt-1 text-small text-muted">Pick a few. Classmates only see the ones you share.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {exampleInterests.map((interest, index) => (
              <ChipToggle key={interest} name="interests" value={interest} defaultChecked={index === 0 || index === 2}>
                {interest}
              </ChipToggle>
            ))}
          </div>
        </fieldset>
        <TextAreaField
          label="Goals this year"
          hint="A sentence or two, like a co-op you're aiming for or a project you want help with."
          defaultValue="Land a product design co-op for spring and find people to swap portfolio feedback with."
          rows={3}
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setSaved(true)}>Save profile</Button>
          <Button variant="quiet" onClick={() => setSaved(false)}>
            Cancel
          </Button>
        </div>
        {saved ? <Notice tone="success" title="Profile saved">Next week&apos;s cards will use these answers.</Notice> : null}
      </IndexCard>
    </div>
  );
}
