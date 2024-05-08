import { DateTime } from "luxon"

export interface Role{
    companyCode ?: string,
    roleId ?: number
    description ?: string
    creationDate ?: string | DateTime
    creationUser ?: string
    updateDate ?: string | DateTime
    updateUser ?: string
}