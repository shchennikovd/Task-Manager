CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    date VARCHAR(50),
    color VARCHAR(50),
    priority VARCHAR(20),
    status VARCHAR(20)
);
