import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';


const paginationModel = { page: 0, pageSize: 100 };


const DataTable = (props) => {
        let columns = [
                { field: 'id', headerName: 'ID', width: 70 },
                { field: 'firstName', headerName: 'First name', width: 130 },
                { field: 'lastName', headerName: 'Last name', width: 130 },
                { field: 'age', headerName: 'Age', type: 'number', width: 90 },
        ];

        return (
                <Paper sx={{ height: 400, width: '100%' }}>
                        <DataGrid
                                rows={props.rows}
                                columns={columns}
                                initialState={{ pagination: { paginationModel } }}
                        //pageSizeOptions={[5, 10]}
                        />
                </Paper>
        );
};

export default DataTable;