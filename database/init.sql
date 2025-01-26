-- Create database
CREATE DATABASE test;


-- Connect to the database created
\c test;


-- Create tables
CREATE TABLE site (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE emission_factor (
    start_year INTEGER PRIMARY KEY,
    end_year INTEGER GENERATED ALWAYS AS (start_year + 1) STORED,
    gas FLOAT NOT NULL,
    electricity FLOAT NOT NULL
);

CREATE TABLE gas_usage_record (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES site(id),
    start_year INTEGER NOT NULL,
    end_year INTEGER GENERATED ALWAYS AS (start_year + 1) STORED,
    energy_usage_kwh INTEGER NOT NULL,
    cost_gbp FLOAT
);

CREATE TABLE electricity_usage_record (
    id SERIAL PRIMARY KEY,
    site_id INTEGER REFERENCES site(id),
    start_year INTEGER NOT NULL,
    end_year INTEGER GENERATED ALWAYS AS (start_year + 1) STORED,
    energy_usage_kwh INTEGER NOT NULL,
    cost_gbp FLOAT
);


-- Insert test data into tables
INSERT INTO site (name)
VALUES
('Site A'),
('Site B'),
('Site C'),
('Site D'),
('Site E'),
('Site F'),
('Site G'),
('Site H');

INSERT INTO emission_factor (start_year, gas, electricity)
VALUES
(2019, 0.000184, 0.0002556),
(2020, 0.000184, 0.000233),
(2021, 0.000184, 0.00023),
(2022, 0.000183, 0.000193),
(2023, 0.0001843189262, 0.000207074288590604);

INSERT INTO gas_usage_record (site_id, start_year, energy_usage_kwh, cost_gbp)
VALUES
(1, 2020, 20000, 1600.00),
(2, 2019, 10000, NULL),
(3, 2018, 15000, 1250.00),
(4, 2021, 5000, 450.50),
(5, 2022, 8000, NULL),
(6, 2017, 7000, 550.25),
(7, 2020, 3000, NULL),
(8, 2015, 9000, 700.00),
(1, 2012, 25000, 3200.00),
(2, 2023, 5000, NULL);

INSERT INTO electricity_usage_record (site_id, start_year, energy_usage_kwh, cost_gbp)
VALUES
(1, 2022, 10000, 1200.50),
(2, 2023, 5000, 750.00),
(3, 2019, 18000, 2200.00),
(4, 2020, 15000, 1800.25),
(5, 2021, 12000, NULL),
(6, 2018, 7000, 1050.75),
(7, 2022, 3000, 400.00),
(8, 2017, 8000, NULL),
(1, 2015, 25000, 3200.00),
(2, 2023, 4000, 600.50);
