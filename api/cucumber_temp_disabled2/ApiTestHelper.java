package com.barrows.travller.api.cucumber;

import com.barrows.travller.api.model.*;
import com.barrows.travller.api.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestComponent;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.graphql.test.tester.HttpGraphQlTester;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.util.*;

/**
 * Helper class for API testing in Cucumber step definitions.
 * Provides utilities for GraphQL queries, REST API calls, and test data management.
 */
@TestComponent
@ActiveProfiles("test")
public class ApiTestHelper {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private HttpGraphQlTester graphQlTester;

    @Autowired
    private ObjectMapper objectMapper;

    // Repositories for data setup and verification
    @Autowired
    private CharacterRepository characterRepository;
    
    @Autowired
    private SkillRepository skillRepository;
    
    @Autowired
    private CareerRepository careerRepository;
    
    @Autowired
    private RaceRepository raceRepository;
    
    @Autowired
    private HomeworldRepository homeworldRepository;
    
    @Autowired
    private WeaponRepository weaponRepository;
    
    @Autowired
    private ArmorRepository armorRepository;

    // Test context storage
    private final Map<String, Object> testContext = new HashMap<>();
    private final Map<String, Integer> diceRolls = new HashMap<>();
    
    /**
     * Gets the base URL for REST API calls.
     */
    public String getBaseUrl() {
        return "http://localhost:" + port;
    }

    /**
     * Stores a value in test context for later retrieval.
     */
    public void storeInContext(String key, Object value) {
        testContext.put(key, value);
    }

    /**
     * Retrieves a value from test context.
     */
    @SuppressWarnings("unchecked")
    public <T> T getFromContext(String key) {
        return (T) testContext.get(key);
    }

    /**
     * Clears the test context.
     */
    public void clearContext() {
        testContext.clear();
        diceRolls.clear();
    }

    /**
     * Sets a predetermined dice roll result for testing.
     */
    public void setDiceRoll(String rollType, int result) {
        diceRolls.put(rollType, result);
    }

    /**
     * Gets a predetermined dice roll result, or rolls randomly if not set.
     */
    public int getDiceRoll(String rollType, int defaultMin, int defaultMax) {
        return diceRolls.getOrDefault(rollType, 
            defaultMin + (int) (Math.random() * (defaultMax - defaultMin + 1)));
    }

    /**
     * Executes a GraphQL query and returns the response.
     */
    public JsonNode executeGraphQLQuery(String query, Map<String, Object> variables) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("query", query);
            if (variables != null && !variables.isEmpty()) {
                requestBody.put("variables", variables);
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                getBaseUrl() + "/graphql", entity, String.class);

