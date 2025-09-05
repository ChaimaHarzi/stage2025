"use client";
import React, { useEffect, useRef, useState } from "react";
import AddModal from '../../admin/equipementsManagement/add/addModal';

export default function EquipementsManagementTable() {
  const tableRef = useRef<HTMLTableElement>(null);
  const dtRef = useRef<any>(null); // Ref for DataTable instance
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const $ = require("jquery");
      (window as any).$ = (window as any).jQuery = $;
      require("datatables.net");
      require("datatables.net-dt/css/jquery.dataTables.css");
      require("datatables.net-colreorder");
      if (tableRef.current) {
        const dt = $(tableRef.current).DataTable({
          dom: 't', // Only show the table
          colReorder: true,
          lengthMenu: [10, 15, 20, 25, 50],
          language: {
            zeroRecords: `<div class=\"py-10 px-5 flex flex-col justify-center items-center text-center\"><svg class=\"shrink-0 size-6 text-gray-500 dark:text-neutral-500\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"11\" r=\"8\"/><path d=\"m21 21-4.3-4.3\"/></svg><div class=\"max-w-sm mx-auto\"><p class=\"mt-2 text-sm text-gray-600 dark:text-neutral-400\">No search results</p></div></div>`
          },
          initComplete: function () {
            setLoading(false);
          },
        });
        dtRef.current = dt;
        // Custom page length select integration
        const pageLengthSelect = document.getElementById("custom-page-length") as HTMLSelectElement | null;
        if (pageLengthSelect) {
          pageLengthSelect.addEventListener("change", function () {
            dt.page.len(parseInt(this.value, 10)).draw();
          });
        }
        // Listen for page changes to update pagination state
        dt.on('draw', function () {
          const info = dt.page.info();
          setCurrentPage(info.page + 1);
          setTotalPages(info.pages);
        });
        // Set initial pagination state
        const info = dt.page.info();
        setCurrentPage(info.page + 1);
        setTotalPages(info.pages);
        // Clean up
        return () => {
          dt.destroy(true);
        };
      }
    }
  }, []);

  // Delete handler with confirmation
  const handleDelete = (name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      // TODO: Implement actual delete logic
      alert(`${name} deleted! (Demo)`);
    }
  };

  return (
    <>
      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => {
          // handle form data here if needed
          setIsAddModalOpen(false);
        }}
      />
      <div className="w-full">
        {/* Controls Row: responsive, spaced, with icon */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg px-2 h-11 shadow-sm w-full sm:w-64 transition-colors duration-150 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <input
              id="custom-search"
              type="text"
              className="h-9 px-3 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none w-full border-none"
              placeholder="Search..."
              onChange={e => {
                if (dtRef.current) {
                  dtRef.current.search(e.target.value).draw();
                }
              }}
            />
            <span className="flex items-center pl-2 pr-1">
              <svg className="w-5 h-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
          </div>
          <div className="relative">
            <select
              id="custom-page-length"
              className="h-11 py-2 px-4 pr-8 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-20 transition-colors duration-150"
              style={{ 
                appearance: 'none', 
                WebkitAppearance: 'none', 
                MozAppearance: 'none',
                backgroundImage: 'none'
              }}
              defaultValue="10"
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>
          </div>
          <button
            type="button"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 h-11 min-w-[110px]"
            onClick={() => setIsAddModalOpen(true)}
            title="Ajouter un équipement"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Ajouter
          </button>
        </div>
        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow shadow-gray-200 border-2 border-gray-200 p-2">
          <table ref={tableRef} className="min-w-full text-sm bg-white font-sans">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                {/* Example for one column, repeat for others */}
                <th className="p-2 text-left font-bold text-gray-700 bg-white border-b border-gray-200">
                  <span className="flex items-center gap-1">
                    Référence
                    <button
                      type="button"
                      className="ml-1 focus:outline-none"
                      title="Trier par Référence"
                      onClick={() => {
                        if (dtRef.current) {
                          const currentOrder = dtRef.current.order();
                          if (!currentOrder.length || currentOrder[0][0] !== 0) {
                            dtRef.current.order([0, 'asc']).draw();
                          } else if (currentOrder[0][1] === 'asc') {
                            dtRef.current.order([0, 'desc']).draw();
                          } else if (currentOrder[0][1] === 'desc') {
                            dtRef.current.order([]).draw();
                          }
                        }
                      }}
                    >
                      <svg className="w-4 h-4 text-gray-400 hover:text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m-4-5V3" />
                      </svg>
                    </button>
                  </span>
                </th>
                {/* Repeat similar for other columns, updating index and title */}
                <th className="p-2 text-left font-bold text-gray-700 bg-white border-b border-gray-200">
                  <span className="flex items-center gap-1">
                    Nom
                    <button
                      type="button"
                      className="ml-1 focus:outline-none"
                      title="Trier par Nom"
                      onClick={() => {
                        if (dtRef.current) {
                          const currentOrder = dtRef.current.order();
                          if (!currentOrder.length || currentOrder[0][0] !== 1) {
                            dtRef.current.order([1, 'asc']).draw();
                          } else if (currentOrder[0][1] === 'asc') {
                            dtRef.current.order([1, 'desc']).draw();
                          } else if (currentOrder[0][1] === 'desc') {
                            dtRef.current.order([]).draw();
                          }
                        }
                      }}
                    >
                      <svg className="w-4 h-4 text-gray-400 hover:text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m-4-5V3" />
                      </svg>
                    </button>
                  </span>
                </th>
                <th className="p-2 text-left font-bold text-gray-700 bg-white border-b border-gray-200">
                  <span className="flex items-center gap-1">
                    Famille
                    <button
                      type="button"
                      className="ml-1 focus:outline-none"
                      title="Trier par Famille"
                      onClick={() => {
                        if (dtRef.current) {
                          const currentOrder = dtRef.current.order();
                          if (!currentOrder.length || currentOrder[0][0] !== 2) {
                            dtRef.current.order([2, 'asc']).draw();
                          } else if (currentOrder[0][1] === 'asc') {
                            dtRef.current.order([2, 'desc']).draw();
                          } else if (currentOrder[0][1] === 'desc') {
                            dtRef.current.order([]).draw();
                          }
                        }
                      }}
                    >
                      <svg className="w-4 h-4 text-gray-400 hover:text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m-4-5V3" />
                      </svg>
                    </button>
                  </span>
                </th>
                <th className="p-2 text-left font-bold text-gray-700 bg-white border-b border-gray-200">
                  <span className="flex items-center gap-1">
                    Catégorie
                    <button
                      type="button"
                      className="ml-1 focus:outline-none"
                      title="Trier par Catégorie"
                      onClick={() => {
                        if (dtRef.current) {
                          const currentOrder = dtRef.current.order();
                          if (!currentOrder.length || currentOrder[0][0] !== 3) {
                            dtRef.current.order([3, 'asc']).draw();
                          } else if (currentOrder[0][1] === 'asc') {
                            dtRef.current.order([3, 'desc']).draw();
                          } else if (currentOrder[0][1] === 'desc') {
                            dtRef.current.order([]).draw();
                          }
                        }
                      }}
                    >
                      <svg className="w-4 h-4 text-gray-400 hover:text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m-4-5V3" />
                      </svg>
                    </button>
                  </span>
                </th>
                <th className="p-2 text-left font-bold text-gray-700 bg-white border-b border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { reference: "EQ-001", nom: "Tournevis", famille: "Outils", categorie: "Manuel" },
                { reference: "EQ-002", nom: "Perceuse", famille: "Outils", categorie: "Electrique" },
                { reference: "EQ-003", nom: "Ordinateur", famille: "Informatique", categorie: "Bureau" },
                { reference: "EQ-004", nom: "Imprimante", famille: "Informatique", categorie: "Bureau" },
                { reference: "EQ-005", nom: "Clé à molette", famille: "Outils", categorie: "Manuel" },
                { reference: "EQ-006", nom: "Scanner", famille: "Informatique", categorie: "Bureau" },
                { reference: "EQ-007", nom: "Marteau", famille: "Outils", categorie: "Manuel" },
                { reference: "EQ-008", nom: "Lampe", famille: "Eclairage", categorie: "Electrique" },
                { reference: "EQ-009", nom: "Projecteur", famille: "Eclairage", categorie: "Electrique" },
                { reference: "EQ-010", nom: "Tablette", famille: "Informatique", categorie: "Mobile" },
                { reference: "EQ-011", nom: "Pince", famille: "Outils", categorie: "Manuel" },
                { reference: "EQ-012", nom: "Switch", famille: "Réseau", categorie: "Informatique" },
                { reference: "EQ-013", nom: "Routeur", famille: "Réseau", categorie: "Informatique" },
                { reference: "EQ-014", nom: "Câble HDMI", famille: "Accessoires", categorie: "Informatique" },
                { reference: "EQ-015", nom: "Câble Ethernet", famille: "Accessoires", categorie: "Réseau" },
                { reference: "EQ-016", nom: "Tournevis plat", famille: "Outils", categorie: "Manuel" },
                { reference: "EQ-017", nom: "Tournevis cruciforme", famille: "Outils", categorie: "Manuel" },
                { reference: "EQ-018", nom: "Ampoule LED", famille: "Eclairage", categorie: "Electrique" },
                { reference: "EQ-019", nom: "Batterie externe", famille: "Accessoires", categorie: "Mobile" },
                { reference: "EQ-020", nom: "Chargeur USB", famille: "Accessoires", categorie: "Mobile" },
              ].map((row, idx) => (
                <tr
                  key={row.reference + idx}
                  className="transition-all duration-200 ease-in-out bg-white hover:bg-gray-100 hover:shadow-sm group"
                >
                  <td className="p-2 font-medium text-gray-900 group-hover:text-gray-900">{row.reference}</td>
                  <td className="p-2 text-gray-700 group-hover:text-gray-900">{row.nom}</td>
                  <td className="p-2 text-gray-700 group-hover:text-gray-900">{row.famille}</td>
                  <td className="p-2 text-gray-700 group-hover:text-gray-900">{row.categorie}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-3">
                      {/* Description Icon - Blue */}
                      <button title="Voir la description" className="hover:bg-blue-100 p-1 rounded transition-all duration-200 group/icon">
                        <svg className="w-5 h-5 text-blue-500 transition-transform duration-200 group-hover/icon:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 8h8M8 12h8M8 16h4" />
                        </svg>
                      </button>
                      {/* Edit Icon - Green */}
                      <button title="Modifier" className="hover:bg-green-100 p-1 rounded transition-all duration-200 group/icon">
                        <svg className="w-5 h-5 text-green-500 transition-transform duration-200 group-hover/icon:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.1 2.1 0 0 1 2.97 2.97l-9.193 9.193a2 2 0 0 1-.707.464l-3.11 1.037a.5.5 0 0 1-.634-.634l1.037-3.11a2 2 0 0 1 .464-.707l9.193-9.193zm0 0L20.5 7.125" />
                          <rect x="2" y="20" width="20" height="2" rx="1" fill="currentColor" />
                        </svg>
                      </button>
                      {/* Delete Icon - Red */}
                      <button title="Supprimer" className="hover:bg-red-100 p-1 rounded transition-all duration-200 group/icon">
                        <svg className="w-5 h-5 text-red-500 transition-transform duration-200 group-hover/icon:scale-110" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Custom Pagination */}
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={() => dtRef.current && dtRef.current.page('previous').draw('page')}
            disabled={currentPage === 1}
            className="text-gray-400 hover:text-gray-700 disabled:opacity-50 px-3 py-2 rounded-full transition-colors"
          >
            &laquo;
          </button>
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              onClick={() => dtRef.current && dtRef.current.page(idx).draw('page')}
              className={`w-10 h-10 rounded-full transition-colors font-semibold ${currentPage === idx + 1 ? 'bg-blue-100 border border-blue-400 text-blue-700 shadow' : 'hover:bg-gray-100'}`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => dtRef.current && dtRef.current.page('next').draw('page')}
            disabled={currentPage === totalPages}
            className="text-gray-400 hover:text-gray-700 disabled:opacity-50 px-3 py-2 rounded-full transition-colors"
          >
            &raquo;
          </button>
        </div>
      </div>
    </>
  );
}