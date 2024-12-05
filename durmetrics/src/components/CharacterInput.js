import React from 'react';

const CharacterInput = (props) => {
        return (
                <input className="code-char" id={`code-${props.index}`} onChange={props.handleCodeInput} />
        );
};

export default CharacterInput;