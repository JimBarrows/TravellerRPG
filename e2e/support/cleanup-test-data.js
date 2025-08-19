#!/usr/bin/env node

/**
 * Test Data Cleanup Script
 * Cleans up test data created for E2E testing
 */

import { TestDataManager } from "./test-data-manager.js";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const API_URL = process.env.API_URL || "http://localhost:8080";
const MANIFEST_FILE = path.join(process.cwd(), "e2e-results", "test-data.json");

async function cleanupTestData() {
  console.log("🧹 Starting test data cleanup...");
  console.log(`API URL: ${API_URL}`);

  try {
    // Check if manifest file exists
    const manifestExists = await fs
      .access(MANIFEST_FILE)
      .then(() => true)
      .catch(() => false);

    if (!manifestExists) {
      console.log(
        "⚠️  No test data manifest found. Attempting general cleanup...",
      );
      await performGeneralCleanup();
      return;
    }

    // Read test data manifest
    const manifestContent = await fs.readFile(MANIFEST_FILE, "utf8");
    const manifest = JSON.parse(manifestContent);

    console.log(`📋 Found test data manifest from ${manifest.createdAt}`);
    console.log(
      `Users: ${manifest.users.players.length + 2} (admin, gm, players)`,
    );
    console.log(`Characters: ${manifest.characters.length}`);
    console.log(`Campaigns: ${manifest.campaigns.length}`);

    // Clean up using admin token for authorization
    const testDataManager = new TestDataManager(API_URL);

    if (manifest.users.admin && manifest.users.admin.token) {
      testDataManager.setAuthToken(manifest.users.admin.token);
    }

    // Import the test data for cleanup
    testDataManager.importTestData(manifest.summary);

    // Perform cleanup
    await testDataManager.cleanupTestData();

    // Remove manifest file
    await fs.unlink(MANIFEST_FILE);
    console.log("🗑️  Removed test data manifest");

    // Clean up screenshots and traces
    await cleanupTestArtifacts();

    console.log("✅ Test data cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Test data cleanup failed:", error.message);

    if (error.code === "ENOENT") {
      console.log("⚠️  Manifest file not found, attempting general cleanup...");
      await performGeneralCleanup();
    } else {
      console.error(error.stack);
      process.exit(1);
    }
  }
}

async function performGeneralCleanup() {
  console.log("🧹 Performing general test data cleanup...");

  try {
    const { default: axios } = await import("axios");

    // Check if API is available
    try {
      await axios.get(`${API_URL}/health`);
    } catch (error) {
      console.warn("⚠️  API is not available. Skipping API cleanup.");
      await cleanupTestArtifacts();
      return;
    }

    // Clean up test users by email pattern
    const testEmails = [
      "e2e-admin@traveller-rpg.test",
      "e2e-gm@traveller-rpg.test",
      "e2e-player1@traveller-rpg.test",
      "e2e-player2@traveller-rpg.test",
      "e2e-player3@traveller-rpg.test",
    ];

    console.log("🔍 Searching for test users...");

    for (const email of testEmails) {
      try {
        // Try to login and delete user
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
          email,
          password: "TestPass123!",
        });

        if (loginResponse.status === 200) {
          const token = loginResponse.data.token;

          // Delete user account
          await axios.delete(`${API_URL}/user/account`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          console.log(`🗑️  Deleted test user: ${email}`);
        }
      } catch (error) {
        // User might not exist or already deleted
        console.log(`ℹ️  Test user ${email} not found or already cleaned up`);
      }
    }

    // Clean up test artifacts
    await cleanupTestArtifacts();

    console.log("✅ General cleanup completed");
  } catch (error) {
    console.error("❌ General cleanup failed:", error.message);
    throw error;
  }
}

async function cleanupTestArtifacts() {
  console.log("🧹 Cleaning up test artifacts...");

  const artifactDirs = [
    "e2e-results/screenshots",
    "e2e-results/traces",
    "e2e-results/videos",
    "e2e-results/html-report",
  ];

  for (const dir of artifactDirs) {
    try {
      const dirExists = await fs
        .access(dir)
        .then(() => true)
        .catch(() => false);

      if (dirExists) {
        await fs.rm(dir, { recursive: true, force: true });
        console.log(`🗑️  Removed artifact directory: ${dir}`);
      }
    } catch (error) {
      console.warn(`⚠️  Failed to remove ${dir}:`, error.message);
    }
  }

  // Clean up individual result files
  const resultFiles = [
    "e2e-results/cucumber-report.json",
    "e2e-results/cucumber-report.html",
    "e2e-results/junit.xml",
    "e2e-results/results.json",
  ];

  for (const file of resultFiles) {
    try {
      const fileExists = await fs
        .access(file)
        .then(() => true)
        .catch(() => false);

      if (fileExists) {
        await fs.unlink(file);
        console.log(`🗑️  Removed result file: ${file}`);
      }
    } catch (error) {
      console.warn(`⚠️  Failed to remove ${file}:`, error.message);
    }
  }

  console.log("✅ Test artifacts cleanup completed");
}

