import React from 'react';

const GraphLegend = ({ items, width, orientation = 'horizontal' }) => {
        if (!items || items.length === 0) return null;

        const containerStyle =
                orientation === 'vertical'
                        ? {
                                maxHeight: '450px',
                                overflowY: 'scroll',
                        }
                        : {
                                width: width,
                                overflowX: 'scroll',
                                height: "fit-content"
                        };

        const itemContainerStyle = {
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: '20px',
        };

        return (
                <div className={`legend-container-${orientation}`} style={containerStyle}>
                        <div className={`custom-legend legend-${orientation}`}>
                                {items.map((item, index) => (
                                        <div key={index} style={itemContainerStyle}>
                                                <div
                                                        style={{
                                                                width: 14,
                                                                height: 14,
                                                                marginRight: 6,
                                                                backgroundColor: item.colour,
                                                                borderRadius: 2,
                                                        }}
                                                />
                                                <span>{item.label}</span>
                                        </div>
                                ))}
                        </div>
                </div>
        );
};

export default GraphLegend;