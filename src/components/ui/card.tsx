import React from "react";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card: React.FC<CardProps> = ({ className = "", ...props }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-md ${className}`} {...props} />
  );
};

export const CardContent: React.FC<CardProps> = ({ className = "", ...props }) => {
  return (
    <div className={`p-4 ${className}`} {...props} />
  );
};
