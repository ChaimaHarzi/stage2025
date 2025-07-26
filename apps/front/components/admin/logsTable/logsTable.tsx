"use client";
import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, CheckCircle, Clock, AlertTriangle, ChevronDown } from 'lucide-react';

const LogsTable = () => {
  const [logs] = useState([
    {
      id: 1,
      timestamp: "2023-10-05 14:32:18",
      level: "ERROR",
      service: "Authentication",
      message: "Failed login attempt for user: johndoe",
      status: "Unresolved"
    },
    {
      id: 2,
      timestamp: "2023-10-05 14:30:45",
      level: "INFO",
      service: "Payment",
      message: "Payment processed successfully - TXN-12345",
      status: "Resolved"
    },
    {
      id: 3,
      timestamp: "2023-10-05 14:28:12",
      level: "WARNING",
      service: "Database",
      message: "Connection pool 80% utilized",
      status: "Monitoring"
    },
    {
      id: 4,
      timestamp: "2023-10-05 14:25:33",
      level: "DEBUG",
      service: "API",
      message: "Request received: GET /api/users",
      status: "Resolved"
    },
    {
      id: 5,
      timestamp: "2023-10-05 14:22:07",
      level: "ERROR",
      service: "Email",
      message: "Failed to send notification to user@example.com",
      status: "Unresolved"
    },
    {
      id: 6,
      timestamp: "2023-10-05 14:18:54",
      level: "INFO",
      service: "User",
      message: "New user registered: sarahsmith",
      status: "Resolved"
    },
    {
      id: 7,
      timestamp: "2023-10-05 14:15:32",
      level: "WARNING",
      service: "Cache",
      message: "Cache miss rate exceeding threshold",
      status: "Monitoring"
    },
    {
      id: 8,
      timestamp: "2023-10-05 14:12:18",
      level: "ERROR",
      service: "API",
      message: "Rate limit exceeded for client IP 192.168.1.100",
      status: "Unresolved"
    },
    {
      id: 9,
      timestamp: "2023-10-05 14:08:45",
      level: "INFO",
      service: "Database",
      message: "Database backup completed successfully",
      status: "Resolved"
    },
    {
      id: 10,
      timestamp: "2023-10-05 14:05:12",
      level: "DEBUG",
      service: "Authentication",
      message: "JWT token validated for user session",
      status: "Resolved"
    }
  ]);

  const [filterLevel, setFilterLevel] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(5);

  // Filter logs based on selected level and search query
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesLevel = filterLevel === "ALL" || log.level === filterLevel;
      const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           log.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           log.timestamp.includes(searchQuery);
      return matchesLevel && matchesSearch;
    });
  }, [logs, filterLevel, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const endIndex = startIndex + logsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterLevel, searchQuery, logsPerPage]);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'Monitoring':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "ERROR":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "WARNING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "INFO":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "DEBUG":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Monitoring":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={`min-w-[40px] h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200 ${
            i === currentPage
              ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
              : 'text-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          {i}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="min-h-screen  dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-6 sm:py-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
            <div className="flex flex-col space-y-6">
              {/* Title Section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">System Logs</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
                    Monitor and manage system logs in real-time
                  </p>
                </div>
              </div>
              
              {/* Controls Section - Fixed Layout to prevent overlapping */}
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                {/* Search Input - Fixed positioning with proper spacing */}
                <div className="flex-1 lg:max-w-sm">
                  <div className="relative">
                    {/* Search Icon - Fixed positioning inside input */}
                    <div className="absolute inset-y-0 left-1 flex items-center pointer-events-none">
                      <Search className="w-5 h-5 text-blue-500" />
                    </div>
                    <input
                      type="text"
                      className="block w-full h-11 pl-12 pr-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-all duration-200"
                      placeholder="Search logs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Filter Controls - Proper spacing to prevent overlap */}
                <div className="flex flex-col sm:flex-row gap-4 lg:gap-3">
                  {/* Level Filter with proper icon positioning */}
                  <div className="relative min-w-0 sm:w-36 lg:w-40">
                    {/* Filter Icon - Fixed positioning */}
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
                      <Filter className="w-5 h-5 text-blue-500" />
                    </div>
                    <select 
                      className="block w-full h-11 pl-10 pr-8 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-all duration-200 cursor-pointer appearance-none"
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value)}
                    >
                      <option value="ALL">All Levels</option>
                      <option value="ERROR">Error</option>
                      <option value="WARNING">Warning</option>
                      <option value="INFO">Info</option>
                      <option value="DEBUG">Debug</option>
                    </select>
                    {/* Dropdown Arrow - Fixed positioning to not overlap */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-blue-500" />
                    </div>
                  </div>
                  
                  {/* Per Page Selector with dropdown arrow */}
                  <div className="relative min-w-0 sm:w-32 lg:w-36">
                    <select 
                      className="block w-full h-11 px-3 pr-8 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-all duration-200 cursor-pointer appearance-none"
                      value={logsPerPage}
                      onChange={(e) => setLogsPerPage(Number(e.target.value))}
                    >
                      <option value={5}>5 per page</option>
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                    {/* Dropdown Arrow */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th scope="col" className="px-4 sm:px-6 py-4 font-semibold min-w-[180px]">TIMESTAMP</th>
                  <th scope="col" className="px-4 sm:px-6 py-4 font-semibold min-w-[100px]">LEVEL</th>
                  <th scope="col" className="px-4 sm:px-6 py-4 font-semibold min-w-[120px]">SERVICE</th>
                  <th scope="col" className="px-4 sm:px-6 py-4 font-semibold">MESSAGE</th>
                  <th scope="col" className="px-4 sm:px-6 py-4 font-semibold min-w-[120px]">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentLogs.map((log) => (
                  <tr key={log.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-4 sm:px-6 py-4 font-mono text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {log.service}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-300 max-w-md truncate" title={log.message}>
                        {log.message}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)}
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {currentLogs.length === 0 && (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No logs found</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                  Try adjusting your search query or filter settings to find what you're looking for.
                </p>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {filteredLogs.length > 0 && (
            <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, filteredLogs.length)}</span> of <span className="font-semibold">{filteredLogs.length}</span> results
                </div>
                
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="h-10 px-4 flex items-center text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </button>

                    <div className="hidden sm:flex items-center gap-2">
                      {currentPage > 3 && (
                        <>
                          <button
                            onClick={() => handlePageClick(1)}
                            className="min-w-[40px] h-10 flex items-center justify-center text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                          >
                            1
                          </button>
                          {currentPage > 4 && (
                            <span className="text-gray-500 dark:text-gray-400">•••</span>
                          )}
                        </>
                      )}

                      {renderPaginationButtons()}

                      {currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && (
                            <span className="text-gray-500 dark:text-gray-400">•••</span>
                          )}
                          <button
                            onClick={() => handlePageClick(totalPages)}
                            className="min-w-[40px] h-10 flex items-center justify-center text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="h-10 px-4 flex items-center text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsTable;