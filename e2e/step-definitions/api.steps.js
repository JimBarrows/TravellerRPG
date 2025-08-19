import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

// API availability steps
Given("the GraphQL API is running", async function () {
  const response = await this.page.request.post(
    `${this.config.apiURL}/graphql`,
    {
      data: {
        query: `
        query HealthCheck {
          __schema {
            queryType {
              name
            }
          }
        }
      `,
      },
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  expect(response.status()).toBe(200);
  this.storeTestData("graphqlAvailable", true);
});

Given("I have a valid authentication token", async function () {
  // Use existing token or create new one
  let token = this.getTestData("authToken");

  if (!token) {
    // Create test user and get token
    const testUser = this.generateTestUser();

    // Register and verify user
    const registrationResponse = await this.page.request.post(
      `${this.config.apiURL}/auth/register`,
      {
        data: {
          email: testUser.email,
          password: testUser.password,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          username: testUser.username,
        },
      },
    );

    const registrationData = await registrationResponse.json();

    await this.page.request.post(`${this.config.apiURL}/auth/verify`, {
      data: { token: registrationData.verificationToken },
    });

    // Login to get auth token
    const loginResponse = await this.page.request.post(
      `${this.config.apiURL}/auth/login`,
      {
        data: {
          email: testUser.email,
          password: testUser.password,
        },
      },
    );

    const loginData = await loginResponse.json();
    token = loginData.token;

    this.storeTestData("authToken", token);
    this.storeTestData("currentUser", testUser);
  }
});

// Character data setup
Given("I have a character in the system", async function () {
  const token = this.getTestData("authToken");
  const characterData = this.generateTestCharacter();

  const mutation = `
    mutation CreateCharacter($input: CharacterInput!) {
      createCharacter(input: $input) {
        id
        name
        age
        gender
        race {
          type
        }
        characteristics {
          type
          value
        }
      }
    }
  `;

  const response = await this.page.request.post(
    `${this.config.apiURL}/graphql`,
    {
      data: {
        query: mutation,
        variables: {
          input: {
            name: characterData.name,
            gender: characterData.gender,
            raceId: "1", // Assuming Human race has ID 1
          },
        },
      },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  expect(response.status()).toBe(200);

  const responseData = await response.json();
  expect(responseData.data.createCharacter).toBeTruthy();

  this.storeTestData("testCharacter", responseData.data.createCharacter);
});

// GraphQL query execution
When("I execute a GraphQL query for character data", async function () {
  const token = this.getTestData("authToken");
  const character = this.getTestData("testCharacter");

  const query = `
    query GetCharacter($id: ID!) {
      character(id: $id) {
        id
        name
        age
        gender
        race {
          type
          description
        }
        characteristics {
          type
          value
          originalValue
        }
        skills {
          id
          name
          level
          category
        }
        careerHistory {
          id
          career {
            name
            description
          }
          rank
          survived
        }
      }
    }
  `;

  const response = await this.page.request.post(
    `${this.config.apiURL}/graphql`,
    {
      data: {
        query,
        variables: {
          id: character.id,
        },
      },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  this.storeTestData("graphqlQueryResponse", response);
});

// Response validation
Then("the API should return complete character information", async function () {
  const response = this.getTestData("graphqlQueryResponse");
  expect(response.status()).toBe(200);

  const responseData = await response.json();
  expect(responseData.errors).toBeFalsy();
  expect(responseData.data).toBeTruthy();
  expect(responseData.data.character).toBeTruthy();

  const character = responseData.data.character;
  expect(character).toHaveProperty("id");
  expect(character).toHaveProperty("name");
  expect(character).toHaveProperty("age");
  expect(character).toHaveProperty("characteristics");

  this.storeTestData("retrievedCharacter", character);
});

Then("all relationships should be properly resolved", async function () {
  const character = this.getTestData("retrievedCharacter");

  // Verify race relationship
  expect(character.race).toBeTruthy();
  expect(character.race).toHaveProperty("type");

  // Verify characteristics are resolved
  expect(character.characteristics).toBeTruthy();
  expect(Array.isArray(character.characteristics)).toBe(true);

  // Check that we have all six characteristics
  const characteristicTypes = character.characteristics.map((c) => c.type);
  const expectedTypes = [
    "STRENGTH",
    "DEXTERITY",
    "ENDURANCE",
    "INTELLIGENCE",
    "EDUCATION",
    "SOCIAL_STANDING",
  ];

  for (const expectedType of expectedTypes) {
    expect(characteristicTypes).toContain(expectedType);
  }
});

Then("the response should match the GraphQL schema", async function () {
  const response = this.getTestData("graphqlQueryResponse");
  const responseData = await response.json();

  // Basic schema validation - in a real implementation you'd use a proper GraphQL schema validator
  expect(responseData).toHaveProperty("data");
  expect(responseData.data).toHaveProperty("character");

  const character = responseData.data.character;

  // Verify required fields exist
  expect(typeof character.id).toBe("string");
  expect(typeof character.name).toBe("string");
  expect(typeof character.age).toBe("number");
  expect(Array.isArray(character.characteristics)).toBe(true);
});

// Character creation via GraphQL
Given("I have valid character creation data", async function () {
  const characterData = this.generateTestCharacter();

  this.storeTestData("characterMutationData", {
    name: characterData.name,
    gender: characterData.gender,
    raceId: "1", // Human race ID
  });
});

When("I execute a createCharacter mutation", async function () {
  const token = this.getTestData("authToken");
  const characterData = this.getTestData("characterMutationData");

  const mutation = `
    mutation CreateCharacter($input: CharacterInput!) {
      createCharacter(input: $input) {
        id
        name
        gender
        race {
          type
        }
        characteristics {
          type
          value
        }
        status
      }
    }
  `;

  const response = await this.page.request.post(
    `${this.config.apiURL}/graphql`,
    {
      data: {
        query: mutation,
        variables: {
          input: characterData,
        },
      },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  this.storeTestData("createCharacterResponse", response);
});

Then("the character should be created successfully", async function () {
  const response = this.getTestData("createCharacterResponse");
  expect(response.status()).toBe(200);

  const responseData = await response.json();
  expect(responseData.errors).toBeFalsy();
  expect(responseData.data.createCharacter).toBeTruthy();

  const newCharacter = responseData.data.createCharacter;
  expect(newCharacter.id).toBeTruthy();
  expect(newCharacter.status).toBe("ALIVE");

  this.storeTestData("newlyCreatedCharacter", newCharacter);
});

Then("the response should include the new character ID", async function () {
  const character = this.getTestData("newlyCreatedCharacter");
  expect(character.id).toBeTruthy();
  expect(typeof character.id).toBe("string");
});

Then("the character should be queryable immediately", async function () {
  const token = this.getTestData("authToken");
  const character = this.getTestData("newlyCreatedCharacter");

  const query = `
    query GetCharacter($id: ID!) {
      character(id: $id) {
        id
        name
        status
      }
    }
  `;

  const response = await this.page.request.post(
    `${this.config.apiURL}/graphql`,
    {
      data: {
        query,
        variables: {
          id: character.id,
        },
      },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  expect(response.status()).toBe(200);

  const responseData = await response.json();
  expect(responseData.data.character).toBeTruthy();
  expect(responseData.data.character.id).toBe(character.id);
});

// Character updates
Given("I have an existing character", async function () {
  // Use existing test character or create new one
  let character = this.getTestData("testCharacter");

  if (!character) {
    await this.step("I have a character in the system");
    character = this.getTestData("testCharacter");
  }

  this.storeTestData("existingCharacter", character);
});

When("I execute an updateCharacter mutation", async function () {
  const token = this.getTestData("authToken");
  const character = this.getTestData("existingCharacter");

  const updatedName = `${character.name} Updated`;

  const mutation = `
    mutation UpdateCharacter($id: ID!, $input: CharacterInput!) {
      updateCharacter(id: $id, input: $input) {
        id
        name
        age
      }
    }
  `;

  const response = await this.page.request.post(
    `${this.config.apiURL}/graphql`,
    {
      data: {
        query: mutation,
        variables: {
          id: character.id,
          input: {
            name: updatedName,
            gender: character.gender,
            raceId: "1",
          },
        },
      },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  this.storeTestData("updateCharacterResponse", response);
  this.storeTestData("updatedName", updatedName);
});

Then("the character should be updated successfully", async function () {
  const response = this.getTestData("updateCharacterResponse");
  expect(response.status()).toBe(200);

  const responseData = await response.json();
  expect(responseData.errors).toBeFalsy();
  expect(responseData.data.updateCharacter).toBeTruthy();

  const updatedCharacter = responseData.data.updateCharacter;
  const expectedName = this.getTestData("updatedName");
  expect(updatedCharacter.name).toBe(expectedName);
});

Then(
  "the changes should be reflected in subsequent queries",
  async function () {
    const token = this.getTestData("authToken");
    const character = this.getTestData("existingCharacter");
    const expectedName = this.getTestData("updatedName");

    const query = `
    query GetCharacter($id: ID!) {
      character(id: $id) {
        id
        name
      }
    }
  `;

    const response = await this.page.request.post(
      `${this.config.apiURL}/graphql`,
      {
        data: {
          query,
          variables: {
            id: character.id,
          },
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const responseData = await response.json();
    expect(responseData.data.character.name).toBe(expectedName);
  },
);

Then("related data should remain consistent", async function () {
  const token = this.getTestData("authToken");
  const character = this.getTestData("existingCharacter");

  const query = `
    query GetCharacter($id: ID!) {
      character(id: $id) {
        id
        characteristics {
          type
          value
        }
        race {
          type
        }
      }
    }
  `;

  const response = await this.page.request.post(
    `${this.config.apiURL}/graphql`,
    {
      data: {
        query,
        variables: {
          id: character.id,
        },
      },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  const responseData = await response.json();
  expect(responseData.data.character.characteristics).toBeTruthy();
  expect(responseData.data.character.race).toBeTruthy();
});

// Pagination tests
Given("I have multiple characters in the system", async function () {
  const token = this.getTestData("authToken");
  const createdCharacters = [];

  // Create 5 test characters
  for (let i = 0; i < 5; i++) {
    const characterData = this.generateTestCharacter({
      name: `Test Character ${i + 1}`,
    });

    const mutation = `
      mutation CreateCharacter($input: CharacterInput!) {
        createCharacter(input: $input) {
          id
          name
        }
      }
    `;

    const response = await this.page.request.post(
      `${this.config.apiURL}/graphql`,
      {
        data: {
          query: mutation,
          variables: {
            input: {
              name: characterData.name,
              gender: characterData.gender,
              raceId: "1",
            },
          },
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    const responseData = await response.json();
    createdCharacters.push(responseData.data.createCharacter);
  }

  this.storeTestData("multipleCharacters", createdCharacters);
});

When("I query characters with pagination parameters", async function () {
  const token = this.getTestData("authToken");

  const query = `
    query GetCharacters($first: Int, $after: String) {
      characters(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        edges {
          node {
            id
            name
          }
          cursor
        }
        totalCount
      }
    }
  `;

  const response = await this.page.request.post(
    `${this.config.apiURL}/graphql`,
    {
      data: {
        query,
        variables: {
          first: 2,
        },
      },
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  this.storeTestData("paginatedQueryResponse", response);
});

Then("I should receive a Relay connection response", async function () {
  const response = this.getTestData("paginatedQueryResponse");
  expect(response.status()).toBe(200);

  const responseData = await response.json();
  expect(responseData.data.characters).toBeTruthy();
  expect(responseData.data.characters).toHaveProperty("pageInfo");
  expect(responseData.data.characters).toHaveProperty("edges");
  expect(responseData.data.characters).toHaveProperty("totalCount");
});

Then("pageInfo should indicate pagination state", async function () {
  const response = this.getTestData("paginatedQueryResponse");
  const responseData = await response.json();

  const pageInfo = responseData.data.characters.pageInfo;
  expect(pageInfo).toHaveProperty("hasNextPage");
  expect(pageInfo).toHaveProperty("hasPreviousPage");
  expect(pageInfo).toHaveProperty("startCursor");
  expect(pageInfo).toHaveProperty("endCursor");

  expect(typeof pageInfo.hasNextPage).toBe("boolean");
  expect(typeof pageInfo.hasPreviousPage).toBe("boolean");
});

Then("edges should contain character data and cursors", async function () {
  const response = this.getTestData("paginatedQueryResponse");
  const responseData = await response.json();

  const edges = responseData.data.characters.edges;
  expect(Array.isArray(edges)).toBe(true);

  for (const edge of edges) {
    expect(edge).toHaveProperty("node");
    expect(edge).toHaveProperty("cursor");
    expect(edge.node).toHaveProperty("id");
    expect(edge.node).toHaveProperty("name");
    expect(typeof edge.cursor).toBe("string");
  }
});

Then("I should be able to navigate pages using cursors", async function () {
  const token = this.getTestData("authToken");
  const firstResponse = this.getTestData("paginatedQueryResponse");
  const firstResponseData = await firstResponse.json();

  const endCursor = firstResponseData.data.characters.pageInfo.endCursor;

  if (endCursor && firstResponseData.data.characters.pageInfo.hasNextPage) {
    const query = `
      query GetCharacters($first: Int, $after: String) {
        characters(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
          edges {
            node {
              id
              name
            }
            cursor
          }
        }
      }
    `;

    const secondResponse = await this.page.request.post(
      `${this.config.apiURL}/graphql`,
      {
        data: {
          query,
          variables: {
            first: 2,
            after: endCursor,
          },
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    expect(secondResponse.status()).toBe(200);

    const secondResponseData = await secondResponse.json();
    expect(secondResponseData.data.characters.edges).toBeTruthy();

    // Verify we got different results
    const firstIds = firstResponseData.data.characters.edges.map(
      (e) => e.node.id,
    );
    const secondIds = secondResponseData.data.characters.edges.map(
      (e) => e.node.id,
    );

    // Should have different character IDs (no overlap in pagination)
    expect(firstIds.some((id) => secondIds.includes(id))).toBe(false);
  }
});
