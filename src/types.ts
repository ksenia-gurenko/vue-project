// src/types/api.ts
export interface Income {
  date: string
  lastChangeDate: string
  supplierArticle: string
  techSize: string
  barcode: string
  quantity: number
  totalPrice: number
  dateClose: string
  warehouseName: string
  nmId: number
  status: string
}

export interface Order {
  date: string
  lastChangeDate: string
  supplierArticle: string
  techSize: string
  barcode: string
  totalPrice: number
  discountPercent: number
  warehouseName: string
  oblast: string
  incomeID: number
  odid: number
  nmId: number
  subject: string
  category: string
  brand: string
  isCancel: boolean
  cancel_dt: string
  gNumber: string
  sticker: string
}

export interface Sale {
  date: string
  lastChangeDate: string
  supplierArticle: string
  techSize: string
  barcode: string
  totalPrice: number
  discountPercent: number
  isSupply: boolean
  isRealization: boolean
  promoCodeDiscount: number
  warehouseName: string
  countryName: string
  oblastOkrugName: string
  regionName: string
  incomeID: number
  saleID: string
  odid: number
  spp: number
  forPay: number
  finishedPrice: number
  priceWithDisc: number
  nmId: number
  subject: string
  category: string
  brand: string
  isStorno: number
  gNumber: string
  sticker: string
}

export interface Stock {
  lastChangeDate: string
  supplierArticle: string
  techSize: string
  barcode: string
  quantity: number
  isSupply: boolean
  isRealization: boolean
  quantityFull: number
  warehouseName: string
  inWayToClient: number
  inWayFromClient: number
  nmId: number
  subject: string
  category: string
  daysOnSite: number
  brand: string
  SCCode: string
  Price: number
  Discount: number
}
