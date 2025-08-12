import React from 'react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';

export const TestRouter = ({ children, initialPath = '/' }) => {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      {children}
    </MemoryRouter>
  );
};