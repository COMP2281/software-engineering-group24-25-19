import React from 'react';

const Error = (props) => {
        return (
                <div className="errorpage">
                        <div className="errorpage-code">
                                {props.code}
                        </div>
                        <div className="errorpage-title">
                                {props.title}
                        </div>
                        <div className="errorpage-message">
                                {props.message}
                        </div>
                </div>
        );
};

export default Error;