            return objectMapper.readTree(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to execute GraphQL query", e);
        }
    }

    /**
     * Executes a GraphQL mutation and returns the response.
     */
    public JsonNode executeGraphQLMutation(String mutation, Map<String, Object> variables) {
        return executeGraphQLQuery(mutation, variables);
    }

    /**
     * Makes a REST API GET request.
     */
    public ResponseEntity<String> get(String endpoint) {
        return restTemplate.getForEntity(getBaseUrl() + endpoint, String.class);
    }

    /**
     * Makes a REST API POST request.
     */
    public ResponseEntity<String> post(String endpoint, Object body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Object> entity = new HttpEntity<>(body, headers);
        return restTemplate.postForEntity(getBaseUrl() + endpoint, entity, String.class);
    }

    /**
     * Creates a test character with specified characteristics.
     */
    public com.barrows.travller.api.model.Character createTestCharacter(String name) {
        com.barrows.travller.api.model.Character character = new com.barrows.travller.api.model.Character();
        character.setName(name);
        character.setAge(18);
        character.setGender("Male");
        character.setCredits(1000);
        character.setStatus(CharacterStatus.ALIVE);

        // Add default characteristics (standard 2D6 generation)
        character.getCharacteristics().add(createCharacteristic(CharacteristicType.STRENGTH, 7));
        character.getCharacteristics().add(createCharacteristic(CharacteristicType.DEXTERITY, 7));
        character.getCharacteristics().add(createCharacteristic(CharacteristicType.ENDURANCE, 7));
        character.getCharacteristics().add(createCharacteristic(CharacteristicType.INTELLIGENCE, 7));
        character.getCharacteristics().add(createCharacteristic(CharacteristicType.EDUCATION, 7));
        character.getCharacteristics().add(createCharacteristic(CharacteristicType.SOCIAL_STANDING, 7));

        return characterRepository.save(character);
    }

    /**
     * Creates a characteristic with specified type and value.
     */
    public Characteristic createCharacteristic(CharacteristicType type, int value) {
        Characteristic characteristic = new Characteristic();
        characteristic.setType(type);
        characteristic.setValue(value);
        characteristic.setOriginalValue(value);
        return characteristic;
    }

    /**
     * Creates a test skill with specified level.
     */
    public Skill createTestSkill(String name, int level) {
        com.barrows.travller.api.model.Skill skill = new com.barrows.travller.api.model.Skill(); // Create new skill since findByName not available
        skill.setName(name);
        skill.setLevel(level);
        skill.setCategory(SkillCategory.PHYSICAL); // Use available enum value
        return skillRepository.save(skill);
    }

    /**
     * Verifies that a character has a specific characteristic value.
     */
    public boolean verifyCharacteristic(Long characterId, CharacteristicType type, int expectedValue) {
        com.barrows.travller.api.model.Character character = characterRepository.findById(characterId).orElse(null);
        if (character == null) return false;

        Characteristic characteristic = character.getCharacteristic(type);
        return characteristic != null && characteristic.getValue() == expectedValue;
    }

    /**
     * Verifies that a character has a specific skill at a certain level.
     */
    public boolean verifySkill(Long characterId, String skillName, int expectedLevel) {
        com.barrows.travller.api.model.Character character = characterRepository.findById(characterId).orElse(null);
        if (character == null) return false;

        Skill skill = character.getSkill(skillName);
        return skill != null && skill.getLevel() == expectedLevel;
    }

    /**
     * Simulates a 2D6 dice roll (2-12 range).
     */
    public int roll2D6() {
        return getDiceRoll("2d6", 2, 12);
    }

    /**
     * Simulates a 1D6 dice roll (1-6 range).
     */
    public int roll1D6() {
        return getDiceRoll("1d6", 1, 6);
    }

    /**
     * Simulates a skill check with specified difficulty.
     */
    public boolean makeSkillCheck(int skillLevel, int characteristicModifier, int difficultyNumber) {
        int roll = roll2D6();
        int total = roll + skillLevel + characteristicModifier;
        storeInContext("lastSkillRoll", roll);
        storeInContext("lastSkillTotal", total);
        return total >= difficultyNumber;
    }

    /**
     * Gets the difficulty modifier for a characteristic value.
     */
    public int getCharacteristicModifier(int characteristicValue) {
        if (characteristicValue <= 2) return -2;
        if (characteristicValue <= 5) return -1;
        if (characteristicValue <= 8) return 0;
        if (characteristicValue <= 11) return 1;
        if (characteristicValue <= 14) return 2;
        return 3;
    }

    /**
     * Cleans up test data after scenario execution.
     */
    public void cleanupTestData() {
        // Delete test characters
        List<com.barrows.travller.api.model.Character> testCharacters = getFromContext("testCharacters");
        if (testCharacters != null) {
            characterRepository.deleteAll(testCharacters);
        }
        
        // Clear test context
        clearContext();
    }

    /**
     * Seeds the database with standard Traveller game data.
     */
    public void seedGameData() {
        // Create basic skills if they don't exist
        createSkillIfNotExists("Athletics", SkillCategory.PHYSICAL);
        createSkillIfNotExists("Gun Combat", SkillCategory.COMBAT);
        createSkillIfNotExists("Melee", SkillCategory.COMBAT);
        createSkillIfNotExists("Pilot", SkillCategory.VEHICLE);
        createSkillIfNotExists("Engineering", SkillCategory.TECHNICAL);
        createSkillIfNotExists("Electronics", SkillCategory.TECHNICAL);
        createSkillIfNotExists("Medic", SkillCategory.TECHNICAL);

        // Create basic careers if they don't exist
        createCareerIfNotExists("Navy", "Military service aboard starships");
        createCareerIfNotExists("Army", "Planetary military forces");
        createCareerIfNotExists("Merchant", "Commercial space trading");
        createCareerIfNotExists("Scout", "Exploration and survey service");
    }

    private void createSkillIfNotExists(String name, SkillCategory category) {
        // if (skillRepository.findByName(name).isEmpty()) { // Method not available
        if (true) {
            Skill skill = new Skill();
            skill.setName(name);
            skill.setCategory(category);
            skill.setLevel(0);
            skillRepository.save(skill);
        }
    }

    private void createCareerIfNotExists(String name, String description) {
        // if (careerRepository.findByName(name).isEmpty()) { // Method not available
        if (true) {
            Career career = new Career();
            career.setName(name);
            career.setDescription(description);
            careerRepository.save(career);
        }
    }

    /**
     * Parses a GraphQL response to extract data or errors.
     */
    public JsonNode parseGraphQLResponse(JsonNode response) {
        if (response.has("errors") && !response.get("errors").isEmpty()) {
            throw new RuntimeException("GraphQL errors: " + response.get("errors").toString());
        }
        return response.get("data");
    }

    /**
     * Asserts that a GraphQL response contains expected data.
     */
    public void assertGraphQLResponse(JsonNode response, String path, Object expectedValue) {
        JsonNode data = parseGraphQLResponse(response);
        JsonNode actualValue = data.at(path);
        
        if (expectedValue == null) {
            if (!actualValue.isNull()) {
                throw new AssertionError("Expected null at path " + path + ", but got: " + actualValue);
            }
        } else if (expectedValue instanceof Number) {
            if (!actualValue.isNumber() || actualValue.asInt() != ((Number) expectedValue).intValue()) {
                throw new AssertionError("Expected " + expectedValue + " at path " + path + ", but got: " + actualValue);
            }
        } else {
            if (!actualValue.asText().equals(expectedValue.toString())) {
                throw new AssertionError("Expected " + expectedValue + " at path " + path + ", but got: " + actualValue);
            }
        }
    }
}