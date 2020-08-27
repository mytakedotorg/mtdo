CREATE TABLE bookmark (
    saved_by            int REFERENCES account (id) NOT NULL,
    saved_on            timestamp NOT NULL,
    fact                char(44) NOT NULL,
    cut_start           integer NOT NULL,
    cut_end             integer NOT NULL,
    PRIMARY KEY(saved_by, fact, cut_start, cut_end)
);

CREATE TABLE bookmarks_mod (
    saved_by            int REFERENCES account (id) PRIMARY KEY,
    last_mod            timestamp NOT NULL
);
