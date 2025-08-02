import { z } from 'zod'
import { loginRequestSchema, playerRequestSchema, typeEvaluationRequestSchema, updatePlayerSchema } from '../lib/validations'

export type LoginRequestType = z.infer<typeof loginRequestSchema>;

export type PlayerRequestType = z.infer<typeof playerRequestSchema>;

export type UpdatePlayerType = z.infer<typeof updatePlayerSchema >;

export type TypeEvaluationRequestType = z.infer<typeof typeEvaluationRequestSchema>;

export type RoleType = {
    id: number;
    nombre: string;
}

export interface UserType {
    id: number;
    email: string;
    foto: string | null;
    fecha_registro: any;
    nombre: string;
    apellido: string;
    estado: boolean,
    rol: RoleType,
    permissions: string[]
}

export type UserResponseDto = Omit<UserType, 'permissions'>;


export interface PlayerDto{
    id: number,
    nombre: string,
    apellido: string,
    fecha_nacimiento: string | null,
    fecha_registro: string | null,
    identificacion: string,
    pais: string,
    monto: number,
    talla: number,
    peso: number,
    pie_habil: string,
    posicion: string,
    user_id: number,
    activo: boolean,
    prospecto: boolean
}