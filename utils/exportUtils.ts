import * as XLSX from 'xlsx';
import { Order } from '../types';

export const exportToExcel = (rows: Order[], fileName: string = 'baristai-eyes-orders'): void => {
  if (!rows || rows.length === 0) {
    console.warn("No data to export.");
    return;
  }

  // Create a worksheet from the JSON data
  const worksheet = XLSX.utils.json_to_sheet(rows);
  
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

  // Generate the Excel file and trigger the download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};