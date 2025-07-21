import bcrypt from 'bcryptjs'
import { Response } from 'express'
import jwt from 'jsonwebtoken'
import { UserType } from '../interfaces/types'

export const generateToken = (userId: number) => {
    const payload = {
        userId: userId
    }
    const token = jwt.sign(payload, <string>process.env.JWT_SECRET, {
        expiresIn: '7d'
    })
    return token
}

export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10)
    return await bcrypt.hash(password, salt)
}

export const handleServerError = (err: unknown, context: string, res: Response) => {
    if (err instanceof Error) {
        console.error(`❌ ${context}:`, err.message)
    } else {
        console.error(`❌ ${context}:`, err)
    }
    return res.status(500).json({message: "Ha ocurrido un error, intentar mas tarde"})
}

export function mapUserToUserType(user: any): UserType{
    return {
        id: Number(user.id),
        username: user.username,
        email: user.email,
        foto: user.foto ?? null,
        fecha_registro: user.fecha_registro,
        nombre: user.nombre,
        apellido: user.apellido,
        roles: {
            id: user.roles?.id,
            nombre: user.roles?.nombre
        }
    }
}

