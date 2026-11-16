import React from 'react';

/**
 * "6°" o "10°–11°" para títulos en letra pixel. El símbolo de grado de esa
 * fuente parece un "+", así que se dibuja aparte con la letra normal.
 */
export const GradeLabel: React.FC<{ grades: number[] }> = ({ grades }) => (
  <>
    {grades.map((n, i) => (
      <React.Fragment key={n}>
        {i > 0 && <span className="grade-label__dash">–</span>}
        {n}
        <span className="grade-label__deg">°</span>
      </React.Fragment>
    ))}
  </>
);
