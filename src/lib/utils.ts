import bcrypt from 'bcryptjs'
import { Response } from 'express'
import jwt from 'jsonwebtoken'
import { UserType } from '../interfaces/types'
import { v4 as uuidv4 } from 'uuid';
import { transporte } from './mailer';


export const randomToken = () => {
    const myuuid = uuidv4();
    return myuuid;
}

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

type EmailData = {
    name: string,
    url: string,
    subject: string
}

export const getEmailTemplate = (type: typeEmail, data: EmailData ) => {
    switch (type){
        case 'password_reset':
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #2a7ae2;">🔐 Recupera tu cuenta</h2>
                    <p>Hola ${data.name || ''},</p>
                    <p>Has solicitud restablecer tu contraseña. Haz clic en el botón de abajo.</p>
                    <a href="${data.url}" style="background-color: #2a7ae2; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
                        Restablecer contraseña
                    </a>
                    <p>Si no lo solicitó, ignore este correo electrónico.</p>
                </div>
            `;
        default:
            return `<p>Unknow email type</p>`;
    }
}   

type typeEmail = "password_reset" | "email_verification"

export const getMinutes = () => {
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    return expires.toISOString();
}

export const sendMail = async ( to: string, typeEmail: typeEmail, data: EmailData ) => {
    const htmlContent = getEmailTemplate(typeEmail, data);
    const mailOptions: any = {
        from: `"Servidor API" <${process.env.GMAIL_USER}>`,
        to,
        subject: data.subject || "Mensaje del Sistema",
        html: htmlContent
    }
    await transporte.sendMail(mailOptions);
}