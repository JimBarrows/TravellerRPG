import { handler } from "../lambda/uploads/index";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

// Mock AWS SDK
jest.mock("@aws-sdk/client-s3");
jest.mock("@aws-sdk/s3-request-presigner");
jest.mock("uuid");

const mockGetSignedUrl = jest.fn();
jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: (...args: any[]) => mockGetSignedUrl(...args),
}));

const mockUuidv4 = jest.fn();
jest.mock("uuid", () => ({
  v4: () => mockUuidv4(),
}));

describe("Uploads Lambda Handler", () => {
  let mockEvent: APIGatewayProxyEvent;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock returns
    mockUuidv4.mockReturnValue("test-uuid-123");
    mockGetSignedUrl.mockResolvedValue("https://presigned.url/test");

    // Mock environment variables
    process.env.UPLOADS_BUCKET_NAME = "test-uploads-bucket";
    process.env.ALLOWED_ORIGINS =
      "http://localhost:5173,https://traveller-rpg.com";

    // Base event structure
    mockEvent = {
      httpMethod: "POST",
      path: "/uploads",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:5173",
      },
      queryStringParameters: null,
      pathParameters: null,
      body: null,
      isBase64Encoded: false,
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {
        accountId: "123456789012",
        apiId: "test-api",
        resourceId: "abc123",
        resourcePath: "/uploads",
        protocol: "HTTP/1.1",
        httpMethod: "POST",
        path: "/uploads",
        stage: "test",
        requestId: "test-request",
        requestTime: "09/Apr/2015:12:34:56 +0000",
        requestTimeEpoch: 1428582896000,
        identity: {
          accessKey: null,
          accountId: null,
          apiKey: null,
          apiKeyId: null,
          caller: null,
          cognitoAuthenticationProvider: null,
          cognitoAuthenticationType: null,
          cognitoIdentityId: null,
          cognitoIdentityPoolId: null,
          principalOrgId: null,
          sourceIp: "127.0.0.1",
          user: null,
          userAgent: "Custom User Agent String",
          userArn: null,
          clientCert: null,
        },
        authorizer: null,
        domainName: "test-domain",
        domainPrefix: "test",
      },
      resource: "/uploads",
    };
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.UPLOADS_BUCKET_NAME;
    delete process.env.ALLOWED_ORIGINS;
  });

  describe("CORS Handling", () => {
    test("should handle OPTIONS preflight request", async () => {
      mockEvent.httpMethod = "OPTIONS";

      const result = (await handler(
        mockEvent,
        {} as any,
        {} as any,
      )) as APIGatewayProxyResult;

      expect(result.statusCode).toBe(200);
      expect(result.headers).toEqual({
        "Access-Control-Allow-Origin":
          "http://localhost:5173,https://traveller-rpg.com",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      });
      expect(result.body).toBe("");
    });

    test("should include CORS headers in all responses", async () => {
      mockEvent.body = JSON.stringify({
        fileName: "test.jpg",
        fileType: "image/jpeg",
        fileSize: 1024,
        userId: "user-123",
      });

      const result = (await handler(
        mockEvent,
        {} as any,
        {} as any,
      )) as APIGatewayProxyResult;

      expect(result.headers).toHaveProperty("Access-Control-Allow-Origin");
      expect(result.headers).toHaveProperty("Access-Control-Allow-Headers");
      expect(result.headers).toHaveProperty("Access-Control-Allow-Methods");
    });
  });

  describe("File Validation", () => {
    test("should reject unsupported file types", async () => {
      mockEvent.body = JSON.stringify({
        fileName: "test.pdf",
        fileType: "application/pdf",
        fileSize: 1024,
        userId: "user-123",
      });

      const result = (await handler(
        mockEvent,
        {} as any,
        {} as any,
      )) as APIGatewayProxyResult;

      expect(result.statusCode).toBe(400);
      const responseBody = JSON.parse(result.body);
      expect(responseBody.error).toContain("Invalid file type");
    });

    test("should accept valid image file types", async () => {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

      for (const fileType of validTypes) {
        mockEvent.body = JSON.stringify({
          fileName: "test.jpg",
          fileType,
          fileSize: 1024,
          userId: "user-123",
        });

        const result = (await handler(
          mockEvent,
          {} as any,
          {} as any,
        )) as APIGatewayProxyResult;
        expect(result.statusCode).toBe(200);
      }
    });

    test("should reject files exceeding size limit", async () => {
      mockEvent.body = JSON.stringify({
        fileName: "large-file.jpg",
        fileType: "image/jpeg",
        fileSize: 6 * 1024 * 1024, // 6MB (exceeds 5MB limit)
        userId: "user-123",
      });

      const result = (await handler(
        mockEvent,
        {} as any,
        {} as any,
      )) as APIGatewayProxyResult;

      expect(result.statusCode).toBe(400);
      const responseBody = JSON.parse(result.body);
      expect(responseBody.error).toContain("File size exceeds maximum");
    });

    test("should accept files within size limit", async () => {
      mockEvent.body = JSON.stringify({
        fileName: "small-file.jpg",
        fileType: "image/jpeg",
        fileSize: 1024, // 1KB
        userId: "user-123",
      });

      const result = (await handler(
        mockEvent,
        {} as any,
        {} as any,
      )) as APIGatewayProxyResult;
      expect(result.statusCode).toBe(200);
    });
  });

  describe("File Key Generation", () => {
    test("should generate user upload key when no characterId provided", async () => {
      mockEvent.body = JSON.stringify({
        fileName: "profile.jpg",
        fileType: "image/jpeg",
        fileSize: 1024,
        userId: "user-123",
      });

      await handler(mockEvent, {} as any, {} as any);

      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          Key: expect.stringMatching(
            /^users\/user-123\/uploads\/\d+-test-uuid-123\.jpg$/,
          ),
        }),
        expect.any(Object),
      );
    });

    test("should generate character portrait key when characterId provided", async () => {
      mockEvent.body = JSON.stringify({
        fileName: "character.png",
        fileType: "image/png",
        fileSize: 1024,
        userId: "user-123",
        characterId: "char-456",
      });

      await handler(mockEvent, {} as any, {} as any);

      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          Key: expect.stringMatching(
            /^characters\/char-456\/portraits\/\d+-test-uuid-123\.png$/,
          ),
        }),
        expect.any(Object),
      );
    });

    test("should handle missing file extension", async () => {
      mockEvent.body = JSON.stringify({
        fileName: "noextension",
        fileType: "image/jpeg",
        fileSize: 1024,
        userId: "user-123",
      });

      await handler(mockEvent, {} as any, {} as any);

      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          Key: expect.stringMatching(/undefined$/),
        }),
        expect.any(Object),
      );
    });
  });

  describe("S3 Integration", () => {
    test("should create PUT and GET presigned URLs", async () => {
      mockEvent.body = JSON.stringify({
        fileName: "test.jpg",
        fileType: "image/jpeg",
        fileSize: 1024,
        userId: "user-123",
      });

      const result = (await handler(
        mockEvent,
        {} as any,
        {} as any,
      )) as APIGatewayProxyResult;

      expect(result.statusCode).toBe(200);
      expect(mockGetSignedUrl).toHaveBeenCalledTimes(2);

      // Should create PutObjectCommand and GetObjectCommand
      const putCall = mockGetSignedUrl.mock.calls.find(
        (call) => call[1] instanceof PutObjectCommand,
      );
      const getCall = mockGetSignedUrl.mock.calls.find(
        (call) => call[1] instanceof GetObjectCommand,
      );

      expect(putCall).toBeDefined();
      expect(getCall).toBeDefined();
    });

    test("should set correct metadata on upload", async () => {
      mockEvent.body = JSON.stringify({
        fileName: "test.jpg",
        fileType: "image/jpeg",
        fileSize: 1024,
        userId: "user-123",
        characterId: "char-456",
      });

      await handler(mockEvent, {} as any, {} as any);

      const putCall = mockGetSignedUrl.mock.calls.find(
        (call) => call[1] instanceof PutObjectCommand,
      );

      expect(putCall[1].input.Metadata).toEqual({
        userId: "user-123",
        characterId: "char-456",
        originalName: "test.jpg",
        uploadTimestamp: expect.any(String),
      });
    });

    test("should return presigned URLs and metadata", async () => {
      mockEvent.body = JSON.stringify({
        fileName: "test.jpg",
        fileType: "image/jpeg",
        fileSize: 1024,
        userId: "user-123",
      });

      const result = (await handler(
        mockEvent,
        {} as any,
        {} as any,
      )) as APIGatewayProxyResult;

      expect(result.statusCode).toBe(200);
      const responseBody = JSON.parse(result.body);

      expect(responseBody).toHaveProperty(
        "uploadUrl",
        "https://presigned.url/test",
      );
      expect(responseBody).toHaveProperty(
        "viewUrl",
        "https://presigned.url/test",
      );
      expect(responseBody).toHaveProperty("fileKey");
      expect(responseBody).toHaveProperty("expiresIn", 3600);
    });
  });

  describe("Error Handling", () => {
    test("should handle malformed JSON request body", async () => {
      mockEvent.body = "invalid json {";

      const result = (await handler(
        mockEvent,
        {} as any,
        {} as any,
      )) as APIGatewayProxyResult;

      expect(result.statusCode).toBe(500);
      const responseBody = JSON.parse(result.body);
      expect(responseBody.error).toBe("Failed to generate presigned URL");
    });

    test("should handle S3 errors", async () => {
      mockGetSignedUrl.mockRejectedValueOnce(new Error("S3 Error"));

      mockEvent.body = JSON.stringify({
        fileName: "test.jpg",
        fileType: "image/jpeg",
        fileSize: 1024,
        userId: "user-123",
      });

      const result = (await handler(
        mockEvent,
        {} as any,
        {} as any,
      )) as APIGatewayProxyResult;

      expect(result.statusCode).toBe(500);
      const responseBody = JSON.parse(result.body);
      expect(responseBody.error).toBe("Failed to generate presigned URL");
    });

    test("should handle missing request body", async () => {
      mockEvent.body = null;

      const result = (await handler(
        mockEvent,
        {} as any,
        {} as any,
      )) as APIGatewayProxyResult;

      expect(result.statusCode).toBe(400);
    });
  });

  describe("User Authentication", () => {
    test("should default to anonymous when no userId provided", async () => {
      mockEvent.body = JSON.stringify({
        fileName: "test.jpg",
        fileType: "image/jpeg",
        fileSize: 1024,
        // userId not provided
      });

      await handler(mockEvent, {} as any, {} as any);

      expect(mockGetSignedUrl).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          Key: expect.stringContaining("users/anonymous/uploads/"),
        }),
        expect.any(Object),
      );
    });
  });
});
