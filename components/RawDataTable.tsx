import React, { useState, useMemo } from 'react';
import { Order } from '../types';
import { columnMapping } from '../constants';
import { format, isValid, parseISO } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';

const displayColumnKeys = [ 'date', 'time', 'category', 'brand', 'commonNameTH', 'action', 'price', 'sweetness', 'promotionName', 'promotionDiscount', 'improve' ];

const formatCellValue = (key: string, value: any): string => {
  const strVal = String(value ?? '');
  if (!strVal) return '';

  if (key === 'date') {
    if (strVal.includes('T') && strVal.endsWith('Z')) {
        const d = parseISO(strVal);
        if (isValid(d)) {
             const thDate = new Date(d.getTime() + (7 * 60 * 60 * 1000));
             return format(thDate, 'dd/MM/yyyy');
        }
    }
    return strVal;
  }

  if (key === 'time') {
    if (strVal.includes('T') && strVal.endsWith('Z')) {
        const d = parseISO(strVal);
        if (isValid(d)) {
            const thTime = new Date(d.getTime() + (7 * 60 * 60 * 1000));
            return format(thTime, 'HH:mm:ss');
        }
    }
    return strVal;
  }

  return strVal;
};

interface RawDataTableProps {
  rows: Order[];
}

const RawDataTable: React.FC<RawDataTableProps> = ({ rows }) => {
  const [filterText, setFilterText] = useState('');
  const { t } = useLanguage();
  
  // Dynamic header labels based on language
  const headerLabels: { [key: string]: string } = {
    date: t('date'),
    time: t('time'),
    category: t('category'),
    brand: t('brand'),
    commonNameTH: t('commonName'),
    nameTH: t('productName'),
    action: t('action'),
    price: t('price'),
    sweetness: t('sweetness'),
    promotionName: t('promotion'),
    promotionDiscount: t('discount'),
    improve: t('suggestion'),
  };
  
  const filteredRows = useMemo(() => {
    if (!filterText) return rows;
    const lowercasedFilter = filterText.toLowerCase();
    return rows.filter(row => {
      return displayColumnKeys.some(key => {
        const rawValue = row[columnMapping[key]];
        const displayValue = formatCellValue(key, rawValue);
        return displayValue.toLowerCase().includes(lowercasedFilter);
      });
    });
  }, [rows, filterText]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div>
            <h3 className="text-base font-semibold leading-6 text-slate-100">{t('rawData')}</h3>
            <p className="mt-1 text-sm text-slate-400 font-mono">
                {t('displayingRows')} 50 of {filteredRows.length} total records.
            </p>
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder={`${t('filter')}...`}
            className="w-full pl-3 pr-10 py-2 font-mono text-sm bg-slate-900/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-accent-cyan"
          />
           <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
      </div>
      
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-cyan-400/20 sm:rounded-lg">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-900/80">
                  <tr>
                    {displayColumnKeys.map((key) => (
                      <th key={key} scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-100 sm:pl-6">
                        {headerLabels[key]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                  {filteredRows.slice(-50).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {displayColumnKeys.map((key) => (
                        <td key={key} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-slate-300 sm:pl-6 font-mono">
                           {formatCellValue(key, row[columnMapping[key]])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
             {filteredRows.length === 0 && (
                <div className="text-center py-12 font-mono text-slate-500">
                    -- No records match filter --
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RawDataTable;