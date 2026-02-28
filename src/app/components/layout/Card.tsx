import React from 'react';

export function Card({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-3xl bg-white shadow-xl ring-1 ring-black/5 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`p-6 sm:p-8 lg:p-10 ${className}`}>{children}</div>;
}