package com.barrows.travller.api.graphql;

import com.barrows.travller.api.model.CharacteristicType;
import com.barrows.travller.api.model.Skill;
import com.barrows.travller.api.model.SkillCategory;
import com.barrows.travller.api.repository.SkillRepository;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * GraphQL resolver for Skill-related queries and mutations.
 */
@Controller
public class SkillGraphQLResolver {

    private final SkillRepository skillRepository;

    public SkillGraphQLResolver(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    /**
     * Query to get a skill by ID.
     */
    @QueryMapping
    public Skill skill(@Argument Long id) {
        return skillRepository.findById(id).orElse(null);
    }

    /**
     * Query to get all skills.
     */
    @QueryMapping
    public List<Skill> skills() {
        return skillRepository.findAll();
    }

    /**
     * Query to get skills by category.
     */
    @QueryMapping
    public List<Skill> skillsByCategory(@Argument SkillCategory category) {
        return skillRepository.findByCategory(category);
    }

    /**
     * Query to search for skills by name.
     */
    @QueryMapping
    public List<Skill> searchSkills(@Argument String searchTerm) {
        return skillRepository.findByNameContainingIgnoreCase(searchTerm);
    }

    /**
     * Mutation to create a new skill.
     */
    @MutationMapping
    public Skill createSkill(@Argument SkillInput input) {
        Skill skill = new Skill(
            input.getName(),
            input.getLevel(),
            input.getCategory(),
            input.getPrimaryCharacteristic()
        );

        return skillRepository.save(skill);
    }

    /**
     * Mutation to update an existing skill.
     */
    @MutationMapping
    public Skill updateSkill(@Argument Long id, @Argument SkillInput input) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Skill not found"));

        skill.setName(input.getName());
        skill.setCategory(input.getCategory());
        skill.setLevel(input.getLevel());
        skill.setPrimaryCharacteristic(input.getPrimaryCharacteristic());

        return skillRepository.save(skill);
    }

    /**
     * Mutation to delete a skill.
     */
    @MutationMapping
    public boolean deleteSkill(@Argument Long id) {
        if (skillRepository.existsById(id)) {
            skillRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Input class for skill creation/update.
     */
    public static class SkillInput {
        private String name;
        private SkillCategory category;
        private int level;
        private CharacteristicType primaryCharacteristic;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public SkillCategory getCategory() {
            return category;
        }

        public void setCategory(SkillCategory category) {
            this.category = category;
        }

        public int getLevel() {
            return level;
        }

        public void setLevel(int level) {
            this.level = level;
        }

        public CharacteristicType getPrimaryCharacteristic() {
            return primaryCharacteristic;
        }

        public void setPrimaryCharacteristic(CharacteristicType primaryCharacteristic) {
            this.primaryCharacteristic = primaryCharacteristic;
        }
    }
}
