-- Create database
CREATE DATABASE test;

-- Connect to the database created
\c test;

-- Create tables
CREATE TABLE site (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE electricity_usage_record (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES site(id),
    start_year INTEGER NOT NULL,
    end_year INTEGER NOT NULL,
    energy_usage_kwh INTEGER NOT NULL,
    cost_gbp FLOAT
);

-- Insert test data into site table
INSERT INTO site (name) VALUES
('Site A'),
('Site B'),
('Site C');

-- Insert test data into electricity_usage_record table
INSERT INTO electricity_usage_record (site_id, start_year, end_year, energy_usage_kwh, cost_gbp) VALUES
(1, 2022, 2023, 10000, 1200.50),
(2, 2022, 2023, 5000, 750.00),
(3, 2022, 2023, 7000, 1050.75);
