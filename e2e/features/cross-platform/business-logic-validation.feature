@cross-platform @business-logic @traveller-rules @validation
Feature: Cross-Platform Business Logic Validation
  As a Traveller RPG system user
  I want all game rules and calculations to be consistent across web, mobile, and API
  So that character creation, gameplay, and campaign mechanics work identically regardless of platform

  Background:
    Given all platforms implement the same Traveller RPG rule set
    And business logic validation is enabled across all platforms
    And I have access to web, mobile, and API interfaces

  @character-generation @upp @cross-platform
  Scenario: Universal Personality Profile (UPP) calculation consistency
    Given I am creating a new character across platforms
    
    # Test UPP generation on mobile
    When I generate characteristics on mobile using "2d6" method
      | characteristic | dice_roll | base_value | modifier | final_value |
      | Strength       | 6,5       | 11         | 0        | 11 (B)     |
      | Dexterity      | 4,3       | 7          | 0        | 7          |
      | Endurance      | 6,6       | 12         | 0        | 12 (C)     |
      | Intelligence   | 5,4       | 9          | 0        | 9          |
      | Education      | 3,2       | 5          | 0        | 5          |
      | Social         | 6,4       | 10         | 0        | 10 (A)     |
    Then the UPP should be calculated as "B7C95A" on mobile
    
    # Verify same character on web
    When I view the same character on web
    Then the UPP should display as "B7C95A"
    And characteristic modifiers should be consistent:
      | characteristic | modifier | explanation           |
      | Strength       | +1       | 11 is above average  |
      | Dexterity      | -1       | 7 is below average   |
      | Endurance      | +1       | 12 is above average  |
      | Intelligence   | 0        | 9 is average         |
      | Education      | -2       | 5 is well below avg  |
      | Social         | +1       | 10 is above average  |
    
    # Verify via API
    When I query the character via GraphQL API
    Then the API should return:
      ```json
      {
        "character": {
          "characteristics": {
            "strength": { "value": 11, "hex": "B", "modifier": 1 },
            "dexterity": { "value": 7, "hex": "7", "modifier": -1 },
            "endurance": { "value": 12, "hex": "C", "modifier": 1 },
            "intelligence": { "value": 9, "hex": "9", "modifier": 0 },
            "education": { "value": 5, "hex": "5", "modifier": -2 },
            "social": { "value": 10, "hex": "A", "modifier": 1 }
          },
          "upp": "B7C95A"
        }
      }
      ```

  @career-generation @benefits @cross-platform
  Scenario: Career generation and benefit calculation consistency
    Given I have a character with characteristics "9A8B67"
    And I am proceeding through career generation
    
    # Navy career on web
    When I select "Navy" career on web
    And I roll for qualification with DM +1 (Social 10)
    And I roll "8" on 2d6 (total 9 vs DM 6)
    Then I should qualify for Navy career
    And I should see "Qualified for Navy service" message
    
    # First term survival on mobile  
    When I switch to mobile and process first term
    And I roll for survival with DM +1 (Intelligence B)
    And I roll "5" on 2d6 (total 6 vs DM 5)
    Then I should survive the first term
    And I should gain "1" skill from service skills table
    
    # Commission attempt via API
    When I attempt commission through API call
    With Intelligence DM +1 and Social DM +1
    And the API processes commission roll "10" on 2d6 (total 12)
    Then the API should return commission success
    And character should receive rank "Ensign" (O1)
    And character should gain "Leadership" skill at level 1
    
    # Verify consistency across platforms
    When I check the character on all platforms
    Then all platforms should show:
      | field           | value              |
      | Career          | Navy              |
      | Terms Served    | 1                 |
      | Rank            | Ensign (O1)       |
      | Skills Gained   | Leadership-1      |
      | Service Status  | Commissioned      |
    And career progression should be identical everywhere

  @skills @advancement @cross-platform
  Scenario: Skill advancement and cascade rules validation
    Given I have a character with existing skills
      | skill        | level | source        |
      | Pilot        | 2     | Career        |
      | Engineering  | 1     | Background    |
      | Gunnery      | 0     | Service       |
    
    # Skill improvement on mobile
    When I advance "Pilot" skill on mobile
    And the character has sufficient experience points
    Then Pilot skill should increase to level 3
    And the cost should be calculated as (next level × 200) = 600 XP
    And remaining XP should decrease by 600
    
    # Cascade skill check on web
    When I view the character on web
    And I attempt to add "Pilot (Starship)" specialization
    Then the system should recognize existing Pilot skill
    And should offer cascade from Pilot-3 to Pilot(Starship)-2
    And should calculate reduced XP cost for cascade
    
    # API validation of skill rules
    When I query skill advancement options via API
    Then the API should enforce Traveller skill rules:
      | rule                    | validation                              |
      | Max skill level         | Cannot exceed characteristic + 4        |
      | Cascade prerequisites   | Parent skill must be level 1+          |
      | XP cost formula        | (Target level × base cost) correctly   |
      | Skill category limits  | Service skills vs general skills        |
    
    # Cross-platform skill display
    When skill advancement is complete
    Then all platforms should display skills consistently:
      | platform | skill_format              | specialization_display  |
      | Web      | Pilot-3, Pilot(Ship)-2   | Tabbed or grouped      |
      | Mobile   | Pilot 3, Pilot(Ship) 2   | Compact list format    |
      | API      | pilot: {level: 3, specs: {starship: 2}} | Structured data |

  @equipment @encumbrance @cost @cross-platform
  Scenario: Equipment management and encumbrance calculation
    Given I have a character with Strength 8 and Endurance 10
    And I am managing equipment across platforms
    
    # Add equipment on web
    When I add equipment to the character on web:
      | item           | weight | cost    | quantity |
      | Laser Rifle    | 4 kg   | 3500 Cr | 1        |
      | Cloth Armor    | 2 kg   | 250 Cr  | 1        |
      | Toolkit        | 3 kg   | 1000 Cr | 1        |
      | Medkit         | 1 kg   | 1500 Cr | 2        |
    Then total weight should be calculated as 11 kg
    And total cost should be 7750 Cr
    And encumbrance should be calculated using Strength + Endurance
    
    # Verify encumbrance rules on mobile
    When I view the character on mobile
    Then encumbrance limits should be displayed as:
      | encumbrance_level | weight_limit | movement_effect |
      | Light Load        | 0-9 kg      | No penalty     |
      | Heavy Load        | 10-18 kg    | -1 DM all tasks |
      | Maximum Load      | 19-27 kg    | -3 DM all tasks |
    And current load (11 kg) should show "Heavy Load" status
    And movement penalties should be indicated
    
    # Equipment modification via API
    When I modify equipment through API
    And I add "Extended Magazine" to Laser Rifle
    Then the API should update equipment properly:
      ```json
      {
        "equipment": {
          "laser_rifle": {
            "base_weight": 4,
            "modifications": [{"name": "Extended Magazine", "weight": 0.5}],
            "total_weight": 4.5,
            "total_cost": 3600
          }
        }
      }
      ```
    
    # Cross-platform encumbrance sync
    When equipment changes are synchronized
    Then all platforms should reflect:
      | metric           | value        |
      | Total Weight     | 11.5 kg     |
      | Encumbrance      | Heavy Load   |
      | Movement Penalty | -1 DM       |
      | Equipment Mods   | Ext. Mag    |

  @combat @damage @healing @cross-platform
  Scenario: Combat damage and healing calculation consistency
    Given I have a character in combat
    With characteristics: Strength 10, Dexterity 8, Endurance 12
    And the character is wearing "Cloth Armor" (Protection +5)
    
    # Damage application on mobile
    When the character receives "15 points" of laser damage on mobile
    And the attack hits location "Torso"
    Then armor protection should reduce damage by 5
    And actual damage should be 10 points
    And damage should be applied to Endurance first (12 → 2)
    And overflow damage should be applied to adjacent characteristics
    
    # Damage verification on web
    When I view the character status on web
    Then characteristics should display as:
      | characteristic | original | current | damage_taken |
      | Strength       | 10       | 10      | 0           |
      | Dexterity      | 8        | 8       | 0           |
      | Endurance      | 12       | 2       | 10          |
    And wound status should indicate "Seriously Wounded"
    And combat penalties should be applied: -2 DM to all actions
    
    # Healing via API
    When medical treatment is applied via API
    With "Medic-2" skill and "Medkit" equipment
    And the API processes healing check with success
    Then natural healing should be calculated correctly
    And characteristic recovery should follow Traveller rules
    And healing timeline should be established
    
    # Cross-platform wound tracking
    When healing progresses over time
    Then all platforms should maintain consistent:
      | healing_aspect     | requirement                    |
      | Recovery rate      | 1 point per day (natural)     |
      | Medical bonus      | +2 points with successful Med  |
      | Wound penalties    | Decrease as characteristics    |
      | Healing timeline   | Track days until full recovery |

  @psionics @special-abilities @cross-platform
  Scenario: Psionic abilities and special power validation
    Given I have a character with psionic potential
    And psionics are enabled in the campaign
    And the character has Psionic Strength Rating (PSR) of 8
    
    # Psionic talent testing on web
    When I test for psionic talents on web
    And roll for each talent with appropriate DMs
      | talent      | base_difficulty | psi_dm | roll_result | success |
      | Telepathy   | 9+             | -1     | 8          | No      |
      | Clairvoyance| 10+            | -1     | 11         | Yes     |
      | Telekinesis | 10+            | -1     | 9          | No      |
    Then the character should gain Clairvoyance talent
    And should be able to learn Clairvoyance powers
    
    # Power usage on mobile
    When I use "Life Detection" power on mobile
    With range "Medium" (requires PSR check at DM -1)
    And I roll "7" on 2d6 (total 6 vs target 8)
    Then the power should fail
    And PSR should decrease by 1 (8 → 7) due to strain
    And cooldown timer should be applied
    
    # API psionic rule enforcement
    When I query psionic limitations via API
    Then the API should enforce:
      | rule                  | validation                              |
      | PSR minimum          | Must be 6+ to use powers               |
      | Power range costs    | Increase difficulty by range           |
      | Strain effects       | PSR reduction on failed attempts       |
      | Recovery time        | 1 PSR per hour of rest                 |
      | Detection rules      | Psionic use can be detected            |
    
    # Cross-platform psionic display
    When psionic status is updated
    Then all platforms should show consistent:
      | element           | display_format                    |
      | PSR current/max   | "7/8" or "7 (max 8)"             |
      | Available powers  | List with usage costs            |
      | Cooldowns        | Time remaining for each power     |
      | Strain penalties | Effects on other characteristics  |

  @trade @economics @cross-platform
  Scenario: Trade and economic calculation validation
    Given I have a merchant character
    With Trade skill level 3 and Broker skill level 2
    And I am conducting interstellar trade
    
    # Trade good pricing on web
    When I purchase trade goods on "Industrial" world
    And check prices for "Electronics" (base price 50,000 Cr/ton)
    Then world trade codes should modify base price:
      | world_type    | trade_code | price_modifier | final_price |
      | Industrial    | In         | -20%          | 40,000 Cr  |
      | High Tech     | Ht         | -10%          | 36,000 Cr  |
    And Broker skill should provide additional DM -2 to purchase price
    And final purchase price should be calculated correctly
    
    # Shipping and transport on mobile
    When I arrange shipping on mobile
    For "20 tons" of electronics to "Agricultural" world
    With jump distance of "2 parsecs"
    Then shipping costs should be calculated as:
      | cost_component    | calculation        | amount      |
      | Base freight      | 1000 Cr/ton       | 20,000 Cr  |
      | Jump distance     | ×2 for 2 parsecs   | 40,000 Cr  |
      | Broker discount   | -10% (skill 2)     | -4,000 Cr  |
      | Total shipping    | Final cost         | 36,000 Cr  |
    
    # Market analysis via API
    When I query destination market via API
    For "Agricultural" world receiving "Electronics"
    Then the API should return market data:
      ```json
      {
        "market": {
          "world_name": "Rhylanor",
          "trade_codes": ["Ag", "Ri"],
          "electronics": {
            "base_price": 50000,
            "modifiers": [
              {"source": "Ag", "modifier": "+20%"},
              {"source": "Ri", "modifier": "+10%"}
            ],
            "final_price": 65000,
            "demand": "High",
            "availability": "Scarce"
          }
        }
      }
      ```
    
    # Profit calculation consistency
    When trade transaction is complete
    Then all platforms should calculate identical profits:
      | component         | amount       |
      | Purchase price    | 36,000 Cr   |
      | Shipping cost     | 36,000 Cr   |
      | Total investment  | 72,000 Cr   |
      | Sale price        | 65,000 Cr/t |
      | Gross revenue     | 1,300,000 Cr|
      | Net profit        | 1,228,000 Cr|
      | Profit margin     | 94.5%        |

  @starship @design @operations @cross-platform
  Scenario: Starship design and operation rule validation
    Given I am designing a custom starship
    And I have access to starship construction rules
    And I want to validate design across platforms
    
    # Basic hull design on web
    When I select a "400-ton" hull on web
    And choose "Type A Free Trader" configuration
    Then hull specifications should be calculated:
      | specification  | value        | formula            |
      | Hull Points    | 160          | tonnage ÷ 2.5     |
      | Armor Points   | 0            | base configuration |
      | Cost          | 8,000,000 Cr | 20,000 × tonnage  |
      | Build Time    | 20 months    | tonnage ÷ 20      |
    
    # Drive installation on mobile
    When I install drives on mobile:
      | drive_type | rating | tonnage | power | cost        |
      | Jump       | 1      | 15      | 15    | 10,000,000  |
      | Maneuver   | 1      | 7       | 7     | 4,000,000   |
      | Power Plant| 1      | 19      | 20    | 8,000,000   |
    Then total drive tonnage should be 41 tons
    And power balance should be verified (20 available, 22 required)
    And the system should flag power insufficiency
    
    # Design validation via API
    When I submit the design for API validation
    Then the API should return validation errors:
      ```json
      {
        "validation": {
          "status": "invalid",
          "errors": [
            {
              "component": "power_plant",
              "message": "Insufficient power generation",
              "details": "Requires 22 EP, provides 20 EP"
            }
          ],
          "recommendations": [
            "Upgrade power plant to rating 2",
            "Reduce maneuver drive to rating 0.8"
          ]
        }
      }
      ```
    
    # Cross-platform design consistency
    When design corrections are made
    And power plant is upgraded to rating 2
    Then all platforms should reflect corrected design:
      | component      | rating | tonnage | power | cost         |
      | Power Plant    | 2      | 23      | 40    | 16,000,000   |
      | Total Systems  | -      | 45      | 18    | 38,000,000   |
      | Remaining Hull | -      | 355     | 22    | Available    |
    And design should validate successfully across all platforms

  @legal @law-level @cross-platform
  Scenario: Legal system and law level enforcement
    Given I have characters visiting different worlds
    With varying law levels and legal restrictions
    And characters carry different equipment
    
    # Law level checking on arrival
    When characters arrive at "Rhylanor" (Law Level 6)
    With equipment including:
      | item              | legality_rating | character     |
      | Laser Pistol      | 4              | Scout         |
      | Gauss Rifle       | 6              | Marine        |
      | Explosives        | 1              | Demolitions   |
      | Medical Drugs     | 5              | Doctor        |
    Then the system should check legality across all platforms
    
    # Web platform law enforcement
    When checking equipment legality on web
    Then restrictions should be applied:
      | item              | law_level | legal_status | action_required |
      | Laser Pistol      | 6         | Legal        | None           |
      | Gauss Rifle       | 6         | Borderline   | Permit needed  |
      | Explosives        | 6         | Illegal      | Confiscation   |
      | Medical Drugs     | 6         | Legal        | License check  |
    
    # Mobile enforcement notifications
    When characters attempt to leave starport on mobile
    Then mobile should display law warnings:
      | character     | warning_type | message                           |
      | Scout         | Info         | "Laser pistol registered"         |
      | Marine        | Warning      | "Rifle requires local permit"     |
      | Demolitions   | Alert        | "Explosives must remain on ship"  |
      | Doctor        | Info         | "Medical license verified"        |
    
    # API legal compliance checking
    When querying legal status via API
    Then API should return comprehensive compliance data:
      ```json
      {
        "legal_compliance": {
          "world": "Rhylanor",
          "law_level": 6,
          "characters": [
            {
              "name": "Scout",
              "compliance_status": "compliant",
              "restricted_items": [],
              "required_actions": []
            },
            {
              "name": "Marine", 
              "compliance_status": "conditional",
              "restricted_items": ["gauss_rifle"],
              "required_actions": ["obtain_weapon_permit"]
            }
          ]
        }
      }
      ```
    
    # Cross-platform legal tracking
    When legal status changes (permits obtained, items confiscated)
    Then all platforms should maintain synchronized legal records
    And characters should see consistent legal status
    And future world visits should reference previous legal interactions