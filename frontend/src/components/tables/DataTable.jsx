import React from 'react';

export const DataTable = ({
  columns = [],
  data = [],
  keyExtractor = (item) => item.id || item._id,
  emptyMessage = 'No records found matching current criteria.',
  loading = false,
  className = '',
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#e5eeff] p-8 text-center">
        <div className="w-8 h-8 border-2 border-[#e5eeff] border-t-[#061449] rounded-full animate-spin mx-auto mb-2.5"></div>
        <p className="text-xs font-medium text-[#45464f]">Updating table data...</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-[#e5eeff] shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#eff4ff] border-b border-[#d3e4fe]/80 text-[#45464f] text-xs font-bold uppercase tracking-wider font-headline">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`py-3.5 px-4 sm:px-5 ${col.headerClassName || ''} ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5eeff] text-sm text-[#0b1c30]">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 px-4 text-center text-sm text-[#45464f]"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[28px] text-[#767680]">
                      search_off
                    </span>
                    <span>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr
                  key={keyExtractor(item, rowIndex)}
                  className="hover:bg-[#f8f9ff] transition-colors group"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`py-3.5 px-4 sm:px-5 align-middle ${
                        col.className || ''
                      } ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {col.render ? col.render(item, rowIndex) : item[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
