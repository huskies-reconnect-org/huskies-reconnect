"use client";

import { useState } from "react";
import { Button, CourseList, CourseRow, EmptyState, TextField } from "@/components/ui";
import { exampleCourses } from "../_data";

/** Reference for course search and join: a search field, results, and joined state. */
export function CourseSearchDemo() {
  const [query, setQuery] = useState("CS 35");
  const [joined, setJoined] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(exampleCourses.map((course, index) => [index, course.joined])),
  );
  const normalized = query.trim().toUpperCase();
  const results = exampleCourses
    .map((course, index) => ({ ...course, index }))
    .filter((course) => normalized.length > 0 && (course.code.startsWith(normalized) || course.details.includes(normalized)));

  return (
    <div className="flex max-w-3xl flex-col gap-5">
      <form role="search" onSubmit={(event) => event.preventDefault()}>
        <div className="flex flex-wrap items-end gap-3">
          <TextField
            label="Find a course"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-describedby="course-search-hint"
            className="min-w-0 flex-[1_1_18rem]"
          />
          <Button type="submit" size="lg">
            Search
          </Button>
        </div>
        <p id="course-search-hint" className="mt-1.5 text-small text-muted">
          Course code like CS 3500, or the 5-digit CRN from your schedule.
        </p>
      </form>
      {results.length > 0 ? (
        <CourseList label="Search results">
          {results.map((course) => (
            <CourseRow
              key={course.index}
              code={course.code}
              title={course.title}
              details={course.details}
              members={course.members}
              joined={joined[course.index]}
              onJoin={() => setJoined((value) => ({ ...value, [course.index]: true }))}
            />
          ))}
        </CourseList>
      ) : (
        <EmptyState title={normalized ? `No course matches ${normalized}` : "Search for a course"} headingLevel={3}>
          {normalized
            ? "Check the code or CRN on your class schedule. Courses show up here once the term's catalog loads."
            : "Type a course code or CRN to see its sections."}
        </EmptyState>
      )}
    </div>
  );
}
