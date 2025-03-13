const tableHeadersConfig = {
        "electricity-usage": {
                staticFields: {
                        site_id: 'Site ID',
                },
                dynamicFields: {
                        energy_usage_kwh: "Electricity {year1}-{year2}",
                        cost_gbp: "Cost (£) {year1}-{year2}",
                }
        },
        "gas-usage": {
                staticFields: {
                        site_id: 'Site ID',
                },
                dynamicFields: {
                        energy_usage_kwh: "Gas {year1}-{year2}",
                        cost_gbp: "Cost (£) {year1}-{year2}"
                }
        }
};

export default tableHeadersConfig;