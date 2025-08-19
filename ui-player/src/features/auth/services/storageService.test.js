/**
 * StorageService Tests
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("StorageService", () => {
  let storageService, uploadData, remove, getUrl;

  beforeEach(async () => {
    // Clear all mocks
    vi.clearAllMocks();

    // Mock environment variable
    vi.stubEnv("VITE_STORAGE_BASE_URL", "https://test-storage-api.com/storage");

    // Re-import the module to get fresh instances with mocked env
    const module = await import("./storageService.js?t=" + Date.now());
    storageService = module.default;
    uploadData = module.uploadData;
    remove = module.remove;
    getUrl = module.getUrl;
  });

  describe("constructor", () => {
    it("should initialize with default base URL when env var is not set", async () => {
      vi.unstubAllEnvs();
      delete process.env.VITE_STORAGE_BASE_URL;
      const module = await import("./storageService.js?t=" + Date.now());
      expect(module.default.baseUrl).toBe("https://api.example.com/storage");
    });

    it("should initialize with custom base URL from environment", () => {
      expect(storageService.baseUrl).toBe(
        "https://test-storage-api.com/storage",
      );
    });
  });

  describe("uploadData", () => {
    it("should upload data successfully", async () => {
      const mockFile = new File(["test content"], "test.txt", {
        type: "text/plain",
      });
      const uploadOptions = {
        key: "test-file.txt",
        data: mockFile,
        options: { contentType: "text/plain" },
      };

      const result = await storageService.uploadData(uploadOptions);

      expect(result).toEqual({
        key: "test-file.txt",
      });
    });

    it("should handle upload with minimal options", async () => {
      const mockFile = new File(["test"], "minimal.txt", {
        type: "text/plain",
      });
      const uploadOptions = {
        key: "minimal-file.txt",
        data: mockFile,
      };

      const result = await storageService.uploadData(uploadOptions);

      expect(result).toEqual({
        key: "minimal-file.txt",
      });
    });

    it("should handle upload with Blob data", async () => {
      const mockBlob = new Blob(["blob content"], { type: "text/plain" });
      const uploadOptions = {
        key: "blob-file.txt",
        data: mockBlob,
        options: { metadata: { userId: "123" } },
      };

      const result = await storageService.uploadData(uploadOptions);

      expect(result).toEqual({
        key: "blob-file.txt",
      });
    });

    it("should throw error when upload fails", async () => {
      // Mock FormData constructor to throw
      const originalFormData = global.FormData;
      global.FormData = vi.fn().mockImplementation(() => {
        throw new Error("FormData creation failed");
      });

      const mockFile = new File(["test"], "error.txt", { type: "text/plain" });
      const uploadOptions = {
        key: "error-file.txt",
        data: mockFile,
      };

      await expect(storageService.uploadData(uploadOptions)).rejects.toThrow(
        "Upload failed: FormData creation failed",
      );

      // Restore FormData
      global.FormData = originalFormData;
    });

    it("should handle different file types", async () => {
      const imageFile = new File(["image data"], "test.png", {
        type: "image/png",
      });
      const uploadOptions = {
        key: "images/test.png",
        data: imageFile,
        options: { publicRead: true },
      };

      const result = await storageService.uploadData(uploadOptions);

      expect(result).toEqual({
        key: "images/test.png",
      });
    });
  });

  describe("remove", () => {
    it("should remove file successfully", async () => {
      const removeOptions = {
        key: "file-to-remove.txt",
      };

      // Should not throw
      await expect(
        storageService.remove(removeOptions),
      ).resolves.toBeUndefined();
    });

    it("should handle remove with nested path", async () => {
      const removeOptions = {
        key: "folder/subfolder/file.pdf",
      };

      await expect(
        storageService.remove(removeOptions),
      ).resolves.toBeUndefined();
    });

    it("should throw error when remove fails", async () => {
      // Mock setTimeout to throw
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = vi.fn().mockImplementation(() => {
        throw new Error("Timeout failed");
      });

      const removeOptions = {
        key: "error-file.txt",
      };

      await expect(storageService.remove(removeOptions)).rejects.toThrow(
        "Remove failed: Timeout failed",
      );

      // Restore setTimeout
      global.setTimeout = originalSetTimeout;
    });
  });

  describe("getUrl", () => {
    it("should generate URL successfully", async () => {
      const urlOptions = {
        key: "test-file.txt",
      };

      const result = await storageService.getUrl(urlOptions);

      expect(result).toEqual({
        url: "https://test-storage-api.com/storage/test-file.txt",
      });
    });

    it("should handle nested file paths", async () => {
      const urlOptions = {
        key: "folder/subfolder/document.pdf",
      };

      const result = await storageService.getUrl(urlOptions);

      expect(result).toEqual({
        url: "https://test-storage-api.com/storage/folder/subfolder/document.pdf",
      });
    });

    it("should handle URLs with special characters", async () => {
      const urlOptions = {
        key: "files/test file with spaces.txt",
      };

      const result = await storageService.getUrl(urlOptions);

      expect(result).toEqual({
        url: "https://test-storage-api.com/storage/files/test file with spaces.txt",
      });
    });

    it("should throw error when URL generation fails", async () => {
      // Mock string template to throw
      const originalBaseUrl = storageService.baseUrl;
      Object.defineProperty(storageService, "baseUrl", {
        get: () => {
          throw new Error("URL construction failed");
        },
      });

      const urlOptions = {
        key: "error-file.txt",
      };

      await expect(storageService.getUrl(urlOptions)).rejects.toThrow(
        "Get URL failed: URL construction failed",
      );

      // Restore baseUrl
      Object.defineProperty(storageService, "baseUrl", {
        value: originalBaseUrl,
        writable: true,
      });
    });
  });

  describe("exported functions", () => {
    it("should export uploadData function bound to singleton", async () => {
      const mockFile = new File(["test"], "export-test.txt", {
        type: "text/plain",
      });
      const result = await uploadData({
        key: "export-test.txt",
        data: mockFile,
      });

      expect(result).toEqual({
        key: "export-test.txt",
      });
    });

    it("should export remove function bound to singleton", async () => {
      await expect(remove({ key: "test-file.txt" })).resolves.toBeUndefined();
    });

    it("should export getUrl function bound to singleton", async () => {
      const result = await getUrl({ key: "export-url-test.txt" });

      expect(result).toEqual({
        url: "https://test-storage-api.com/storage/export-url-test.txt",
      });
    });
  });

  describe("edge cases", () => {
    it("should handle empty key", async () => {
      const result = await storageService.getUrl({ key: "" });
      expect(result.url).toBe("https://test-storage-api.com/storage/");
    });

    it("should handle key with only slashes", async () => {
      const result = await storageService.getUrl({ key: "///" });
      expect(result.url).toBe("https://test-storage-api.com/storage////");
    });

    it("should handle very long key names", async () => {
      const longKey = "a".repeat(1000);
      const result = await storageService.getUrl({ key: longKey });
      expect(result.url).toBe(
        `https://test-storage-api.com/storage/${longKey}`,
      );
    });
  });
});
