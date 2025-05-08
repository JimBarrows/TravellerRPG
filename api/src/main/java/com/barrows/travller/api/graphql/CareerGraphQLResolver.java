package com.barrows.travller.api.graphql;

import com.barrows.travller.api.model.Career;
import com.barrows.travller.api.model.CharacteristicType;
import com.barrows.travller.api.model.Rank;
import com.barrows.travller.api.model.Skill;
import com.barrows.travller.api.repository.CareerRepository;
import com.barrows.travller.api.repository.SkillRepository;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

/**
 * GraphQL resolver for Career-related queries and mutations.
 */
@Controller
public class CareerGraphQLResolver {

    private final CareerRepository careerRepository;
    private final SkillRepository skillRepository;

    public CareerGraphQLResolver(CareerRepository careerRepository, SkillRepository skillRepository) {
        this.careerRepository = careerRepository;
        this.skillRepository = skillRepository;
    }

    /**
     * Query to get a career by ID.
     */
    @QueryMapping
    public Career career(@Argument Long id) {
        return careerRepository.findById(id).orElse(null);
    }

    /**
     * Query to get all careers.
     */
    @QueryMapping
    public List<Career> careers() {
        return careerRepository.findAll();
    }

    /**
     * Query to search for careers by name or description.
     */
    @QueryMapping
    public List<Career> searchCareers(@Argument String searchTerm) {
        return careerRepository.searchByNameOrDescription(searchTerm);
    }

    /**
     * Query to find careers by qualification characteristic.
     */
    @QueryMapping
    public List<Career> careersByQualificationCharacteristic(@Argument CharacteristicType characteristicType) {
        return careerRepository.findByQualificationRequirementCharacteristic(characteristicType);
    }

    /**
     * Query to find careers with qualification requirements less than or equal to a value.
     */
    @QueryMapping
    public List<Career> careersByQualificationRequirement(
            @Argument CharacteristicType characteristicType,
            @Argument int maxValue) {
        return careerRepository.findByQualificationRequirementLessThanEqual(characteristicType, maxValue);
    }

    /**
     * Mutation to create a new career.
     */
    @MutationMapping
    public Career createCareer(@Argument CareerInput input) {
        Career career = new Career(input.getName(), input.getDescription());

        // Set qualification DM
        career.setQualificationDM(input.getQualificationDM());

        // Add qualification requirements
        if (input.getQualificationRequirements() != null) {
            for (Map.Entry<CharacteristicType, Integer> entry : input.getQualificationRequirements().entrySet()) {
                career.addQualificationRequirement(entry.getKey(), entry.getValue());
            }
        }

        return careerRepository.save(career);
    }

    /**
     * Mutation to update an existing career.
     */
    @MutationMapping
    public Career updateCareer(@Argument Long id, @Argument CareerInput input) {
        Career career = careerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Career not found"));

        career.setName(input.getName());
        career.setDescription(input.getDescription());
        career.setQualificationDM(input.getQualificationDM());

        // Update qualification requirements
        if (input.getQualificationRequirements() != null) {
            career.getQualificationRequirements().clear();
            for (Map.Entry<CharacteristicType, Integer> entry : input.getQualificationRequirements().entrySet()) {
                career.addQualificationRequirement(entry.getKey(), entry.getValue());
            }
        }

        return careerRepository.save(career);
    }

    /**
     * Mutation to delete a career.
     */
    @MutationMapping
    public boolean deleteCareer(@Argument Long id) {
        if (careerRepository.existsById(id)) {
            careerRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Mutation to add a rank to a career.
     */
    @MutationMapping
    public Career addRankToCareer(@Argument Long careerId, @Argument RankInput input) {
        Career career = careerRepository.findById(careerId)
                .orElseThrow(() -> new IllegalArgumentException("Career not found"));

        Rank rank = new Rank();
        rank.setTitle(input.getTitle());
        rank.setLevel(input.getLevel());
        rank.setPromotionDM(input.getPromotionDM());

        // Set skill for rank
        if (input.getSkillId() != null) {
            Skill skill = skillRepository.findById(input.getSkillId())
                    .orElseThrow(() -> new IllegalArgumentException("Skill not found: " + input.getSkillId()));
            rank.setSkillGained(skill);
        }

        career.addRank(rank);

        return careerRepository.save(career);
    }

    /**
     * Input class for career creation/update.
     */
    public static class CareerInput {
        private String name;
        private String description;
        private int qualificationDM;
        private Map<CharacteristicType, Integer> qualificationRequirements;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public int getQualificationDM() {
            return qualificationDM;
        }

        public void setQualificationDM(int qualificationDM) {
            this.qualificationDM = qualificationDM;
        }

        public Map<CharacteristicType, Integer> getQualificationRequirements() {
            return qualificationRequirements;
        }

        public void setQualificationRequirements(Map<CharacteristicType, Integer> qualificationRequirements) {
            this.qualificationRequirements = qualificationRequirements;
        }
    }

    /**
     * Input class for rank creation.
     */
    public static class RankInput {
        private String title;
        private Long skillId;
        private int level;
        private int promotionDM;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public Long getSkillId() {
            return skillId;
        }

        public void setSkillId(Long skillId) {
            this.skillId = skillId;
        }

        public int getLevel() {
            return level;
        }

        public void setLevel(int level) {
            this.level = level;
        }

        public int getPromotionDM() {
            return promotionDM;
        }

        public void setPromotionDM(int promotionDM) {
            this.promotionDM = promotionDM;
        }
    }
}
