import React from "react";

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
}

const AdminCard: React.FC<AdminCardProps> = ({ children, className = "p-6" }) => {
  return (
    <div className={`bg-gray-100 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {children}
    </div>
  );
};

export default AdminCard;
