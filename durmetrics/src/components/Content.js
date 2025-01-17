import React, { useEffect, useState } from "react";
import DataTable from './DataTable';
import SearchBar from './SearchBar';
import Dropdown from './Dropdown';
import Papa from 'papaparse';
import report from '../data/report.csv';
import { TableVirtuoso } from 'react-virtuoso';

const Content = () => {
        return (
        <div className="body">
                <DataTable />
        </div>
        );
};      
export default Content;