import { Given, When, Then } from "@cucumber/cucumber";

let testEnvironment = false;
let _testRun = false;
let testResult = false;

Given("I have a working test environment", function () {
  testEnvironment = true;
});

When("I run a simple test", function () {
  _testRun = true;
  testResult = testEnvironment;
});

Then("the test should pass", function () {
  if (!testResult) {
    throw new Error("Test failed");
  }
});
