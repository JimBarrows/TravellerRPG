package com.barrows.travller.api.graphql;

import com.barrows.travller.api.model.AtmosphereType;
import com.barrows.travller.api.model.TravelZone;
import com.barrows.travller.api.model.World;
import com.barrows.travller.api.model.WorldType;
import com.barrows.travller.api.repository.WorldRepository;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * GraphQL resolver for World-related queries and mutations.
 */
@Controller
public class WorldGraphQLResolver {

    private final WorldRepository worldRepository;

    public WorldGraphQLResolver(WorldRepository worldRepository) {
        this.worldRepository = worldRepository;
    }

    /**
     * Query to get a world by ID.
     */
    @QueryMapping
    public World world(@Argument Long id) {
        return worldRepository.findById(id).orElse(null);
    }

    /**
     * Query to get all worlds.
     */
    @QueryMapping
    public List<World> worlds() {
        return worldRepository.findAll();
    }

    /**
     * Query to search for worlds by name.
     */
    @QueryMapping
    public List<World> searchWorlds(@Argument String searchTerm) {
        return worldRepository.findByNameContainingIgnoreCase(searchTerm);
    }

    /**
     * Query to find worlds by type.
     */
    @QueryMapping
    public List<World> worldsByType(@Argument WorldType type) {
        return worldRepository.findByType(type);
    }

    /**
     * Query to find worlds by atmosphere type.
     */
    @QueryMapping
    public List<World> worldsByAtmosphere(@Argument AtmosphereType atmosphere) {
        return worldRepository.findByAtmosphere(atmosphere);
    }

    /**
     * Query to find worlds by travel zone.
     */
    @QueryMapping
    public List<World> worldsByTravelZone(@Argument TravelZone travelZone) {
        return worldRepository.findByTravelZone(travelZone);
    }

    /**
     * Query to find worlds by tech level range.
     */
    @QueryMapping
    public List<World> worldsByTechLevel(@Argument int minTechLevel, @Argument int maxTechLevel) {
        return worldRepository.findByTechLevelBetween(minTechLevel, maxTechLevel);
    }

    /**
     * Mutation to create a new world.
     */
    @MutationMapping
    public World createWorld(@Argument WorldInput input) {
        World world = new World();
        world.setName(input.getName());
        world.setType(input.getType());
        world.setSize(input.getSize());
        world.setAtmosphere(input.getAtmosphere());
        world.setHydrographics(input.getHydrographics());
        world.setPopulation(input.getPopulation());
        world.setGovernment(input.getGovernment());
        world.setLawLevel(input.getLawLevel());
        world.setTechLevel(input.getTechLevel());
        world.setStarport(input.getStarport());
        world.setBases(input.getBases());
        world.setTravelZone(input.getTravelZone());
        world.setDescription(input.getDescription());

        return worldRepository.save(world);
    }

    /**
     * Mutation to update an existing world.
     */
    @MutationMapping
    public World updateWorld(@Argument Long id, @Argument WorldInput input) {
        World world = worldRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("World not found"));

        world.setName(input.getName());
        world.setType(input.getType());
        world.setSize(input.getSize());
        world.setAtmosphere(input.getAtmosphere());
        world.setHydrographics(input.getHydrographics());
        world.setPopulation(input.getPopulation());
        world.setGovernment(input.getGovernment());
        world.setLawLevel(input.getLawLevel());
        world.setTechLevel(input.getTechLevel());
        world.setStarport(input.getStarport());
        world.setBases(input.getBases());
        world.setTravelZone(input.getTravelZone());
        world.setDescription(input.getDescription());

        return worldRepository.save(world);
    }

    /**
     * Mutation to delete a world.
     */
    @MutationMapping
    public boolean deleteWorld(@Argument Long id) {
        if (worldRepository.existsById(id)) {
            worldRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Input class for world creation/update.
     */
    public static class WorldInput {
        private String name;
        private WorldType type;
        private int size;
        private AtmosphereType atmosphere;
        private int hydrographics;
        private int population;
        private int government;
        private int lawLevel;
        private int techLevel;
        private String starport;
        private String bases;
        private TravelZone travelZone;
        private String description;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public WorldType getType() {
            return type;
        }

        public void setType(WorldType type) {
            this.type = type;
        }

        public int getSize() {
            return size;
        }

        public void setSize(int size) {
            this.size = size;
        }

        public AtmosphereType getAtmosphere() {
            return atmosphere;
        }

        public void setAtmosphere(AtmosphereType atmosphere) {
            this.atmosphere = atmosphere;
        }

        public int getHydrographics() {
            return hydrographics;
        }

        public void setHydrographics(int hydrographics) {
            this.hydrographics = hydrographics;
        }

        public int getPopulation() {
            return population;
        }

        public void setPopulation(int population) {
            this.population = population;
        }

        public int getGovernment() {
            return government;
        }

        public void setGovernment(int government) {
            this.government = government;
        }

        public int getLawLevel() {
            return lawLevel;
        }

        public void setLawLevel(int lawLevel) {
            this.lawLevel = lawLevel;
        }

        public int getTechLevel() {
            return techLevel;
        }

        public void setTechLevel(int techLevel) {
            this.techLevel = techLevel;
        }

        public String getStarport() {
            return starport;
        }

        public void setStarport(String starport) {
            this.starport = starport;
        }

        public String getBases() {
            return bases;
        }

        public void setBases(String bases) {
            this.bases = bases;
        }

        public TravelZone getTravelZone() {
            return travelZone;
        }

        public void setTravelZone(TravelZone travelZone) {
            this.travelZone = travelZone;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}
