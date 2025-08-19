/**
 * App Component Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App.jsx";

describe("App", () => {
  beforeEach(() => {
    // Clear any previous renders
    document.body.innerHTML = "";
  });

  describe("rendering", () => {
    it("should render the App component without crashing", () => {
      render(<App />);

      expect(screen.getByText("Vite + React")).toBeInTheDocument();
    });

    it("should render Vite logo with correct attributes", () => {
      render(<App />);

      const viteLogo = screen.getByAltText("Vite logo");
      expect(viteLogo).toBeInTheDocument();
      expect(viteLogo).toHaveAttribute("src", "/vite.svg");
      expect(viteLogo).toHaveClass("logo");
    });

    it("should render React logo with correct attributes", () => {
      render(<App />);

      const reactLogo = screen.getByAltText("React logo");
      expect(reactLogo).toBeInTheDocument();
      expect(reactLogo).toHaveAttribute("src", "/src/assets/react.svg");
      expect(reactLogo).toHaveClass("logo", "react");
    });

    it("should render logo links with correct hrefs", () => {
      render(<App />);

      const viteLink = screen.getByRole("link", { name: /vite logo/i });
      const reactLink = screen.getByRole("link", { name: /react logo/i });

      expect(viteLink).toHaveAttribute("href", "https://vite.dev");
      expect(viteLink).toHaveAttribute("target", "_blank");

      expect(reactLink).toHaveAttribute("href", "https://react.dev");
      expect(reactLink).toHaveAttribute("target", "_blank");
    });

    it("should render the main heading", () => {
      render(<App />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Vite + React");
    });

    it("should render the counter button with initial count of 0", () => {
      render(<App />);

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("count is 0");
    });

    it("should render the HMR instruction text", () => {
      render(<App />);

      const hmrText = screen.getByText(
        /Edit.*src\/App\.jsx.*and save to test HMR/,
      );
      expect(hmrText).toBeInTheDocument();

      const codeElement = screen.getByText("src/App.jsx");
      expect(codeElement.tagName).toBe("CODE");
    });

    it("should render the documentation text", () => {
      render(<App />);

      const docText = screen.getByText(
        "Click on the Vite and React logos to learn more",
      );
      expect(docText).toBeInTheDocument();
      expect(docText).toHaveClass("read-the-docs");
    });
  });

  describe("counter functionality", () => {
    it("should increment count when button is clicked", () => {
      render(<App />);

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("count is 0");

      fireEvent.click(button);
      expect(button).toHaveTextContent("count is 1");

      fireEvent.click(button);
      expect(button).toHaveTextContent("count is 2");
    });

    it("should handle multiple rapid clicks", () => {
      render(<App />);

      const button = screen.getByRole("button");

      // Click multiple times
      for (let i = 0; i < 5; i++) {
        fireEvent.click(button);
      }

      expect(button).toHaveTextContent("count is 5");
    });

    it("should maintain separate count state for multiple App instances", () => {
      const { unmount } = render(<App />);
      const button1 = screen.getByRole("button");

      fireEvent.click(button1);
      expect(button1).toHaveTextContent("count is 1");

      unmount();

      render(<App />);
      const button2 = screen.getByRole("button");
      expect(button2).toHaveTextContent("count is 0"); // New instance should start at 0
    });
  });

  describe("component structure", () => {
    it("should have correct DOM structure", () => {
      const { container } = render(<App />);

      // Check for main wrapper fragment
      const mainDiv = container.querySelector("div");
      expect(mainDiv).toBeInTheDocument();

      // Check for card wrapper
      const cardDiv = screen.getByText("count is 0").closest(".card");
      expect(cardDiv).toBeInTheDocument();
      expect(cardDiv).toHaveClass("card");
    });

    it("should render all expected elements", () => {
      render(<App />);

      // Count all major elements
      expect(screen.getAllByRole("link")).toHaveLength(2); // Vite and React links
      expect(screen.getAllByRole("img")).toHaveLength(2); // Vite and React logos
      expect(screen.getAllByRole("heading")).toHaveLength(1); // Main heading
      expect(screen.getAllByRole("button")).toHaveLength(1); // Counter button
    });
  });

  describe("accessibility", () => {
    it("should have accessible link targets", () => {
      render(<App />);

      const viteLink = screen.getByRole("link", { name: /vite logo/i });
      const reactLink = screen.getByRole("link", { name: /react logo/i });

      // Both links should open in new tab for security
      expect(viteLink).toHaveAttribute("target", "_blank");
      expect(reactLink).toHaveAttribute("target", "_blank");
    });

    it("should have accessible button text", () => {
      render(<App />);

      const button = screen.getByRole("button");
      expect(button).toHaveAccessibleName(/count is \d+/);
    });

    it("should have proper heading hierarchy", () => {
      render(<App />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();

      // Should not have any other headings to maintain proper hierarchy
      const allHeadings = screen.getAllByRole("heading");
      expect(allHeadings).toHaveLength(1);
    });

    it("should have accessible image alt texts", () => {
      render(<App />);

      const viteImg = screen.getByAltText("Vite logo");
      const reactImg = screen.getByAltText("React logo");

      expect(viteImg).toBeInTheDocument();
      expect(reactImg).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("should handle button clicks when count reaches high numbers", () => {
      render(<App />);

      const button = screen.getByRole("button");

      // Click many times to test large numbers
      for (let i = 0; i < 100; i++) {
        fireEvent.click(button);
      }

      expect(button).toHaveTextContent("count is 100");
    });

    it("should render consistently across multiple renders", () => {
      const { unmount, rerender } = render(<App />);

      const initialText = screen.getByText("Vite + React").textContent;
      const initialButton = screen.getByRole("button").textContent;

      rerender(<App />);

      expect(screen.getByText("Vite + React")).toHaveTextContent(initialText);
      expect(screen.getByRole("button")).toHaveTextContent(initialButton);
    });
  });
});
