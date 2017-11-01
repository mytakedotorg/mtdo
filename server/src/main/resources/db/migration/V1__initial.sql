--- Account management
CREATE TABLE account (
    id              serial PRIMARY KEY,
    username        varchar(60) NOT NULL,
    email           varchar(513) NOT NULL,
    name            varchar(255), --NULLABLE
    created_at      timestamp NOT NULL,
    created_ip      inet NOT NULL,
    updated_at      timestamp NOT NULL,
    updated_ip      inet NOT NULL,
    last_seen_at    timestamp NOT NULL,
    last_seen_ip    inet NOT NULL,
    last_emailed_at timestamp NOT NULL
);

CREATE TABLE loginlink (
    code            char(44) PRIMARY KEY,
    created_at      timestamp NOT NULL,
    expires_at      timestamp NOT NULL,
    requestor_ip    inet NOT NULL,
    account_id      int NOT NULL REFERENCES account (id)
);

CREATE TABLE confirmaccountlink (
    code            char(44) PRIMARY KEY,
    created_at      timestamp NOT NULL,
    expires_at      timestamp NOT NULL,
    requestor_ip    inet NOT NULL,
    username        varchar(60) NOT NULL,
    email           varchar(513) NOT NULL
);

--- Takes
CREATE TABLE takerevision (
    id          serial PRIMARY KEY,
    parent_id   int REFERENCES takerevision (id), --NULLABLE (null for root)
    created_at  timestamp NOT NULL,
    created_ip  inet NOT NULL,
    title       varchar(255) NOT NULL,
    blocks      jsonb NOT NULL
);

CREATE TABLE takedraft (
    id              serial PRIMARY KEY,
    user_id         int NOT NULL REFERENCES account (id),
    last_revision   int NOT NULL REFERENCES takerevision (id)
);

CREATE TABLE takepublished (
    id              serial PRIMARY KEY,
    user_id         int NOT NULL REFERENCES account (id),
    title           varchar(255) NOT NULL,
    title_slug      varchar(255) NOT NULL,
    blocks          jsonb NOT NULL,
    published_at    timestamp NOT NULL,
    deleted_at      timestamp NOT NULL,
    count_view      int NOT NULL,
    count_like      int NOT NULL,
    count_bookmark  int NOT NULL,
    count_spam      int NOT NULL,
    count_illegal   int NOT NULL
);

CREATE TYPE reaction AS ENUM ('like', 'bookmark', 'spam', 'illegal');
CREATE TABLE takereaction (
    take_id         int NOT NULL REFERENCES takepublished (id),
    user_id         int NOT NULL REFERENCES account (id),
    kind            reaction NOT NULL,
    PRIMARY KEY (take_id, user_id, kind), --user can only have one of each kind of reaction per take
    reacted_at      timestamp NOT NULL,
    reacted_ip      inet NOT NULL
);
