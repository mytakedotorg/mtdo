CREATE TABLE follow (
    author       int NOT NULL REFERENCES account (id),
    follower     int NOT NULL REFERENCES account (id),
    PRIMARY KEY  (author, follower),
    followed_at  timestamp NOT NULL
);
