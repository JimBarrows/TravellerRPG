import React from 'react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';

export const TestRouter = ({ children, initialEntries = ['/'] }) => {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      {children}
    </MemoryRouter>
  );
};

export default TestRouter;