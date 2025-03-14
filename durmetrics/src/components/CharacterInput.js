import React from 'react';

const CharacterInput = (props) => {
        return (
                <input className="code-char" id={`code-${props.index}`} onKeyDown={props.handleKeyDown} onChange={props.handleCodeInput} />
        );
};

export default CharacterInput;