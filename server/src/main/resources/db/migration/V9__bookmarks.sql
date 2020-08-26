CREATE TABLE bookmark (
    saved_by            int REFERENCES account (id) NOT NULL,
    saved_on            timestamp NOT NULL,
    fact_hash           char(44) NOT NULL,
    cut_start           integer NOT NULL,
    cut_end             integer NOT NULL,
    PRIMARY KEY(saved_by, fact_hash, cut_start, cut_end)
);

CREATE TABLE bookmarks_last_change (
    saved_by            int REFERENCES account (id) PRIMARY KEY,
    last_change         timestamp NOT NULL
);
