export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

export const truncateText = (text, maxLength = 100) =>
  text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
