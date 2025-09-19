import React from "react";

export const Card = ({ className = "", ...props }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-md ${className}`} {...props} />
  );
};

export const CardContent = ({ className = "", ...props }) => {
  return (
    <div className={`p-4 ${className}`} {...props} />
  );
};
