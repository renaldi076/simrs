export interface AppError {
  code: string;
  message: string;
  module?: string;
  recoverable: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SelectOption {
  value: string;
  label: string;
}

export type CardColorScheme = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal' | 'pink' | 'indigo' | 'amber' | 'cyan' | 'emerald' | 'rose' | 'slate';
