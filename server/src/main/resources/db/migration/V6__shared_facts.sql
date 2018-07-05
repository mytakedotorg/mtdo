CREATE TABLE shared_url_rev (
    version             int PRIMARY KEY,
    description         varchar(255) NOT NULL,
    created_on          timestamp NOT NULL
);

INSERT INTO shared_url_rev (version, description, created_on) VALUES (1, 'initial', '2018-06-25');

CREATE TABLE shared_facts (
    shared_by           int REFERENCES account (id), --if NULL, shared by anonymous
    shared_on           timestamp NOT NULL,
    shared_ip           inet NOT NULL,
    view_count          int NOT NULL DEFAULT 0,
    title               varchar(255),
    url_version         int NOT NULL REFERENCES shared_url_rev(version),
    factId              text,
    highlight_start     decimal(8, 3), --up to 99999.999
    highlight_end       decimal(8, 3),
    view_start          decimal(8, 3),
    view_end            decimal(8, 3)
);
