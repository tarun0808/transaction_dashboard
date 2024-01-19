import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Container } from '@mui/material';


const columns = [
  { field: 'title', headerName: 'Title', width: 250},
  { field: 'description', headerName: 'Description', width: 350 },
  {
    field: 'price',
    headerName: 'Price',
    type: 'number',
    width: 110,
  },
  {
    field: 'category',
    headerName: 'Category',
    width: 160,
  },
  {
    field: 'sold',
    headerName: 'Sold',
    width: 160,
  },
  {
    field: 'image',
    headerName: 'Image',
    width: 160,
    height: 200, 
    description: 'This column has a value getter and is not sortable.',
    sortable: false,
    renderCell: (params) => (
        <Box sx={{width: "auto", height: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
            <img style={{width: "auto", height: "100%", objectFit: "cover"}} src={params.value} />
        </Box>
      ),
  },
];


export default function DataTable({data}) {
  return (
    <Container>
      <DataGrid
        rows={data}
        getRowId={(data) => data._id}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
      />
      </Container>
  );
}