-- Create database
CREATE DATABASE test;

-- Connect to the database created
\c test;

-- Create table
CREATE TABLE electricity_usage (
	site_id integer NOT NULL,
    start_year integer NOT NULL,
    end_year integer NOT NULL,
	energy_usage_kwh integer NOT NULL,
	cost_gbp float
);

-- Insert test data
INSERT INTO electricity_usage (site_id, start_year, end_year, energy_usage_kwh, cost_gbp)
VALUES (1, 2020, 2021, 12345, 1234.56);
INSERT INTO electricity_usage (site_id, start_year, end_year, energy_usage_kwh, cost_gbp)
VALUES (1, 2021, 2022, 67891, 7891.23);
INSERT INTO electricity_usage (site_id, start_year, end_year, energy_usage_kwh, cost_gbp)
VALUES (1, 2022, 2023, 23456, 4567.89);
INSERT INTO electricity_usage (site_id, start_year, end_year, energy_usage_kwh, cost_gbp)
VALUES (2, 2020, 2021, 12345, 1234.56);
INSERT INTO electricity_usage (site_id, start_year, end_year, energy_usage_kwh, cost_gbp)
VALUES (2, 2021, 2022, 67891, 7891.23);
INSERT INTO electricity_usage (site_id, start_year, end_year, energy_usage_kwh, cost_gbp)
VALUES (2, 2022, 2023, 23456, 4567.89);
INSERT INTO electricity_usage (site_id, start_year, end_year, energy_usage_kwh, cost_gbp)
VALUES (3, 2020, 2021, 12345, 1234.56);
INSERT INTO electricity_usage (site_id, start_year, end_year, energy_usage_kwh, cost_gbp)
VALUES (3, 2021, 2022, 67891, 7891.23);
INSERT INTO electricity_usage (site_id, start_year, end_year, energy_usage_kwh, cost_gbp)
VALUES (3, 2022, 2023, 23456, 4567.89);