async function performSelectiveCleanup(options = {}) {
  console.log("🎯 Performing selective cleanup...");

  const {
    users = false,
    characters = false,
    campaigns = false,
    artifacts = false,
  } = options;

  if (!users && !characters && !campaigns && !artifacts) {
    console.log("⚠️  No cleanup options specified");
    return;
  }

  try {
    const manifestExists = await fs
      .access(MANIFEST_FILE)
      .then(() => true)
      .catch(() => false);

    if (!manifestExists) {
      console.log("⚠️  No test data manifest found for selective cleanup");

      if (artifacts) {
        await cleanupTestArtifacts();
      }

      return;
    }

    const manifestContent = await fs.readFile(MANIFEST_FILE, "utf8");
    const manifest = JSON.parse(manifestContent);

    const testDataManager = new TestDataManager(API_URL);
    if (manifest.users.admin && manifest.users.admin.token) {
      testDataManager.setAuthToken(manifest.users.admin.token);
    }

    if (characters) {
      console.log("🗑️  Cleaning up characters...");
      testDataManager.createdData.characters = manifest.summary.characters;
      await testDataManager.cleanupCharacters();
    }

    if (campaigns) {
      console.log("🗑️  Cleaning up campaigns...");
      testDataManager.createdData.campaigns = manifest.summary.campaigns;
      await testDataManager.cleanupCampaigns();
    }

    if (users) {
      console.log("🗑️  Cleaning up users...");
      testDataManager.createdData.users = manifest.summary.users;
      await testDataManager.cleanupUsers();
    }

    if (artifacts) {
      await cleanupTestArtifacts();
    }

    // Update manifest to reflect what's been cleaned
    const updatedManifest = { ...manifest };
    if (characters) updatedManifest.characters = [];
    if (campaigns) updatedManifest.campaigns = [];
    if (users) {
      updatedManifest.users = { admin: null, gm: null, players: [] };
      // Remove manifest entirely if users are cleaned up
      await fs.unlink(MANIFEST_FILE);
      console.log("🗑️  Removed test data manifest");
    } else {
      await fs.writeFile(
        MANIFEST_FILE,
        JSON.stringify(updatedManifest, null, 2),
      );
      console.log("📝 Updated test data manifest");
    }

    console.log("✅ Selective cleanup completed");
  } catch (error) {
    console.error("❌ Selective cleanup failed:", error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    console.log(`
E2E Test Data Cleanup

Usage: node cleanup-test-data.js [options]

Options:
  --selective         Perform selective cleanup (combine with --users, --characters, etc.)
  --users             Clean up only users (requires --selective)
  --characters        Clean up only characters (requires --selective)
  --campaigns         Clean up only campaigns (requires --selective)
  --artifacts         Clean up only test artifacts (requires --selective)
  --force             Skip confirmation prompts
  --help              Show this help message

Environment Variables:
  API_URL            API base URL (default: http://localhost:8080)

Examples:
  node cleanup-test-data.js                    # Full cleanup
  node cleanup-test-data.js --selective --characters --artifacts
  node cleanup-test-data.js --force
`);
    process.exit(0);
  }

  // Confirmation prompt (unless --force is used)
  if (!args.includes("--force")) {
    console.log("⚠️  This will permanently delete test data. Continue? (y/N)");

    const readline = await import("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise((resolve) => {
      rl.question("> ", resolve);
    });

    rl.close();

    if (answer.toLowerCase() !== "y" && answer.toLowerCase() !== "yes") {
      console.log("❌ Cleanup cancelled");
      process.exit(0);
    }
  }

  if (args.includes("--selective")) {
    const options = {
      users: args.includes("--users"),
      characters: args.includes("--characters"),
      campaigns: args.includes("--campaigns"),
      artifacts: args.includes("--artifacts"),
    };

    await performSelectiveCleanup(options);
  } else {
    await cleanupTestData();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
