const tableHeadersConfig = {
        "electricity-usage": {
                staticFields: {
                        site_id: 'Site ID',
                },
                dynamicFields: {
                        energy_usage_kwh: "Electricity {year1}-{year2}",
                        // cost_gbp: "Cost (£) {year1}-{year2}",
                }
        },
        "gas-usage": {
                staticFields: {
                        site_id: 'Site ID',
                },
                dynamicFields: {
                        energy_usage_kwh: "Gas {year1}-{year2}",
                        // cost_gbp: "Cost (£) {year1}-{year2}"
                }
        },
        "carbon-emissions": {
                staticFields: {
                        site_id: 'Site ID',
                },
                dynamicFields: {
                        electricity_energy_usage_kwh: "Electricity {year1}-{year2}",
                        gas_energy_usage_kwh: "Gas {year1}-{year2}",
                        total_emissions: "Total Emissions {year1}-{year2}"
                }
        },
        "kwh-per-hdd": {
                staticFields: {
                        site_id: 'Site ID',
                },
                dynamicFields: {
                        kwh_per_hdd: "kWh/HDD {year1}-{year2}",
                }
        },
        "sites": {
                staticFields: {
                        id: 'Site ID',
                        floor_area_square_metre: "Floor Area (m²)",
                        ni185_energy_user: "NI 185 Energy User",
                        comment: "Comments"
                }
        }
};

export default tableHeadersConfig;