export const safeJsonParse = (value: string | null, fallback: any = {}) => {
  if (!value || value === 'undefined' || value === 'null') return fallback;
  try {
    return JSON.parse(value);
  } catch (e) {
    console.error('Failed to parse JSON:', value, e);
    return fallback;
  }
};

export const getStoredUser = () => safeJsonParse(localStorage.getItem('neural_user'), {});
export const getStoredTheme = (fallback: any) => safeJsonParse(localStorage.getItem('neural_theme'), fallback);
