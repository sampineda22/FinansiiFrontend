export interface User {
    id: number;
    personalCode: string;
    username: string;
    passwordHash: string;
    isTemporary: boolean;
    isActive: boolean;
    companyCode: string;
}

export interface UserDto {
    id: number;
    personalCode: string;
    username: string;
    name: string;
    passwordHash: string;
    isTemporary: boolean;
    isActive: boolean;
    companyCode: string;
}