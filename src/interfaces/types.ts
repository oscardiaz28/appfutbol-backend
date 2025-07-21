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
    username: string;
    email: string;
    foto: string | null;
    fecha_registro: any;
    nombre: string;
    apellido: string;
    roles: RoleType;
}