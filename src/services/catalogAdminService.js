import { apiFetch } from './api.js'

const RESOURCE_BY_TYPE = {
  productTypes: 'product-types',
  finishes: 'finishes',
  laminations: 'laminations',
  paymentMethods: 'payment-methods',
  incomeCategories: 'income-categories',
  expenseCategories: 'expense-categories',
}

export const catalogAdminService = {
  list: (type) => apiFetch(`/catalogs/${RESOURCE_BY_TYPE[type]}`),
  create: (type, name) => apiFetch(`/catalogs/${RESOURCE_BY_TYPE[type]}`, { method: 'POST', body: { name } }),
  update: (type, id, { name, active }) =>
    apiFetch(`/catalogs/${RESOURCE_BY_TYPE[type]}/${id}`, { method: 'PUT', body: { name, active } }),
}
