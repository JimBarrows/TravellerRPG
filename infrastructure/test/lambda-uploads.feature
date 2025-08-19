Feature: Infrastructure Lambda Test Mocking
  As a developer
  I want properly mocked AWS SDK services in tests
  So that tests can run without actual AWS resources

  Background:
    Given the infrastructure tests are configured
    And AWS SDK services need to be mocked
    And environment variables are properly set

  Scenario: Mock S3Client for presigned URL generation
    Given the S3Client is properly mocked
    When I run tests that generate presigned URLs
    Then the mocked S3Client should be used
    And no actual AWS API calls should be made
    And tests should pass without bucket name resolution errors

  Scenario: Mock PutObjectCommand correctly
    Given the PutObjectCommand constructor is mocked
    When the lambda creates a PutObjectCommand
    Then the mock should capture the command parameters
    And the mock should return a valid command object
    And getSignedUrl should work with the mocked command

  Scenario: Mock GetObjectCommand correctly
    Given the GetObjectCommand constructor is mocked
    When the lambda creates a GetObjectCommand
    Then the mock should capture the command parameters
    And the mock should return a valid command object
    And getSignedUrl should work with the mocked command

  Scenario: Handle environment variables in tests
    Given the test environment is set up
    When tests set UPLOADS_BUCKET_NAME environment variable
    Then the lambda should use the test bucket name
    And the mock should verify the correct bucket is used

  Scenario: Test coverage remains above 85%
    Given all tests are properly mocked
    When I run the full test suite
    Then all infrastructure tests should pass
    And test coverage should be 85% or higher
    And pre-commit hooks should succeed