package com.barrows.travller.api.graphql.relay;

import com.barrows.travller.api.model.Character;
import com.barrows.travller.api.repository.*;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * GraphQL resolver for Node interface queries.
 */
@Controller
public class NodeResolver {

    private final CharacterRepository characterRepository;
    private final CareerRepository careerRepository;
    private final SkillRepository skillRepository;
    private final WorldRepository worldRepository;
    private final WeaponRepository weaponRepository;
    private final ArmorRepository armorRepository;
    private final VehicleRepository vehicleRepository;
    private final SpaceshipRepository spaceshipRepository;

    public NodeResolver(CharacterRepository characterRepository,
                       CareerRepository careerRepository,
                       SkillRepository skillRepository,
                       WorldRepository worldRepository,
                       WeaponRepository weaponRepository,
                       ArmorRepository armorRepository,
                       VehicleRepository vehicleRepository,
                       SpaceshipRepository spaceshipRepository) {
        this.characterRepository = characterRepository;
        this.careerRepository = careerRepository;
        this.skillRepository = skillRepository;
        this.worldRepository = worldRepository;
        this.weaponRepository = weaponRepository;
        this.armorRepository = armorRepository;
        this.vehicleRepository = vehicleRepository;
        this.spaceshipRepository = spaceshipRepository;
    }

    /**
     * Query to get a node by ID.
     */
    @QueryMapping
    public Object node(@Argument String id) {
        try {
            NodeInfo nodeInfo = decodeNodeId(id);

            switch (nodeInfo.getType()) {
                case "Character":
                    return characterRepository.findById(nodeInfo.getId()).orElse(null);
                case "Career":
                    return careerRepository.findById(nodeInfo.getId()).orElse(null);
                case "Skill":
                    return skillRepository.findById(nodeInfo.getId()).orElse(null);
                case "World":
                    return worldRepository.findById(nodeInfo.getId()).orElse(null);
                case "Weapon":
                    return weaponRepository.findById(nodeInfo.getId()).orElse(null);
                case "Armor":
                    return armorRepository.findById(nodeInfo.getId()).orElse(null);
                case "Vehicle":
                    return vehicleRepository.findById(nodeInfo.getId()).orElse(null);
                case "Spaceship":
                    return spaceshipRepository.findById(nodeInfo.getId()).orElse(null);
                default:
                    return null;
            }
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Query to get multiple nodes by IDs.
     */
    @QueryMapping
    public List<Object> nodes(@Argument List<String> ids) {
        return ids.stream()
                .map(this::node)
                .filter(node -> node != null)
                .collect(Collectors.toList());
    }

    /**
     * Encode a node ID.
     */
    public static String encodeNodeId(String type, Long id) {
        String nodeId = type + ":" + id;
        return Base64.getEncoder().encodeToString(nodeId.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Decode a node ID.
     */
    public static NodeInfo decodeNodeId(String encodedId) {
        String decoded = new String(Base64.getDecoder().decode(encodedId), StandardCharsets.UTF_8);
        String[] parts = decoded.split(":");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Invalid node ID format");
        }
        return new NodeInfo(parts[0], Long.parseLong(parts[1]));
    }

    /**
     * Node information.
     */
    public static class NodeInfo {
        private final String type;
        private final Long id;

        public NodeInfo(String type, Long id) {
            this.type = type;
            this.id = id;
        }

        public String getType() {
            return type;
        }

        public Long getId() {
            return id;
        }
    }
}
