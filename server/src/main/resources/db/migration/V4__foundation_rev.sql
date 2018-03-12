--- Migrate takes as foundation migrates, inspired by https://flywaydb.org/getstarted/how
CREATE TABLE foundation_rev (
    version              int PRIMARY KEY,
    description          varchar(255) NOT NULL,
    migrated_on          timestamp NOT NULL,
    execution_time_sec   int NOT NULL
);
INSERT INTO foundation_rev (version, description, migrated_on, execution_time_sec) VALUES (1, 'initial', '2018-01-01', 0);
