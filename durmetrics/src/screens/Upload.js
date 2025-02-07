import React, { useEffect } from 'react';
import UploadConfiguration from '../components/UploadConfiguration';
import UploadPreview from '../components/UploadPreview';

const Upload = (props) => {
        const [file, setFile] = React.useState(null);

        return (
                <div className="upload-content">
                        <UploadConfiguration setFile={setFile} />
                        <UploadPreview file={file} />
                </div>
        );
};

export default Upload;