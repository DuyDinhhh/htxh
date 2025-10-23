import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const DUMMY_ROLES = [
  {
    id: 1,
    name: "Admin",
    description: "Toàn quyền hệ thống",
    permissions: ["Quản lý user", "Quản lý kiosk", "Xem báo cáo"],
  },
  {
    id: 2,
    name: "Manager",
    description: "Quản lý vận hành",
    permissions: ["Quản lý kiosk", "Xem báo cáo"],
  },
  {
    id: 3,
    name: "Staff",
    description: "Nhân viên vận hành",
    permissions: ["Xem báo cáo"],
  },
];

const Role = () => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    // Simulate loading dummy data
    setTimeout(() => {
      setRoles(DUMMY_ROLES);
    }, 500);
  }, []);

  return (
    <div className="container px-6 mx-auto grid">
      <h2 className="my-6 text-2xl font-semibold text-gray-700 text-center dark:text-gray-200">
        Roles
      </h2>
      <div className="w-full overflow-x-auto">
        <table className="w-full whitespace-no-wrap">
          <thead>
            <tr className="text-xs font-semibold tracking-wide text-left text-gray-500 uppercase border-b dark:border-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-800">
              <th className="px-4 py-3">Role Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Permissions</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y dark:divide-gray-700 dark:bg-gray-800">
            {roles.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8">
                  Loading...
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id} className="text-gray-700 dark:text-gray-400">
                  <td className="px-4 py-3 font-semibold">{role.name}</td>
                  <td className="px-4 py-3">{role.description}</td>
                  <td className="px-4 py-3">
                    <ul>
                      {role.permissions.map((perm, idx) => (
                        <li key={idx} className="text-xs">
                          • {perm}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-row items-center gap-2">
                      <Link
                        to={`/role/show/${role.id}`}
                        className="w-9 h-9 bg-blue-500 text-white hover:bg-blue-700 rounded-md flex items-center justify-center"
                        title="Show"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      </Link>
                      <Link
                        to={`/role/edit/${role.id}`}
                        className="w-9 h-9 bg-yellow-500 hover:bg-yellow-700 text-white rounded-md flex items-center justify-center"
                        title="Edit"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                          />
                        </svg>
                      </Link>
                      <Link
                        to={`/role/delete/${role.id}`}
                        className="w-9 h-9 bg-red-500 text-white hover:bg-red-700 rounded-md flex items-center justify-center"
                        title="Delete"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Role;
