import React, { useEffect, useState } from 'react';
import GraphFilters from '../components/GraphFilters';
import Graph from '../components/Graph';

const Insights = (props) => {
        const [renderGraph, setRenderGraph] = React.useState(false);

        const [years, setYears] = useState([]);
        const [categories, setCategories] = useState("");
        const [sites, setSites] = useState("");
        const [chart, setChart] = useState("");

        const setData = (years, categories, sites, chart) => {
                setYears(years);
                setCategories(categories);
                setSites(sites);
                setChart(chart);
        };

        const isAvailable = () => {
                return years.length > 0 && categories.length > 0 && sites.length > 0 && chart;
        }

        const [containerWidth, setContainerWidth] = useState(0);

        useEffect(() => {
                const updateWidth = () => {
                        const container = document.querySelector('.insights-container');
                        if (container) {
                                setContainerWidth(container.offsetWidth);
                        }
                };

                updateWidth();
                window.addEventListener('resize', updateWidth);

                return () => {
                        window.removeEventListener('resize', updateWidth);
                };
        }, []);

        return (
                <div className="insights-container">
                        <GraphFilters setData={setData} setRenderGraph={setRenderGraph} />
                        <Graph isAvailable={isAvailable()} years={years} categories={categories} sites={sites} chart={chart} renderGraph={renderGraph} setRenderGraph={setRenderGraph} containerWidth={containerWidth} />
                </div>
        );
}
export default Insights