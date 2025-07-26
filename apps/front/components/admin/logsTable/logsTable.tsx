"use client";
import React, { useState } from 'react';

const LogsTable = () => {
  const [logs, setLogs] = useState([
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
    }
  ]);

  const [filterLevel, setFilterLevel] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter logs based on selected level and search query
  const filteredLogs = logs.filter(log => {
    const matchesLevel = filterLevel === "ALL" || log.level === filterLevel;
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.service.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  // Resolve a log entry
  const resolveLog = (id: number) => {
    setLogs(logs.map(log => 
      log.id === id ? { ...log, status: "Resolved" } : log
    ));
  };

  return (
    <div className=" dark:bg-gray-900 p-4 md:p-6 rounded-xl">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">System Logs</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitor and manage system logs in real-time
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
              </div>
              <input
                type="text"
                className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select 
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-auto p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
            >
              <option value="ALL">All Levels</option>
              <option value="ERROR">Error</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
              <option value="DEBUG">Debug</option>
            </select>
          </div>
        </div>
        
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Timestamp</th>
                <th scope="col" className="px-6 py-3">Level</th>
                <th scope="col" className="px-6 py-3">Service</th>
                <th scope="col" className="px-6 py-3">Message</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-mono text-xs">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.level === "ERROR" 
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" 
                        : log.level === "WARNING" 
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          : log.level === "INFO" 
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                    }`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                      {log.service}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="truncate w-48 md:w-auto" title={log.message}>
                      {log.message}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      log.status === "Resolved" 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                        : log.status === "Monitoring" 
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => resolveLog(log.id)}
                        disabled={log.status === "Resolved"}
                        className={`font-medium text-sm px-3 py-1 rounded ${
                          log.status === "Resolved" 
                            ? "text-gray-400 cursor-not-allowed" 
                            : "text-green-600 hover:bg-green-100 dark:text-green-500 dark:hover:bg-gray-700"
                        }`}
                      >
                        Resolve
                      </button>
                      <button className="font-medium text-blue-600 hover:text-blue-900 dark:text-blue-500 dark:hover:text-blue-300 text-sm px-3 py-1">
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No logs found</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-700 dark:text-gray-400 mb-4 md:mb-0">
            Showing <span className="font-semibold">{filteredLogs.length}</span> of <span className="font-semibold">{logs.length}</span> logs
          </div>
          <div className="inline-flex rounded-md shadow-sm">
            <button className="px-3 py-1.5 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">
              Previous
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">
              1
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">
              2
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-r-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogsTable;