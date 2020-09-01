ALTER TABLE account ALTER COLUMN username DROP NOT NULL;
ALTER TABLE account ADD COLUMN confirmed_at TIMESTAMP;
ALTER TABLE account ADD COLUMN confirmed_ip INET;
ALTER TABLE account ADD COLUMN newsletter BOOLEAN;
DROP TABLE confirmaccountlink;
