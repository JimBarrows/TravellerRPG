-- Add the missing political_entity_characteristics table
CREATE TABLE IF NOT EXISTS political_entity_characteristics (
    political_entity_id BIGINT NOT NULL,
    characteristic VARCHAR(255) NOT NULL,
    PRIMARY KEY (political_entity_id, characteristic),
    FOREIGN KEY (political_entity_id) REFERENCES political_entities(id)
);
