export interface SalesPerson<T = string>{
    id?: number
    name: T
    last_name: T
    phone_number: T
    email: T
}